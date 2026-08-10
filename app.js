(function () {
  "use strict";

  const catalog = Array.isArray(window.APP_CATALOG) ? window.APP_CATALOG : [];
  const upcoming = catalog.filter((app) => app.status !== "available");
  const grid = document.querySelector("#app-grid");

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const cardMarkup = (app) => `
    <article class="app-card accent-${escapeHtml(app.accent)}">
      <div class="app-card-top">
        <img class="app-icon" src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)} app icon" loading="lazy" width="384" height="384" />
        <span class="category">${escapeHtml(app.category)}</span>
      </div>
      <h3>${escapeHtml(app.name)}</h3>
      <p>${escapeHtml(app.description)}</p>
      <div class="release-note"><i aria-hidden="true"></i>Release updates coming soon</div>
    </article>`;

  if (grid) grid.innerHTML = upcoming.map(cardMarkup).join("");

  document.querySelectorAll("[data-total-count]").forEach((node) => {
    node.textContent = String(catalog.length);
  });
  document.querySelectorAll("[data-upcoming-count]").forEach((node) => {
    node.textContent = String(upcoming.length);
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
