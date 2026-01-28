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
   - Icon
   - Humidity
   - Wind
   - 3-day temperature forecast
========================= */
const weatherIcon = document.querySelector("#weatherIcon");
const tempNow = document.querySelector("#tempNow");
const weatherDesc = document.querySelector("#weatherDesc");
const humidityEl = document.querySelector("#humidity");
const windEl = document.querySelector("#wind");
const forecastList = document.querySelector("#forecastList");

// Cali, Colombia
const lat = 3.4516;
const lon = -76.5320;

// Celsius
const units = "metric";

// API Key (may take hours to activate)
const apiKey = "fe9b0d50e2c2a78f9a74be554339e225";

/* ✅ Pending message in the right place:
   Only show this if the page is still at "Loading..." before we fetch.
*/
if (weatherDesc && weatherDesc.textContent.trim().toLowerCase() === "loading...") {
  weatherDesc.textContent =
    "Weather data pending: OpenWeatherMap key is still activating. Please refresh later.";
}

function capitalizeWords(str) {
  return String(str)
    .split(" ")
    .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData?.message ? ` - ${errData.message}` : "";
    throw new Error(`OpenWeather error ${res.status}${msg}`);
  }
  return res.json();
}

async function getWeather() {
  if (!apiKey) {
    if (weatherDesc) weatherDesc.textContent = "Missing OpenWeatherMap API key.";
    return;
  }

  try {
    // CURRENT
    const currentURL =
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;

    const currentData = await fetchJson(currentURL);

    const temp = Math.round(currentData.main.temp);
    const desc = capitalizeWords(currentData.weather?.[0]?.description || "N/A");
    const icon = currentData.weather?.[0]?.icon || "";

    if (tempNow) tempNow.textContent = temp;
    if (weatherDesc) weatherDesc.textContent = desc;
    if (humidityEl) humidityEl.textContent = currentData.main.humidity ?? "--";
    if (windEl) windEl.textContent = Math.round(currentData.wind?.speed ?? 0);

    if (weatherIcon && icon) {
      weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      weatherIcon.alt = desc;
      weatherIcon.loading = "lazy";
    }

    // FORECAST (5-day/3-hour)
    const forecastURL =
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;

    const forecastData = await fetchJson(forecastURL);

    // Pick 3 unique days, prefer 12:00
    const picked = [];
    const seenDays = new Set();

    for (const item of forecastData.list) {
      const dt = item.dt_txt;        // "YYYY-MM-DD HH:MM:SS"
      const hour = dt.slice(11, 13); // "12"
      const dayKey = dt.slice(0, 10);

      if (hour === "12" && !seenDays.has(dayKey)) {
        seenDays.add(dayKey);
        picked.push(item);
      }
      if (picked.length === 3) break;
    }

    // fallback if needed
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
        li.innerHTML = `<span>${day}</span><strong>${t}°C</strong>`;
        forecastList.appendChild(li);
      });
    }

  } catch (err) {
    // Show real error in the UI
    if (weatherDesc) weatherDesc.textContent = String(err.message || err);
    if (forecastList) forecastList.innerHTML = `<li>Forecast unavailable.</li>`;
    console.error(err);
  }
}

getWeather();

/* =========================
   SPOTLIGHTS (chamber.json)
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
    // ✅ changed here to chamber.json
    const res = await fetch("data/chamber.json");
    if (!res.ok) throw new Error("chamber.json not found. Check path: chamber/data/chamber.json");

    const data = await res.json();

    // supports: { "members": [...] } OR { "companies": [...] } OR just [...]
    const members = Array.isArray(data)
      ? data
      : (data.members || data.companies || []);

    const eligible = members.filter(m => {
      const level = String(m.membershipLevel || m.level || "").toLowerCase();
      return level.includes("gold") || level.includes("silver");
    });

    if (eligible.length === 0) {
      spotlightGrid.innerHTML = "<p>No Gold/Silver members found in chamber.json.</p>";
      return;
    }

    const howMany = Math.random() < 0.5 ? 2 : 3;
    const selected = shuffleArray(eligible).slice(0, howMany);

    spotlightGrid.innerHTML = "";
    selected.forEach(m => spotlightGrid.appendChild(buildSpotlightCard(m)));

  } catch (err) {
    spotlightGrid.innerHTML = `<p>Spotlights unavailable: ${String(err.message || err)}</p>`;
    console.error(err);
  }
}

loadSpotlights();
