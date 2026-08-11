(function () {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const encoded = new URLSearchParams(window.location.search).get("deal") || "";

  const decodePayload = async (value) => {
    const base64 = value
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(value.length / 4) * 4, "=");
    const bytes = Uint8Array.from(window.atob(base64), (char) => char.charCodeAt(0));
    if (!("DecompressionStream" in window)) throw new Error("Compression support unavailable");
    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    return JSON.parse(await new Response(stream).text());
  };

  const makeRow = (label, value) => {
    const element = document.createElement("div");
    element.className = "row";
    const left = document.createElement("span");
    left.textContent = String(label ?? "");
    const right = document.createElement("strong");
    right.textContent = String(value ?? "");
    element.append(left, right);
    return element;
  };

  const openApp = () => {
    if (!encoded) return;
    window.location.href = `dealanalyzer://deal/shared?deal=${encodeURIComponent(encoded)}`;
  };

  byId("open-app").addEventListener("click", openApp);
  byId("open-app-bottom").addEventListener("click", openApp);

  decodePayload(encoded)
    .then((payload) => {
      if (payload.version !== 1 || !payload.strategy || !payload.inputs) {
        throw new Error("Invalid deal payload");
      }

      byId("loading").hidden = true;
      byId("deal").hidden = false;

      const strategyLabels = {
        rental: "BUY & HOLD",
        flip: "FIX & FLIP",
        brrrr: "BRRRR",
        multifamily: "MULTI-FAMILY",
        package: "HOUSE PACKAGE",
        wholesale: "WHOLESALE",
      };
      byId("strategy").textContent = strategyLabels[payload.strategy] || payload.strategy.toUpperCase();
      byId("name").textContent = payload.name || "Untitled deal";

      const address = byId("address");
      address.textContent = payload.address || "Address not provided";
      if (payload.address) {
        address.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(payload.address)}`;
      } else {
        address.removeAttribute("href");
      }

      const result = payload.result || {};
      (result.hero || []).forEach((metric) => {
        const card = document.createElement("div");
        card.className = `metric ${metric.tier || ""}`;
        const label = document.createElement("small");
        label.textContent = metric.label;
        const value = document.createElement("strong");
        value.textContent = metric.value;
        card.append(label, value);
        byId("metrics").append(card);
      });
      (result.rows || []).forEach((item) => byId("rows").append(makeRow(item.label, item.value)));

      const verdict = byId("verdict");
      verdict.classList.add(result.verdictLevel || "warn");
      const verdictTitle = document.createElement("strong");
      verdictTitle.textContent = result.verdictLevel === "good"
        ? "Good potential"
        : result.verdictLevel === "bad"
          ? "Needs another look"
          : "Review carefully";
      const verdictBody = document.createElement("p");
      verdictBody.textContent = result.verdictMessage
        || "Open the evaluation in Deal Analyzer for the complete calculation.";
      verdict.append(verdictTitle, verdictBody);

      Object.entries(payload.inputs || {})
        .filter(([, value]) => typeof value === "number" || typeof value === "string")
        .forEach(([key, value]) => {
          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (character) => character.toUpperCase());
          const formatted = typeof value === "number" ? value.toLocaleString() : value;
          byId("inputs").append(makeRow(label, formatted));
        });
    })
    .catch(() => {
      byId("loading").hidden = true;
      byId("error").hidden = false;
    });
})();
