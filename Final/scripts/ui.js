import { isFavorite, toggleFavorite } from "./storage.js";

function esc(str) {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function fillCategoryOptions(programs, selectEl) {
  const cats = Array.from(new Set(programs.map(p => p.category))).sort();
  const options = ['<option value="all">All</option>']
    .concat(cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`));
  selectEl.innerHTML = options.join("");
}

export function renderPrograms(programs, container) {
  container.innerHTML = programs.map(p => cardTemplate(p)).join("");
}

function cardTemplate(p) {
  const fav = isFavorite(p.id);
  return `
    <article class="card" data-id="${esc(p.id)}">
      <div class="card__top">
        <h3 class="card__title">${esc(p.title)}</h3>
        <span class="pill">${esc(p.category)}</span>
      </div>

      <p class="card__meta">
        <strong>Age:</strong> ${esc(p.ageRange)} · <strong>Goal:</strong> ${esc(p.goal)}
      </p>

      <div class="card__actions">
        <button class="btn" type="button" data-action="details">View details</button>
        <button class="btn btn--ghost" type="button" data-action="fav" aria-pressed="${fav}">
          ${fav ? "★ Saved" : "☆ Save"}
        </button>
      </div>
    </article>
  `;
}

export function wireCatalogEvents({ root, programs, dialog, onChange }) {
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const card = btn.closest(".card");
    const id = card?.dataset?.id;
    const item = programs.find(p => p.id === id);
    if (!item) return;

    const action = btn.dataset.action;

    if (action === "details") {
      openDialog(dialog, item);
    }

    if (action === "fav") {
      const nextFavs = toggleFavorite(id);
      btn.setAttribute("aria-pressed", nextFavs.includes(id));
      btn.textContent = nextFavs.includes(id) ? "★ Saved" : "☆ Save";
    }

    onChange?.();
  });
}

function openDialog(dialog, item) {
  const steps = item.steps?.map(s => `<li>${esc(s)}</li>`).join("") ?? "";
  dialog.querySelector("[data-modal-title]").textContent = item.title;
  dialog.querySelector("[data-modal-body]").innerHTML = `
    <p><strong>Category:</strong> ${esc(item.category)}</p>
    <p><strong>Age range:</strong> ${esc(item.ageRange)}</p>
    <p><strong>Goal:</strong> ${esc(item.goal)}</p>
    <h4>Steps</h4>
    <ol>${steps}</ol>
    <p class="muted"><strong>Tip:</strong> ${esc(item.tip)}</p>
  `;
  dialog.showModal();
}
