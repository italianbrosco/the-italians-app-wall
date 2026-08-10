(function () {
  "use strict";

  const catalog = Array.isArray(window.APP_CATALOG) ? window.APP_CATALOG : [];
  const grid = document.querySelector("#app-grid");
  const summary = document.querySelector("#results-summary");
  const filters = Array.from(document.querySelectorAll("[data-filter]"));

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const platformMarkup = (platforms) => {
    if (!platforms.length) return "";
    return `<div class="platforms">${platforms
      .map(
        (platform) =>
          `<span class="platform platform-${escapeHtml(platform.kind)}">${escapeHtml(platform.label)}</span>`
      )
      .join("")}</div>`;
  };

  const actionMarkup = (app) => {
    if (!app.actions.length) {
      return `<span class="release-note"><i aria-hidden="true"></i>Release updates coming soon</span>`;
    }

    return app.actions
      .map(
        (action) =>
          `<a class="card-action" href="${escapeHtml(action.href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(action.label)} for ${escapeHtml(app.name)}">${escapeHtml(action.label)} <span aria-hidden="true">↗</span></a>`
      )
      .join("");
  };

  const cardMarkup = (app, index) => `
    <article class="app-card accent-${escapeHtml(app.accent)}" data-status="${escapeHtml(app.status)}">
      <div class="card-index">${String(index + 1).padStart(2, "0")}</div>
      <div class="card-topline">
        <span class="category">${escapeHtml(app.category)}</span>
        <span class="status status-${escapeHtml(app.status)}"><i aria-hidden="true"></i>${escapeHtml(app.statusLabel)}</span>
      </div>
      <div class="app-identity">
        <img class="app-icon" src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)} app icon" loading="lazy" width="384" height="384" />
        <div>
          <h3>${escapeHtml(app.name)}</h3>
          ${platformMarkup(app.platforms)}
        </div>
      </div>
      <p class="app-description">${escapeHtml(app.description)}</p>
      <div class="card-footer">${actionMarkup(app)}</div>
    </article>`;

  function renderCatalog(filter) {
    const visible = filter === "all" ? catalog : catalog.filter((app) => app.status === filter);
    grid.innerHTML = visible.map(cardMarkup).join("");
    summary.textContent = `${visible.length} ${visible.length === 1 ? "product" : "products"}`;

    filters.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function updateCounts() {
    ["available", "coming"].forEach((status) => {
      const target = document.querySelector(`[data-count="${status}"]`);
      if (target) target.textContent = String(catalog.filter((app) => app.status === status).length);
    });
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => renderCatalog(button.dataset.filter));
  });

  document.querySelector("#year").textContent = String(new Date().getFullYear());
  renderCatalog("all");
  updateCounts();
})();
