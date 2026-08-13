import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [html, css, script, appleAssociation, androidAssociation] = await Promise.all([
  readFile(resolve(root, 'dealanalyzer/deal/index.html'), 'utf8'),
  readFile(resolve(root, 'dealanalyzer/deal/styles.css'), 'utf8'),
  readFile(resolve(root, 'dealanalyzer/deal/viewer.js'), 'utf8'),
  readFile(resolve(root, '.well-known/apple-app-site-association'), 'utf8'),
  readFile(resolve(root, '.well-known/assetlinks.json'), 'utf8'),
]);

const apple = JSON.parse(appleAssociation);
assert.deepEqual(apple.applinks.details, [{
  appID: '257M5TM5Z8.com.theitalians.dealanalyzer',
  paths: ['/dealanalyzer/deal/', '/dealanalyzer/deal/*'],
}]);

const android = JSON.parse(androidAssociation);
assert.deepEqual(android, [{
  relation: ['delegate_permission/common.handle_all_urls'],
  target: {
    namespace: 'android_app',
    package_name: 'com.theitalians.dealanalyzer',
    sha256_cert_fingerprints: ['E6:D8:41:08:AD:57:1D:DE:4C:6A:AD:D4:B7:AB:DE:27:57:F0:CB:91:53:81:A3:02:02:C7:3D:B3:22:D8:65:75'],
  },
}]);

const requiredHtml = [
  'class="app-header"',
  'class="brand-mark"',
  'd="M3.5 14.2 16 4l12.5 10.2',
  'class="gold"',
  'class="header-title">Shared Deal',
  'id="property-heading">PROPERTY',
  'id="results-heading">RESULTS',
  'id="assumptions-heading">SHARED ASSUMPTIONS',
  'styles.css?v=20260813.1',
  'viewer.js?v=20260813.1',
];
requiredHtml.forEach((value) => assert.ok(html.includes(value), `Shared viewer HTML is missing: ${value}`));

const requiredCss = [
  '--canvas: #fbfaf8',
  '--parchment: #f1ede6',
  '--espresso: #2c1d16',
  '--slate: #435266',
  '--gold: #b78b2f',
  '--gold-dark: #ad8130',
  'font-family: "Avenir Next", Inter, system-ui, sans-serif',
  'grid-template-columns: 34px 39px minmax(0, 1fr) auto',
  'min-height: 44px',
];
requiredCss.forEach((value) => assert.ok(css.includes(value), `Shared viewer CSS is missing app parity token: ${value}`));
assert.equal(/Georgia|Times New Roman|font-family:\s*Avenir,/.test(css), false, 'Legacy website typography must not replace the app font stack.');

['rental', 'flip', 'brrrr', 'multifamily', 'package', 'wholesale'].forEach((strategy) => {
  assert.ok(script.includes(`${strategy}:`), `Shared viewer is missing the ${strategy} strategy label.`);
});
[
  'renderAssumptions(payload)',
  'Array.isArray(inputs.houses)',
  'Array.isArray(inputs.unitRents)',
  '⚠ Marginal — proceed carefully',
  'dealanalyzer://deal/shared?deal=',
].forEach((value) => assert.ok(script.includes(value), `Shared viewer behavior is missing: ${value}`));

console.log('Deal Analyzer shared viewer parity contract verified.');
