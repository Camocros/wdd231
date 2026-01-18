// ---------- Footer dates ----------
const yearSpan = document.querySelector("#year");
const lastModifiedSpan = document.querySelector("#lastModified");

if (yearSpan) yearSpan.textContent = new Date().getFullYear();
if (lastModifiedSpan) lastModifiedSpan.textContent = document.lastModified;

// ---------- Mobile menu ----------
const menuBtn = document.querySelector("#menuBtn");
const primaryNav = document.querySelector("#primaryNav");

if (menuBtn && primaryNav) {
  menuBtn.addEventListener("click", () => {
    primaryNav.classList.toggle("open");

    const isOpen = primaryNav.classList.contains("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });
}

// ---------- Directory: fetch members + render ----------
const membersContainer = document.querySelector("#members");
const gridBtn = document.querySelector("#gridBtn");
const listBtn = document.querySelector("#listBtn");
const viewStatus = document.querySelector("#viewStatus");

async function getMembers() {
  try {
    const response = await fetch("data/members.json");
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();

    // Support either { "members": [...] } OR just [...]
    const members = Array.isArray(data) ? data : data.members;

    displayMembers(members);
  } catch (error) {
    console.error("Error loading members:", error);
    if (membersContainer) {
      membersContainer.innerHTML = `<p>Sorry, member data could not be loaded.</p>`;
    }
  }
}

function displayMembers(members) {
  if (!membersContainer) return;

  membersContainer.innerHTML = "";

  members.forEach((m) => {
    const card = document.createElement("section");
    card.className = "member-card";

    const name = document.createElement("h3");
    name.textContent = m.name;

    const img = document.createElement("img");
    img.src = `images/${m.image}`;
    img.alt = `${m.name} logo`;
    img.loading = "lazy";
    img.width = 300;
    img.height = 200;

    const address = document.createElement("p");
    address.textContent = m.address;

    const phone = document.createElement("p");
    phone.textContent = m.phone;

    const link = document.createElement("a");
    link.href = m.website;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Visit Website";

    const level = document.createElement("p");
    level.textContent = `Membership Level: ${m.membershipLevel}`;

    card.append(img, name, address, phone, link, level);
    membersContainer.appendChild(card);
  });
}

// ---------- Grid/List toggle ----------
function setView(view) {
  if (!membersContainer) return;

  membersContainer.classList.remove("grid", "list");
  membersContainer.classList.add(view);

  if (viewStatus) {
    viewStatus.textContent = `Viewing members in ${view.toUpperCase()} mode.`;
  }
}

if (gridBtn) gridBtn.addEventListener("click", () => setView("grid"));
if (listBtn) listBtn.addEventListener("click", () => setView("list"));

// Default view
setView("grid");

// Load data
getMembers();