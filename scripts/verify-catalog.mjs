import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "catalog.js"), "utf8");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styleSource = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: "catalog.js" });

const catalog = sandbox.window.APP_CATALOG;
const errors = [];

if (!Array.isArray(catalog)) errors.push("catalog.js must define window.APP_CATALOG as an array");

if (Array.isArray(catalog)) {
  const ids = new Set();
  const expectedStatuses = new Set(["available", "coming"]);

  for (const app of catalog) {
    for (const key of ["id", "name", "category", "description", "icon", "screenshot", "screenshotAlt", "status", "statusLabel"]) {
      if (!app[key]) errors.push(`${app.id || "unknown app"}: missing ${key}`);
    }
    if (ids.has(app.id)) errors.push(`${app.id}: duplicate id`);
    ids.add(app.id);
    if (!expectedStatuses.has(app.status)) errors.push(`${app.id}: unsupported status ${app.status}`);

    const iconPath = path.join(root, app.icon.replace(/^\//, ""));
    if (!fs.existsSync(iconPath)) errors.push(`${app.id}: missing icon ${app.icon}`);
    const screenshotPath = path.join(root, app.screenshot.replace(/^\//, ""));
    if (!fs.existsSync(screenshotPath)) errors.push(`${app.id}: missing screenshot ${app.screenshot}`);

    for (const action of app.actions || []) {
      if (!String(action.href || "").startsWith("https://")) {
        errors.push(`${app.id}: action must use an HTTPS URL`);
      }
      if (!/^https:\/\/(apps\.apple\.com\/|play\.google\.com\/store\/apps\/details)/.test(action.href)) {
        errors.push(`${app.id}: action must link to a public App Store or Google Play production page`);
      }
    }

    if (app.status !== "available" && (app.actions || []).length) {
      errors.push(`${app.id}: unreleased products cannot expose installation or testing links`);
    }
    if (app.status === "available" && !(app.actions || []).length) {
      errors.push(`${app.id}: available products must include a verified public store link`);
    }
    if (JSON.stringify(app).match(/TestFlight|Closed test|apps\/testing/i)) {
      errors.push(`${app.id}: testing language or links are not allowed on the public website`);
    }
  }

  const counts = Object.fromEntries(
    ["available", "coming"].map((status) => [status, catalog.filter((app) => app.status === status).length])
  );
  const expected = { available: 3, coming: 19 };
  for (const [status, count] of Object.entries(expected)) {
    if (counts[status] !== count) errors.push(`expected ${count} ${status} apps, found ${counts[status]}`);
  }

  if (catalog.length !== 22) errors.push(`expected 22 apps, found ${catalog.length}`);

  const orderSource = appSource.match(/const featuredOrder = \[([\s\S]*?)\];/)?.[1] || "";
  const renderedIds = [...orderSource.matchAll(/"([a-z0-9-]+)"/g)].map((match) => match[1]);
  const renderedSet = new Set(renderedIds);
  for (const id of ids) {
    if (!renderedSet.has(id)) errors.push(`${id}: catalog entry is omitted from the rendered app order`);
  }
  for (const id of renderedSet) {
    if (!ids.has(id)) errors.push(`${id}: rendered app order has no catalog entry`);
  }
  if (renderedIds.length !== renderedSet.size) errors.push("rendered app order contains a duplicate id");

  const orderedCatalog = sandbox.window.orderAppCatalog(catalog, renderedIds);
  const expectedLeadingIds = ["calcspace", "mortgage-calculator", "dream-journal", "deal-analyzer"];
  if (orderedCatalog.slice(0, 4).map((app) => app.id).join(",") !== expectedLeadingIds.join(",")) {
    errors.push("the catalog must begin with CalcSpace, Mortgage Calculator, Dream Journal, then Deal Analyzer");
  }
  const firstComingIndex = orderedCatalog.findIndex((app) => app.status === "coming");
  if (firstComingIndex >= 0 && orderedCatalog.slice(firstComingIndex).some((app) => app.status === "available")) {
    errors.push("available apps must render before every unreleased app");
  }

  if (indexSource.includes('id="about"')) {
    errors.push("the retired studio introduction must not render");
  }
  for (const retiredCopy of ["Three brothers · one independent studio", "Independent<br />apps, made<br />with care.", "apps in our workshop.", "Direct from our workshop"]) {
    if (indexSource.includes(retiredCopy) || appSource.includes(retiredCopy)) {
      errors.push(`retired homepage copy must not render: ${retiredCopy}`);
    }
  }
  if (!appSource.includes('mailto:italianbrosco@proton.me') || !appSource.includes('Email us at italianbrosco@proton.me')) {
    errors.push("the homepage support panel must use the Proton Mail contact address");
  }
  if (!styleSource.includes("grid-template-columns: repeat(3, minmax(0, 1fr));")) {
    errors.push("the desktop app catalog must render three cards per row");
  }
  if (!styleSource.includes("grid-auto-rows: 280px;") || styleSource.includes("grid-auto-rows: calc((100%")) {
    errors.push("desktop app rows must use non-overlapping fixed tracks");
  }
  if (indexSource.includes("three-brothers-fountain") || appSource.includes("three-brothers-fountain")) {
    errors.push("the retired three-brothers portrait must not be rendered");
  }
  if (!indexSource.includes('/assets/brand/italian-bros-crest-transparent.png')) {
    errors.push("the header must render the transparent Italian Bros crest logo");
  }
  if (!indexSource.includes('/assets/brand/italian-bros-wordmark.png')) {
    errors.push("the header must render the centered Italian Bros Co. wordmark");
  }
  if (!fs.existsSync(path.join(root, "assets/brand/italian-bros-crest-transparent.png")) || !fs.existsSync(path.join(root, "assets/brand/italian-bros-wordmark.png"))) {
    errors.push("the transparent header brand assets are missing");
  }
  if (!appSource.includes('/assets/brand/italian-bros-support-transparent.png') || !fs.existsSync(path.join(root, "assets/brand/italian-bros-support-transparent.png"))) {
    errors.push("the transparent Italian Bros support badge asset is missing");
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Catalog verified: 22 unique apps, 22 icons, 22 authentic screenshots, 3 store releases, 19 release updates coming soon, no testing links.");
