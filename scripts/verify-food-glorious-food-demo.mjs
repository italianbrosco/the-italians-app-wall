import { access, readFile } from 'node:fs/promises';
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

const publicAssets = [
  'assets/official/fgf-logo.webp',
  'assets/official/storefront.webp',
  'assets/official/bakery-cake.webp',
  'assets/official/catering-table.webp',
  'og.jpg',
];

if (!baseUrl) {
  await Promise.all(publicAssets.map((asset) => access(path.join(siteDir, asset))));
} else {
  for (const asset of publicAssets) {
    const response = await fetch(`${baseUrl}/food-glorious-food-demo/${asset}`);
    assert(response.ok, `${asset} returned HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    assert(bytes.byteLength > 0, `${asset} is empty`);
  }
}

const requiredHtml = [
  '<title>Food Glorious Food | Highland Park Bakery</title>',
  'content="noindex,nofollow"',
  'Home of the',
  'White Lily',
  'more than 18 years',
  'produce its products from scratch',
  '5906 Bryant Street',
  'Pittsburgh, Pennsylvania 15206',
  '9:30am–2:30pm',
  'tel:+14123635330',
  'https://www.instagram.com/bryantstbakery/',
  'Daily items vary',
  'on- and off-premise catering events',
  'Please call in advance for whole cakes',
  'Please call in advance for whole pies',
  'Standard cakes are 8 inches',
  'Unofficial website concept',
  'Business photography and logo sourced from Food Glorious Food’s current official website',
  'assets/official/fgf-logo.webp',
  'assets/official/storefront.webp',
  'assets/official/bakery-cake.webp',
  'assets/official/catering-table.webp',
];

for (const text of requiredHtml) assert(html.includes(text), `Missing required HTML: ${text}`);

const requiredMenuItems = [
  'Strata', 'Assorted Quiches', 'Marinated Ham and Cheese Sandwiches', 'Southern Biscuits',
  'Assorted Pizzas', 'Potato Cheese Pie', 'White Lily', 'Chocolate Mousse Cake', 'Key Lime Cake',
  'Nutella Tart', 'Sour Cream Apple', 'Coconut Cream', 'Key Lime', 'Walnut and Chocolate', 'Pecan',
  'Mixed Berry', 'Pumpkin', 'Fresh Berry Tart', 'Cassata', 'Red Velvet', 'Black Orchid',
  'Peanut Butter Mousse', 'Flourless Chocolate Cake', 'Boston Cream Cake', 'Lemon Curd Cake',
  'Marjolaine', 'Wedding Cake', 'Birthday Cakes', 'Plain and Dipped Madeleines', 'Apple Strudel',
  'Arlettes', 'Cinnamon Roll', 'Jewish Pizza', 'Chocolate Chip Cookies', 'Kolackies',
  'Cheesecake Brownies', 'Scotch-a-Roo', 'Cut-Out Cookies', 'Fresh Fruit Tart',
  'Strawberry Napoleon', 'Tulip', 'Pumpkin Roll', 'Oatmeal Florentine', 'Assorted Muffins',
  'Assorted Cupcakes', 'Warm Beverages', 'Cold Beverages',
];

for (const item of requiredMenuItems) assert(html.includes(`>${item}<`), `Missing original menu item: ${item}`);
assert((html.match(/class="menu-item"/g) || []).length === 47, 'Expected all 47 published menu entries');
assert((html.match(/<details class="menu-group"/g) || []).length === 6, 'Expected all 6 menu categories');

const instagramHref = 'href="https://www.instagram.com/bryantstbakery/"';
assert((html.match(new RegExp(instagramHref, 'g')) || []).length >= 5, 'Expected prominent verified Instagram links');
assert(/<a[^>]+href="https:\/\/www\.instagram\.com\/bryantstbakery\/"[^>]*>See today’s specials<\/a>/.test(html), 'Today’s specials must link directly to Instagram');

for (const forbidden of [
  'Italian Bros', '$500', 'TestFlight', 'design/food-glorious-food-demo',
  'bakery-still-life.webp', 'chocolate-cake.webp', 'Concept imagery',
  'href="#menu">See today’s selection',
]) {
  assert(!html.includes(forbidden), `Forbidden demo content found: ${forbidden}`);
}

for (const id of ['main', 'top', 'menu', 'savory', 'cakes', 'pies', 'seasonal', 'treats', 'beverages', 'about', 'catering', 'gallery', 'visit', 'mobile-menu', 'gallery-dialog']) {
  assert(new RegExp(`id=["']${id}["']`).test(html), `Missing anchor or interaction target: #${id}`);
}

assert((html.match(/<h1\b/g) || []).length === 1, 'Expected exactly one h1');
assert((html.match(/<img\b/g) || []).length === (html.match(/\balt=/g) || []).length, 'Every image must have alt text');
assert(css.includes('@media (max-width: 840px)'), 'Missing phone breakpoint');
assert(css.includes('@media (max-width: 380px)'), 'Missing narrow-phone breakpoint');
assert(css.includes(':focus-visible'), 'Missing visible focus treatment');
assert(css.includes('min-height: 44px'), 'Missing 44px control target rule');
assert(css.includes('prefers-reduced-motion'), 'Missing reduced-motion handling');
assert(js.includes("event.key === 'Escape'"), 'Missing Escape-key handling');
assert(js.includes("matchMedia('(min-width: 1121px)')"), 'Missing responsive menu reset');
assert(js.includes('galleryDialog.showModal()'), 'Missing gallery dialog behavior');
assert(js.includes("event.key === 'ArrowLeft'"), 'Missing gallery keyboard navigation');

console.log(`Verified Food Glorious Food demo (${baseUrl ? 'deployed' : 'local'}): complete original menu and facts, authentic media, Instagram specials routing, navigation, responsive rules, accessibility hooks, and disclosure.`);
