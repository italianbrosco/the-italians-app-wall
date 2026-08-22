(function () {
  "use strict";

  const catalog = Array.isArray(window.APP_CATALOG) ? window.APP_CATALOG : [];
  const grid = document.querySelector("#app-grid");
  const featuredOrder = [
    "calcspace",
    "mortgage-calculator",
    "dream-journal",
    "deal-analyzer",
    "are-you-human",
    "get-in-line",
    "road-trip-arcade",
    "marbles",
    "blackwake-21",
    "dont-touch-red",
    "one-more",
    "clay-scorecard",
    "easy-audio-notes",
    "echobeat",
    "eyes-up",
    "real-or-ai",
    "hundred",
    "abc-smash",
    "pollwar",
    "super-game",
    "tin-wings"
  ];
  const byId = new Map(catalog.map((app) => [app.id, app]));
  const orderedCatalog = window.orderAppCatalog(catalog, featuredOrder);
  const priorityIds = new Set(orderedCatalog.slice(0, 6).map((app) => app.id));

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const appAction = (app) => {
    const action = Array.isArray(app.actions) ? app.actions[0] : null;
    if (app.status === "available" && action) {
      return `<a class="card-arrow" href="${escapeHtml(action.href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(action.label)}"><span aria-hidden="true">→</span></a>`;
    }
    return `<button class="card-arrow" type="button" data-app-details="${escapeHtml(app.id)}" aria-label="Learn more about ${escapeHtml(app.name)}"><span aria-hidden="true">→</span></button>`;
  };

  const cardMarkup = (app) => {
    const status = app.status === "available" ? "Available on the App Store" : "Release updates coming soon";
    const imagePriority = priorityIds.has(app.id)
      ? 'loading="eager" fetchpriority="high"'
      : 'loading="lazy"';
    const isLandscape = app.id === "tin-wings" || app.id === "marbles";
    const screenshotWidth = isLandscape ? 900 : 520;
    const screenshotHeight = isLandscape ? 414 : 1128;

    return `
      <article class="app-panel accent-${escapeHtml(app.accent)}${isLandscape ? " has-landscape-preview" : ""}">
        <div class="app-summary">
          <img class="app-icon" src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)} app icon" ${imagePriority} width="384" height="384" />
          <div class="app-copy">
            <span class="app-category">${escapeHtml(app.category)}</span>
            <h3>${escapeHtml(app.name)}</h3>
            <p>${escapeHtml(app.description)}</p>
            <small><i aria-hidden="true"></i>${escapeHtml(status)}</small>
          </div>
        </div>
        ${appAction(app)}
        <figure class="phone-preview${isLandscape ? " phone-preview-landscape" : ""}">
          <img
            class="app-screenshot"
            src="${escapeHtml(app.screenshot)}"
            alt="${escapeHtml(app.screenshotAlt)}"
            ${imagePriority}
            width="${screenshotWidth}"
            height="${screenshotHeight}"
          />
        </figure>
      </article>`;
  };

  const supportMarkup = () => `
    <article class="support-panel" aria-labelledby="support-title">
      <img src="/assets/brand/italian-bros-support-transparent.png" alt="" width="900" height="681" loading="lazy" />
      <div>
        <h3 id="support-title">Need a hand?</h3>
        <p>Questions, feedback, or help with one of our apps? You’ll reach the brothers who build them.</p>
        <a href="mailto:italianbrosco@proton.me">Email us at italianbrosco@proton.me <span aria-hidden="true">→</span></a>
      </div>
    </article>`;

  if (grid) grid.innerHTML = orderedCatalog.map(cardMarkup).join("") + supportMarkup();

  document.querySelectorAll("[data-total-count]").forEach((node) => {
    node.textContent = String(catalog.length);
  });

  const dialog = document.querySelector("#app-dialog");
  const dialogIcon = document.querySelector("#dialog-icon");
  const dialogCategory = document.querySelector("#dialog-category");
  const dialogTitle = document.querySelector("#dialog-title");
  const dialogDescription = document.querySelector("#dialog-description");

  const closeDialog = () => {
    if (dialog && dialog.open) dialog.close();
  };

  document.querySelectorAll("[data-app-details]").forEach((button) => {
    button.addEventListener("click", () => {
      const app = byId.get(button.dataset.appDetails);
      if (!app || !dialog) return;
      dialogIcon.src = app.icon;
      dialogIcon.alt = `${app.name} app icon`;
      dialogCategory.textContent = app.category;
      dialogTitle.textContent = app.name;
      dialogDescription.textContent = app.description;
      dialog.showModal();
    });
  });

  dialog?.querySelector(".dialog-close")?.addEventListener("click", closeDialog);
  dialog?.querySelector(".dialog-done")?.addEventListener("click", closeDialog);
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
})();
