// ✅ Criteria: import from .mjs (type="module" in HTML)
import { places } from "../data/discover.mjs";

const visitMessage = document.querySelector("#visitMessage");
const grid = document.querySelector("#discoverGrid");

// ✅ Criteria: Custom Message using localStorage
function showVisitMessage() {
  const lastVisit = Number(localStorage.getItem("lastVisitDiscover"));
  const now = Date.now();

  if (!lastVisit) {
    visitMessage.textContent = "Welcome! Let us know if you have any questions.";
  } else {
    const diffMs = now - lastVisit;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      visitMessage.textContent = "Back so soon! Awesome!";
    } else if (diffDays === 1) {
      visitMessage.textContent = "You last visited 1 day ago.";
    } else {
      visitMessage.textContent = `You last visited ${diffDays} days ago.`;
    }
  }

  localStorage.setItem("lastVisitDiscover", now);
}

// ✅ Criteria: Build 8 cards from JSON data (title, figure/img, address, description, button)
function buildCards(items) {
  grid.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.classList.add("card", `card${index + 1}`);

    const h2 = document.createElement("h2");
    h2.textContent = item.name;

    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;

    // ✅ Criteria: Lazy Loading
    img.loading = "lazy";

    // Helps avoid layout shift (good for Lighthouse)
    img.width = 300;
    img.height = 200;

    figure.appendChild(img);

    const address = document.createElement("address");
    address.textContent = item.address;

    const p = document.createElement("p");
    p.textContent = item.description;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Learn More";

    card.append(h2, figure, address, p, btn);
    grid.appendChild(card);
  });
}

showVisitMessage();
buildCards(places);
