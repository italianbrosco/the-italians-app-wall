import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { deflateRawSync } from 'node:zlib';
const source = await readFile(new URL('../dealanalyzer/deal/viewer.js', import.meta.url), 'utf8');
class Element {
  constructor() { this.children = []; this.textContent = ''; this.hidden = true; this.classList = {add() {}}; }
  append(...children) { this.children.push(...children); }
  addEventListener() {}
  removeAttribute() {}
  text() { return this.textContent + this.children.map(child => child.text()).join(' '); }
}
async function render(payload) {
  const elements = new Map();
  const byId = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  const encoded = deflateRawSync(JSON.stringify(payload)).toString('base64url');
  runInNewContext(source, {document: {getElementById: byId, createElement: () => new Element()}, window: {location: {search: `?deal=${encoded}`}, atob, DecompressionStream}, URLSearchParams, Blob, Response, DecompressionStream, Uint8Array});
  for (let tries = 0; tries < 100 && byId('deal').hidden && byId('error').hidden; tries++) await new Promise(resolve => setTimeout(resolve, 5));
  return { byId, text: () => byId('inputs').text() };
}
const base = {version: 1, name: 'QA', strategy: 'rental', inputs: {maintPct: 125, maintMode: 1, capexPct: 75, capexMode: 1, utilMonthly: 80, utilOwnerPaid: 0}, result: {hero: [{label:'Cash flow',value:'$200'}], rows: [], verdictLevel:'good'}};
const rental = await render(base);
assert.ok(rental.text().includes('$125/mo'));
assert.ok(rental.text().includes('$75/mo'));
assert.ok(rental.text().includes('(tenant pays — excluded)'));
assert.equal(rental.byId('metrics').children.length, 1);
const portfolio = await render({...base, strategy: 'package', inputs: {otherExpenses: [{label: 'Building water', amount: 40, paidBy: 'tenant'}], houses: [{price: 100000, rent: 1200, taxAnnual: 2400, insAnnual: 900, expenses: [{label: 'Lawn care', amount: 80, paidBy: 'owner'}]}]}});
for (const expected of ['Building water','$2,400/yr','$900/yr','Lawn care','$80/mo']) assert.ok(portfolio.text().includes(expected),expected);
const flip = await render({...base, strategy: 'flip', inputs: {financeRehab: 1, planner: {bufferPct: 10, components: [{name:'Kitchen', tasks:[{task:'Cabinets', labor:900, materials:1500, done:true}]}]}}});
for (const expected of ['Finance rehab costs Yes','Cabinets','$2,400','Complete','$2,640']) assert.ok(flip.text().includes(expected), expected);
for (const payload of [null, {...base, strategy:'bogus'}, {...base, inputs:[]}, {...base, inputs:{planner:{components:[null]}}}]) {
 const result=await render(payload);assert.equal(result.byId('error').hidden,false);assert.equal(result.byId('deal').hidden,true);
}
console.log('Shared viewer runtime checks passed: money modes, tenant expenses, property schedules, planner tasks, and invalid payloads.');
