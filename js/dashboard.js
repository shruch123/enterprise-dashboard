document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-open-dialog]").forEach(button => {
    const dialog = document.querySelector(button.getAttribute("data-target") || "#confirm-dialog");
    if (dialog) button.addEventListener("click", () => dialog.showModal());
  });
  document.querySelectorAll("[data-close-dialog]").forEach(button => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });
  const form = document.querySelector("#profile-form");
  const status = document.querySelector("#form-status");
  if (form && status) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.textContent = "Profile changes saved.";
    });
  }
});
