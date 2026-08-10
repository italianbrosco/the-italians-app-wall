import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "catalog.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: "catalog.js" });

const catalog = sandbox.window.APP_CATALOG;
const errors = [];

if (!Array.isArray(catalog)) errors.push("catalog.js must define window.APP_CATALOG as an array");

if (Array.isArray(catalog)) {
  const ids = new Set();
  const expectedStatuses = new Set(["available", "coming"]);

  for (const app of catalog) {
    for (const key of ["id", "name", "category", "description", "icon", "status", "statusLabel"]) {
      if (!app[key]) errors.push(`${app.id || "unknown app"}: missing ${key}`);
    }
    if (ids.has(app.id)) errors.push(`${app.id}: duplicate id`);
    ids.add(app.id);
    if (!expectedStatuses.has(app.status)) errors.push(`${app.id}: unsupported status ${app.status}`);

    const iconPath = path.join(root, app.icon.replace(/^\//, ""));
    if (!fs.existsSync(iconPath)) errors.push(`${app.id}: missing icon ${app.icon}`);

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
  const expected = { available: 1, coming: 12 };
  for (const [status, count] of Object.entries(expected)) {
    if (counts[status] !== count) errors.push(`expected ${count} ${status} apps, found ${counts[status]}`);
  }

  if (catalog.length !== 13) errors.push(`expected 13 apps, found ${catalog.length}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Catalog verified: 13 unique apps, 13 icons, 1 store release, 12 release updates coming soon, no testing links.");
