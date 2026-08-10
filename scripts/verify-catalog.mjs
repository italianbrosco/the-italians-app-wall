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
  const expectedStatuses = new Set(["available", "testing", "coming"]);

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
    }
  }

  const counts = Object.fromEntries(
    ["available", "testing", "coming"].map((status) => [status, catalog.filter((app) => app.status === status).length])
  );
  const expected = { available: 1, testing: 11, coming: 1 };
  for (const [status, count] of Object.entries(expected)) {
    if (counts[status] !== count) errors.push(`expected ${count} ${status} apps, found ${counts[status]}`);
  }

  if (catalog.length !== 13) errors.push(`expected 13 apps, found ${catalog.length}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Catalog verified: 13 unique apps, 13 icons, 1 available, 11 public betas, 1 coming soon.");
