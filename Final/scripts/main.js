import { getTheme, setTheme } from "./storage.js";
import { fetchPrograms } from "./api.js";
import { fillCategoryOptions, renderPrograms, wireCatalogEvents } from "./ui.js";

initTheme();

const page = document.body.dataset.page;

if (page === "catalog") initCatalog();
if (page === "contact") initContact();

function initTheme() {
  const themeToggle = document.querySelector("#themeToggle");
  const theme = getTheme();
  document.documentElement.dataset.theme = theme;

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", theme === "dark");
    themeToggle.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      setTheme(next);
      themeToggle.setAttribute("aria-pressed", next === "dark");
      themeToggle.textContent = next === "dark" ? "🌙 Dark" : "☀️ Light";
    });
  }
}

async function initCatalog() {
  const listEl = document.querySelector("#programList");
  const filterEl = document.querySelector("#categoryFilter");
  const statusEl = document.querySelector("#status");
  const dialog = document.querySelector("#detailsDialog");

  const programs = await fetchPrograms("./data/programs.json");

  if (!programs.length) {
    statusEl.textContent = "Could not load data. Please try again.";
    return;
  }

  fillCategoryOptions(programs, filterEl);
  apply();

  filterEl.addEventListener("change", apply);

  wireCatalogEvents({
    root: listEl,
    programs,
    dialog,
    onChange: () => {}
  });

  dialog.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) dialog.close();
  });

  function apply() {
    const val = filterEl.value;
    const filtered = val === "all" ? programs : programs.filter(p => p.category === val);
    renderPrograms(filtered, listEl);
    statusEl.textContent = `${filtered.length} strategies shown.`;
  }
}

function initContact() {
  // Optional: live character count or small UX helpers.
}
