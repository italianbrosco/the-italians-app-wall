import { readFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = path.join(root, 'food-glorious-food-demo');
const baseUrl = process.argv[2]?.replace(/\/$/, '');

const loadText = async (relativePath) => {
  if (!baseUrl) return readFile(path.join(siteDir, relativePath), 'utf8');
  const response = await fetch(`${baseUrl}/food-glorious-food-demo/${relativePath}`);
  if (!response.ok) throw new Error(`${relativePath} returned HTTP ${response.status}`);
  return response.text();
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const [html, css, js] = await Promise.all([
  loadText('index.html'),
  loadText('styles.css'),
  loadText('script.js'),
]);

if (!baseUrl) {
  await Promise.all([
    access(path.join(siteDir, 'assets/bakery-still-life.webp')),
    access(path.join(siteDir, 'assets/chocolate-cake.webp')),
    access(path.join(siteDir, 'og.png')),
  ]);
} else {
  for (const asset of ['assets/bakery-still-life.webp', 'assets/chocolate-cake.webp', 'og.png']) {
    const response = await fetch(`${baseUrl}/food-glorious-food-demo/${asset}`);
    assert(response.ok, `${asset} returned HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    assert(bytes.byteLength > 0, `${asset} is empty`);
  }
}

const requiredHtml = [
  '<title>Food Glorious Food | Highland Park Bakery</title>',
  'content="noindex,nofollow"',
  'Home of the White Lily',
  '5906 Bryant Street',
  'Pittsburgh, PA 15206',
  '9:30am–2:30pm',
  'tel:+14123635330',
  'https://www.instagram.com/bryantstbakery/',
  'Website concept',
  'Concept imagery',
];
for (const text of requiredHtml) assert(html.includes(text), `Missing required HTML: ${text}`);

for (const forbidden of ['Italian Bros', '$500', 'TestFlight', 'design/food-glorious-food-demo']) {
  assert(!html.includes(forbidden), `Forbidden demo content found: ${forbidden}`);
}

for (const id of ['main', 'top', 'menu', 'cakes', 'catering', 'visit', 'mobile-menu']) {
  assert(new RegExp(`id=["']${id}["']`).test(html), `Missing anchor target: #${id}`);
}

assert((html.match(/<h1\b/g) || []).length === 1, 'Expected exactly one h1');
assert((html.match(/<img\b/g) || []).length === (html.match(/\balt=/g) || []).length, 'Every image must have alt text');
assert(css.includes('@media (max-width: 840px)'), 'Missing phone breakpoint');
assert(css.includes('@media (max-width: 430px)'), 'Missing narrow-phone breakpoint');
assert(css.includes(':focus-visible'), 'Missing visible focus treatment');
assert(css.includes('min-height: 44px'), 'Missing 44px control target rule');
assert(js.includes("event.key !== 'Escape'"), 'Missing Escape-key menu handling');
assert(js.includes("matchMedia('(min-width: 841px)')"), 'Missing responsive menu reset');

console.log(`Verified Food Glorious Food demo (${baseUrl ? 'deployed' : 'local'}): content, assets, navigation, responsive rules, accessibility hooks, and disclosure.`);
