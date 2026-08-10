(function () {
  "use strict";

  const catalog = Array.isArray(window.APP_CATALOG) ? window.APP_CATALOG : [];
  const grid = document.querySelector("#app-grid");
  const featuredOrder = [
    "dream-journal",
    "easy-audio-notes",
    "echobeat",
    "eyes-up",
    "real-or-ai",
    "hundred",
    "calcspace",
    "mortgage-calculator",
    "deal-analyzer",
    "abc-smash",
    "pollwar",
    "super-game",
    "tin-wings"
  ];
  const priorityIds = new Set(featuredOrder.slice(0, 6));

  const byId = new Map(catalog.map((app) => [app.id, app]));
  const orderedCatalog = featuredOrder.map((id) => byId.get(id)).filter(Boolean);
  const panelNames = {
    "dream-journal": "Dreamwise AI",
    "easy-audio-notes": "Easy Audio Notes",
    echobeat: "EchoBeat",
    "eyes-up": "Eyes Up",
    "real-or-ai": "Real or AI",
    hundred: "Hundred"
  };
  const panelDescriptions = {
    "dream-journal": "Your private space for dreams, insights, and patterns.",
    "easy-audio-notes": "Capture speech, get clear transcripts, and stay organized.",
    echobeat: "A daily rhythm challenge to keep your streak alive.",
    "eyes-up": "Screen-free fun for parties, groups, and game nights.",
    "real-or-ai": "Spot the difference. Train your eye, challenge your mind.",
    hundred: "A simple rule set. Endless moves. Beat your best."
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const previewMarkup = (id) => {
    const previews = {
      "dream-journal": `
        <div class="screen-top"><b>9:41</b><span>•••</span></div>
        <div class="dream-greeting"><b>Good night</b><span>☾</span></div>
        <small>What did you dream?</small>
        <div class="dream-add">✦ Add Dream</div>
        <em>Recent Dreams</em>
        <div class="dream-entry"><b>The Quiet Lighthouse</b><small>May 12</small><p>I was by the ocean and saw a lighthouse glowing in the fog.</p></div>
        <div class="dream-entry short"><b>Doorway in the Forest</b></div>`,
      "easy-audio-notes": `
        <div class="screen-top light"><b>9:41</b><span>⌕</span></div>
        <div class="notes-title">All Notes</div>
        <div class="waveform"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="record-row"><b>00:24</b><span>Ⅱ</span></div>
        <div class="note-tabs"><b>Transcript</b><span>Summary</span></div>
        <p class="transcript">Ideas for the weekend:<br />– Hike the ridge trail<br />– Farmers market<br />– Read chapter 4<br />– Call Mom</p>`,
      echobeat: `
        <div class="screen-top"><b>9:41</b><span>•••</span></div>
        <h4>Today</h4><small>Keep your rhythm.</small>
        <div class="rhythm-ring"><strong>12</strong><span>day streak</span></div>
        <div class="week-row"><b>M</b><b>T</b><b>W</b><b>T</b><b>F</b><b>S</b><b>S</b></div>
        <div class="week-dots"><i>✓</i><i>✓</i><i>✓</i><i>✓</i><i>✓</i><i>✓</i><i class="active">✓</i></div>`,
      "eyes-up": `
        <div class="screen-top"><b>9:41</b><span>•••</span></div>
        <div class="eyes-label">Read this out loud</div>
        <div class="prompt-card">Name something<br />that sounds<br />better in a<br />movie.</div>
        <div class="next-card">Next card <b>→</b></div>`,
      "real-or-ai": `
        <div class="screen-top"><b>9:41</b><span>•••</span></div>
        <h4>Real or AI?</h4><small>Which image is real?</small>
        <div class="image-duel"><span></span><span></span><b>?</b></div>
        <div class="duel-buttons"><span>Left</span><span>Right</span></div>`,
      hundred: `
        <div class="screen-top"><b>9:41</b><span>•••</span></div>
        <div class="hundred-mode">Classic</div>
        <small>Best 78</small>
        <div class="score-card"><span>This run</span><strong>46</strong><small>moves</small></div>
        <div class="new-game">New Game</div>`,
      calcspace: `
        <div class="screen-top"><b>9:41</b><span>•••</span></div>
        <h4>CalcSpace</h4><small>Everyday calculators</small>
        <div class="calc-display">2,450.00</div>
        <div class="calc-keys"><b>+</b><b>−</b><b>×</b><b>÷</b></div>
        <div class="calc-list"><span>Tip</span><span>Percent</span><span>Convert</span></div>`,
      "mortgage-calculator": `
        <div class="screen-top light"><b>9:41</b><span>•••</span></div>
        <h4>Home Payment</h4><small>Monthly estimate</small>
        <div class="mortgage-total"><span>Estimated payment</span><strong>$2,897</strong></div>
        <div class="mortgage-chart"><i></i><i></i><i></i></div>
        <div class="field-row"><span>Home price</span><b>$425,000</b></div>
        <div class="field-row"><span>Rate</span><b>6.25%</b></div>`,
      "deal-analyzer": `
        <div class="screen-top"><b>9:41</b><span>•••</span></div>
        <h4>Rental Deal</h4><small>Quick analysis</small>
        <div class="deal-score"><span>Cash flow</span><strong>+$418</strong><small>per month</small></div>
        <div class="deal-bars"><i></i><i></i><i></i></div>
        <div class="deal-chip">Strong potential</div>`,
      "abc-smash": `
        <div class="screen-top light"><b>9:41</b><span>★</span></div>
        <div class="abc-title">Find the letter</div>
        <div class="abc-letter">B</div>
        <div class="abc-choices"><b>A</b><b>B</b><b>D</b></div>
        <div class="abc-progress"><i></i></div>`,
      pollwar: `
        <div class="screen-top"><b>9:41</b><span>•••</span></div>
        <h4>Tonight’s poll</h4><small>Pick your side</small>
        <div class="poll-question">Window seat or aisle?</div>
        <div class="poll-choice blue">Window <b>58%</b></div>
        <div class="poll-choice pink">Aisle <b>42%</b></div>
        <div class="poll-votes">1,248 votes</div>`,
      "super-game": `
        <div class="screen-top"><b>9:41</b><span>•••</span></div>
        <div class="battle-title">POWER BATTLE</div>
        <div class="battle-ring"><span>⚡</span></div>
        <div class="battle-score"><b>82</b><i></i><b>76</b></div>
        <div class="battle-button">Strike</div>`,
      "tin-wings": `
        <div class="screen-top light"><b>9:41</b><span>•••</span></div>
        <div class="tin-sky"><span>✦</span><b>✈</b><i></i></div>
        <h4>Tin Wings</h4><small>Survival · Best 2:48</small>
        <div class="tin-button">Fly again</div>`
    };
    return previews[id] || "";
  };

  const appAction = (app) => {
    const action = Array.isArray(app.actions) ? app.actions[0] : null;
    if (app.status === "available" && action) {
      return `<a class="card-arrow" href="${escapeHtml(action.href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(action.label)}"><span aria-hidden="true">→</span></a>`;
    }
    return `<button class="card-arrow" type="button" data-app-details="${escapeHtml(app.id)}" aria-label="Learn more about ${escapeHtml(app.name)}"><span aria-hidden="true">→</span></button>`;
  };

  const cardMarkup = (app) => {
    const status = app.status === "available" ? "Available on the App Store" : "Release updates coming soon";
    const panelName = panelNames[app.id] || app.name;
    const panelDescription = panelDescriptions[app.id] || app.description;
    const imagePriority = priorityIds.has(app.id)
      ? 'loading="eager" fetchpriority="high"'
      : 'loading="lazy"';
    return `
      <article class="app-panel accent-${escapeHtml(app.accent)}">
        <div class="app-summary">
          <img class="app-icon" src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)} app icon" ${imagePriority} width="384" height="384" />
          <div class="app-copy">
            <h3>${escapeHtml(panelName)}</h3>
            <p>${escapeHtml(panelDescription)}</p>
            <small><i aria-hidden="true"></i>${escapeHtml(status)}</small>
          </div>
        </div>
        ${appAction(app)}
        <div class="phone-preview preview-${escapeHtml(app.id)}" aria-hidden="true">
          <div class="phone-speaker"></div>
          <div class="phone-screen">${previewMarkup(app.id)}</div>
        </div>
      </article>`;
  };

  if (grid) grid.innerHTML = orderedCatalog.map(cardMarkup).join("");

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
