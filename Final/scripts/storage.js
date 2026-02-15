const THEME_KEY = "nb_theme";
const FAV_KEY = "nb_favorites";

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

export function setTheme(value) {
  localStorage.setItem(THEME_KEY, value);
}

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function toggleFavorite(id) {
  const favs = new Set(getFavorites());
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  const next = Array.from(favs);
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  return next;
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}
