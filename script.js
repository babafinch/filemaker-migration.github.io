// API Gateway URL — replace after first `sam deploy`.
// Example: "https://abc123.execute-api.us-east-1.amazonaws.com"
var API_URL = "https://2etw457su7.execute-api.us-east-1.amazonaws.com";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("assessmentForm");
  var success = document.getElementById("formSuccess");

  // DDR help toggle
  var helpBtn = document.getElementById("ddrHelpBtn");
  var helpBox = document.getElementById("ddrHelp");
  if (helpBtn && helpBox) {
    helpBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      helpBox.classList.toggle("visible");
    });
    helpBtn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        helpBox.classList.toggle("visible");
      }
    });
  }

  if (!form || !success) return;

  var submitBtn = form.querySelector('button[type="submit"]');
  var statusEl = null;

  function showError(message) {
    clearStatus();
    var div = document.createElement("div");
    div.className = "form-error";
    div.setAttribute("role", "alert");
    div.textContent = message;
    form.appendChild(div);
    statusEl = div;
  }

  function showStatus(message) {
    clearStatus();
    var div = document.createElement("div");
    div.className = "upload-status";
    div.textContent = message;
    form.appendChild(div);
    statusEl = div;
  }

  function clearStatus() {
    if (statusEl && statusEl.parentNode) statusEl.parentNode.removeChild(statusEl);
    statusEl = null;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearStatus();

    if (!API_URL) {
      showError("Form is not yet configured. Please email hello@filemaker-migration.com directly.");
      return;
    }

    var data = new FormData(form);
    var file = data.get("ddr");
    var hasFile = file && file.size > 0;

    if (submitBtn) submitBtn.disabled = true;

    try {
      var fileKey = null;

      if (hasFile) {
        if (file.size > 50 * 1024 * 1024) {
          throw new Error("File is larger than 50MB. Please compress further or email it to hello@filemaker-migration.com.");
        }
        showStatus("Preparing upload…");
        var presign = await postJSON(API_URL + "/presign", { filename: file.name });
        if (!presign.uploadUrl) throw new Error("Could not prepare file upload.");
        fileKey = presign.key;

        showStatus("Uploading file…");
        var uploadResp = await fetch(presign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/zip" },
          body: file,
        });
        if (!uploadResp.ok) throw new Error("File upload failed. Please try again.");
      }

      showStatus("Sending your request…");
      await postJSON(API_URL + "/submit", {
        name: data.get("name"),
        email: data.get("email"),
        company: data.get("company"),
        users: data.get("users"),
        description: data.get("description"),
        website: data.get("website"), // honeypot
        fileKey: fileKey,
      });

      clearStatus();
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "center" });

      // Google Ads conversion tracking
      if (typeof gtag === "function") {
        gtag('event', 'conversion', {
          'send_to': 'AW-18123390845/PVA4CL2syaMcEP3-88FD',
          'value': 1.0,
          'currency': 'CAD'
        });
      }
    } catch (err) {
      console.error(err);
      showError(err.message || "Something went wrong. Please try again or email hello@filemaker-migration.com.");
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});

async function postJSON(url, body) {
  var resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  var json = {};
  try { json = await resp.json(); } catch (_) {}
  if (!resp.ok) {
    throw new Error(json.error || ("Request failed (" + resp.status + ")"));
  }
  return json;
}
