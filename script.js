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

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // In production, replace this with an actual form submission
    // (e.g., fetch to your backend, Formspree, Netlify Forms, etc.)
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
