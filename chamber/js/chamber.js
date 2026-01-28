/* =========================
   Responsive Menu
========================= */
const menuBtn = document.querySelector("#menuBtn");
const primaryNav = document.querySelector("#primaryNav");

if (menuBtn && primaryNav) {
  menuBtn.addEventListener("click", () => {
    const open = primaryNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
}

/* =========================
   Footer Dates
========================= */
const yearEl = document.querySelector("#currentyear");
const modEl = document.querySelector("#lastModified");

if (yearEl) yearEl.textContent = new Date().getFullYear();
if (modEl) modEl.textContent = `Last Modified: ${document.lastModified}`;

/* =========================
   WEATHER (OpenWeatherMap)
   - Current temp
   - Description
   - 3-day forecast
========================= */
const weatherIcon = document.querySelector("#weatherIcon");
const tempNow = document.querySelector("#tempNow");
const weatherDesc = document.querySelector("#weatherDesc");
const humidityEl = document.querySelector("#humidity");
const windEl = document.querySelector("#wind");
const forecastList = document.querySelector("#forecastList");

// TODO: Put YOUR real chamber location here:
const lat = 16.7666;   // example (Timbuktu-ish). Replace with your chamber city's lat
const lon = -3.0026;   // example. Replace with your chamber city's lon
const units = "imperial"; // "metric" for Celsius
const apiKey = "YOUR_OPENWEATHERMAP_KEY";

function capitalizeWords(str) {
  return str
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDayLabel(dateStr) {
  // dateStr example: "2026-01-27 12:00:00"
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

async function getWeather() {
  if (!apiKey || apiKey === "YOUR_OPENWEATHERMAP_KEY") {
    if (weatherDesc) weatherDesc.textContent = "Add your OpenWeatherMap API key in chamber.js";
    return;
  }

  try {
    // CURRENT
    const currentURL =
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;

    const currentRes = await fetch(currentURL);
    if (!currentRes.ok) throw new Error("Current weather request failed.");
    const currentData = await currentRes.json();

    const temp = Math.round(currentData.main.temp);
    const desc = capitalizeWords(currentData.weather[0].description);
    const icon = currentData.weather[0].icon;

    if (tempNow) tempNow.textContent = temp;
    if (weatherDesc) weatherDesc.textContent = desc;
    if (humidityEl) humidityEl.textContent = currentData.main.humidity;
    if (windEl) windEl.textContent = Math.round(currentData.wind.speed);

    if (weatherIcon) {
      weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      weatherIcon.alt = desc;
      weatherIcon.loading = "lazy";
    }

    // FORECAST (5-day/3-hour) -> pick one item per day
    const forecastURL =
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;

    const forecastRes = await fetch(forecastURL);
    if (!forecastRes.ok) throw new Error("Forecast request failed.");
    const forecastData = await forecastRes.json();

    // We select around 12:00 each next day, 3 days total
    const picked = [];
    const seenDays = new Set();

    for (const item of forecastData.list) {
      const dt = item.dt_txt; // "YYYY-MM-DD HH:MM:SS"
      const hour = dt.slice(11, 13);
      const dayKey = dt.slice(0, 10);

      // choose midday samples if possible
      if (hour === "12" && !seenDays.has(dayKey)) {
        seenDays.add(dayKey);
        picked.push(item);
      }
      if (picked.length === 3) break;
    }

    // fallback: if not enough midday hits, pick first unique days
    if (picked.length < 3) {
      for (const item of forecastData.list) {
        const dayKey = item.dt_txt.slice(0, 10);
        if (!seenDays.has(dayKey)) {
          seenDays.add(dayKey);
          picked.push(item);
        }
        if (picked.length === 3) break;
      }
    }

    if (forecastList) {
      forecastList.innerHTML = "";
      picked.forEach(item => {
        const li = document.createElement("li");
        const day = formatDayLabel(item.dt_txt);
        const t = Math.round(item.main.temp);

        li.innerHTML = `<span>${day}</span><strong>${t}°</strong>`;
        forecastList.appendChild(li);
      });
    }

  } catch (err) {
    if (weatherDesc) weatherDesc.textContent = "Weather unavailable right now.";
    if (forecastList) forecastList.innerHTML = "<li>Forecast unavailable.</li>";
    console.error(err);
  }
}

getWeather();

/* =========================
   SPOTLIGHTS (members.json)
   - fetch + async/await
   - gold/silver only
   - random 2 or 3 each load
========================= */
const spotlightGrid = document.querySelector("#spotlightGrid");

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildSpotlightCard(member) {
  const card = document.createElement("article");
  card.className = "spotlight-card";

  const logoSrc = member.logo || member.image || "";
  const name = member.name || "Member";
  const level = member.membershipLevel || member.level || "Member";
  const phone = member.phone || "N/A";
  const address = member.address || "N/A";
  const website = member.website || "#";

  card.innerHTML = `
    <h3>${name}</h3>
    ${logoSrc ? `<img class="logo" src="${logoSrc}" alt="${name} logo" loading="lazy">` : ""}
    <p><strong>Level:</strong> ${level}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Address:</strong> ${address}</p>
    <p><a href="${website}" target="_blank" rel="noopener noreferrer">${website}</a></p>
  `;
  return card;
}

async function loadSpotlights() {
  if (!spotlightGrid) return;

  try {
    const res = await fetch("data/members.json");
    if (!res.ok) throw new Error("members.json not found.");
    const data = await res.json();

    // Your JSON might be { "members": [...] } or just [...]
    const members = Array.isArray(data) ? data : (data.members || []);

    const eligible = members.filter(m => {
      const level = String(m.membershipLevel || m.level || "").toLowerCase();
      return level.includes("gold") || level.includes("silver");
    });

    const howMany = Math.random() < 0.5 ? 2 : 3;
    const selected = shuffleArray(eligible).slice(0, howMany);

    spotlightGrid.innerHTML = "";
    selected.forEach(m => spotlightGrid.appendChild(buildSpotlightCard(m)));

  } catch (err) {
    spotlightGrid.innerHTML = "<p>Spotlights unavailable.</p>";
    console.error(err);
  }
}

loadSpotlights();
