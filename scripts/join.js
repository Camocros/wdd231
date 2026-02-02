// =========================
// Timestamp (hidden field)
// =========================
const ts = document.querySelector("#timestamp");
if (ts) {
  ts.value = new Date().toISOString();
}

// =========================
// Modals (dialog)
// - open on link click
// - close on button click, ESC, backdrop click
// =========================
const modalLinks = document.querySelectorAll(".modal-link");
const closeButtons = document.querySelectorAll(".modal-close");

modalLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const id = link.dataset.modal;
    const dialog = document.querySelector(`#${id}`);
    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
});

closeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const dialog = btn.closest("dialog");
    if (dialog) dialog.close();
  });
});

document.querySelectorAll("dialog.modal").forEach(dialog => {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
});

