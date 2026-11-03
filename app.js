"use strict";

/* Browser storage can be blocked, so every page has to work without it. */
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* not saved */ } },
  remove(key) { try { localStorage.removeItem(key); } catch { /* nothing to clear */ } },
};

/* ---------- Theme ---------- */

const THEME_KEY = "cyber-roadmaps:theme";
const themeButton = document.getElementById("theme-toggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function currentTheme() {
  return document.documentElement.dataset.theme || (prefersDark.matches ? "dark" : "light");
}

function labelThemeButton() {
  if (!themeButton) return;
  const next = currentTheme() === "dark" ? "light" : "dark";
  themeButton.setAttribute("aria-label", `Switch to ${next} theme`);
  themeButton.title = `Switch to ${next} theme`;
}

if (themeButton) {
  themeButton.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store.set(THEME_KEY, next);
    labelThemeButton();
    window.dispatchEvent(new Event("themechange"));
  });
  prefersDark.addEventListener("change", labelThemeButton);
  labelThemeButton();
}

/* ---------- Certification filters ---------- */

const certFilters = document.getElementById("cert-filters");

if (certFilters) {
  const cards = [...document.querySelectorAll(".cert")];
  const count = document.getElementById("cert-count");
  const chosen = { track: "all", level: "all" };

  const apply = () => {
    let shown = 0;
    for (const card of cards) {
      const tracks = card.dataset.track.split(" ");
      const fits = (chosen.track === "all" || tracks.includes(chosen.track)) &&
        (chosen.level === "all" || card.dataset.level === chosen.level);
      card.hidden = !fits;
      if (fits) shown++;
    }
    count.textContent = `Showing ${shown} of ${cards.length}`;
  };

  certFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    const group = button.dataset.filter;
    chosen[group] = button.dataset.value;
    for (const other of certFilters.querySelectorAll(`button[data-filter="${group}"]`)) {
      other.setAttribute("aria-pressed", String(other === button));
    }
    apply();
  });

  certFilters.hidden = false;
  apply();
}
