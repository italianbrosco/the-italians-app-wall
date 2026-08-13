(function () {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const encoded = new URLSearchParams(window.location.search).get("deal") || "";
  const strategyLabels = {
    rental: "Buy & Hold",
    flip: "Fix & Flip",
    brrrr: "BRRRR",
    multifamily: "Multi-Family",
    package: "House Package",
    wholesale: "Wholesale",
  };
  const labels = {
    price: "Purchase price",
    downPct: "Down payment",
    ratePct: "Interest rate",
    termYears: "Loan term",
    closing: "Closing costs",
    rehab: "Rehab budget",
    rent: "Monthly rent",
    otherIncome: "Other monthly income",
    vacancyPct: "Vacancy",
    taxAnnual: "Property tax (annual)",
    insAnnual: "Insurance (annual)",
    mgmtPct: "Property management",
    maintPct: "Maintenance reserve",
    capexPct: "CapEx reserve",
    hoaMonthly: "HOA",
    utilMonthly: "Utilities",
    otherMonthly: "Other monthly cost",
    arv: "After-repair value",
    holdMonths: "Holding period",
    financedPct: "Purchase financed",
    pointsPct: "Loan points",
    monthlyCarry: "Monthly holding costs",
    sellingPct: "Selling costs",
    otherCost: "Other one-time cost",
    carryTotal: "Holding costs",
    refiLtvPct: "Refinance LTV",
    refiRatePct: "Refinance interest rate",
    refiTermYears: "Refinance loan term",
    refiClosing: "Refinance closing costs",
    repairs: "Repairs",
    maoPct: "MAO rule",
    contractPrice: "Contract price",
    assignmentFee: "Assignment fee",
  };
  const moneyKeys = new Set(["price", "closing", "rehab", "rent", "otherIncome", "taxAnnual", "insAnnual", "hoaMonthly", "utilMonthly", "otherMonthly", "arv", "monthlyCarry", "otherCost", "carryTotal", "refiClosing", "repairs", "contractPrice", "assignmentFee"]);
  const monthlyKeys = new Set(["rent", "otherIncome", "hoaMonthly", "utilMonthly", "otherMonthly", "monthlyCarry"]);
  const percentKeys = new Set(["ratePct", "vacancyPct", "mgmtPct", "maintPct", "capexPct", "financedPct", "pointsPct", "sellingPct", "refiLtvPct", "refiRatePct", "maoPct"]);
  const hiddenKeys = new Set(["downMode", "maintMode", "capexMode", "utilOwnerPaid", "financeRehab", "financeClosing", "otherExpenses", "unitRents", "houses"]);

  const decodePayload = async (value) => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const bytes = Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
    if (!("DecompressionStream" in window)) throw new Error("Compression support unavailable");
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return JSON.parse(await new Response(stream).text());
  };

  const makeRow = (label, value, options) => {
    const element = document.createElement("div");
    element.className = `row${options && options.total ? " total" : ""}`;
    const left = document.createElement("span");
    left.className = "row-label";
    left.textContent = String(label || "");
    if (options && options.sub) {
      const sub = document.createElement("small");
      sub.textContent = ` (${options.sub})`;
      left.append(sub);
    }
    const right = document.createElement("strong");
    right.textContent = String(value ?? "");
    element.append(left, right);
    return element;
  };

  const titleFromKey = (key) => labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
  const money = (value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const formatInput = (key, value, inputs) => {
    if (key === "downPct") return inputs.downMode ? money(value) : `${value}%`;
    if (percentKeys.has(key)) return `${value}%`;
    if (key === "termYears" || key === "refiTermYears") return `${value} yr`;
    if (key === "holdMonths") return `${value} mo`;
    if (moneyKeys.has(key)) return `${money(value)}${monthlyKeys.has(key) ? "/mo" : ""}`;
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
  };

  const renderAssumptions = (payload) => {
    const inputs = payload.inputs || {};
    const container = byId("inputs");
    Object.entries(inputs)
      .filter(([key, value]) => !hiddenKeys.has(key) && (typeof value === "number" || typeof value === "string"))
      .forEach(([key, value]) => container.append(makeRow(titleFromKey(key), formatInput(key, value, inputs))));

    if (Array.isArray(inputs.unitRents)) {
      inputs.unitRents.forEach((value, index) => container.append(makeRow(`Unit ${index + 1} rent`, `${money(value)}/mo`)));
    }
    if (Array.isArray(inputs.houses)) {
      inputs.houses.forEach((house, index) => {
        container.append(makeRow(`House ${index + 1}`, `${money(house.rent || 0)}/mo`, { sub: `${money(house.price || 0)} purchase` }));
      });
    }
  };

  const openApp = () => {
    if (encoded) window.location.href = `dealanalyzer://deal/shared?deal=${encodeURIComponent(encoded)}`;
  };
  byId("open-app").addEventListener("click", openApp);
  byId("open-app-bottom").addEventListener("click", openApp);

  decodePayload(encoded)
    .then((payload) => {
      if (payload.version !== 1 || !payload.strategy || !payload.inputs) throw new Error("Invalid deal payload");

      byId("loading").hidden = true;
      byId("deal").hidden = false;

      const strategyName = strategyLabels[payload.strategy] || String(payload.strategy);
      byId("strategy").textContent = `${strategyName.toUpperCase()} ANALYSIS`;
      byId("results-heading").textContent = `RESULTS — ${strategyName.toUpperCase()}`;
      byId("name").textContent = payload.name || "Untitled deal";

      const address = byId("address");
      address.textContent = payload.address || "Address not provided";
      if (payload.address) address.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(payload.address)}`;
      else address.removeAttribute("href");

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
      (result.rows || []).forEach((item) => byId("rows").append(makeRow(item.label, item.value, { sub: item.sub, total: item.total })));

      const verdict = byId("verdict");
      const level = ["good", "warn", "bad"].includes(result.verdictLevel) ? result.verdictLevel : "warn";
      verdict.classList.add(level);
      const verdictTitle = document.createElement("strong");
      verdictTitle.textContent = level === "good" ? "✓ Good deal" : level === "bad" ? "✗ Weak deal" : "⚠ Marginal — proceed carefully";
      const verdictBody = document.createElement("p");
      verdictBody.textContent = result.verdictMessage || "Open the evaluation in Deal Analyzer for the complete calculation.";
      verdict.append(verdictTitle, verdictBody);

      renderAssumptions(payload);
    })
    .catch(() => {
      byId("loading").hidden = true;
      byId("error").hidden = false;
    });
})();
