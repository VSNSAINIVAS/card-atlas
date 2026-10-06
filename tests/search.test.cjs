const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
// Exercise the application's search functions with its canonical dataset.
// Startup and browser event wiring are covered by the manual browser checklist.
function search(query, options = {}) {
  const context = vm.createContext({ Intl, Date, URL });
  vm.runInContext(
    source.slice(0, source.indexOf("window.addEventListener('hashchange'")),
    context,
  );
  vm.runInContext(
    `data=${fs.readFileSync(path.join(root, 'offers.json'), 'utf8')}; query=${JSON.stringify(query)}; region=${JSON.stringify(options.region || 'domestic')}; merchant=${JSON.stringify(options.merchant || 'all')}; category=${JSON.stringify(options.category || 'All')}; selectedCard=${JSON.stringify(options.card || 'all')};`,
    context,
  );
  return JSON.parse(
    vm.runInContext('JSON.stringify(filteredOffers())', context),
  );
}
test('singular, plural and case-insensitive lounge searches agree', () => {
  const ids = (q) => search(q).map((o) => o.id);
  assert.deepEqual(ids('LOUNGES'), ids('lounge'));
  assert.ok(ids('Lounges').includes('o9'));
});
test('airport lounge access excludes railway access and finds My Zone', () => {
  assert.deepEqual(
    search('airport lounge access').map((o) => o.id),
    ['o9', 'o30', 'o40'],
  );
});
test('rail lounge search finds the railway allowance', () => {
  assert.deepEqual(
    search('rail lounge access').map((o) => o.id),
    ['o41'],
  );
});
test('the lounge destination has four domestic and two international records', () => {
  assert.equal(search('', { category: 'Lounges' }).length, 4);
  assert.deepEqual(
    search('', { category: 'Lounges', region: 'international' }).map(
      (o) => o.id,
    ),
    ['o10', 'o42'],
  );
});
test('exact merchant searches keep explicit mappings and shared-cap details', () => {
  const typed = search('Swiggy');
  assert.deepEqual(
    typed.map((o) => o.id),
    search('', { merchant: 'Swiggy' }).map((o) => o.id),
  );
  assert.ok(typed.every((o) => o.merchants.includes('Swiggy')));
  assert.ok(typed.find((o) => o.id === 'o1').summary.includes('shared'));
});
test('card and geography filters still restrict results', () => {
  const rows = search('', { card: 'ixigo', region: 'international' });
  assert.ok(rows.length > 0);
  assert.ok(
    rows.every(
      (o) => o.card === 'ixigo' && o.regions.includes('international'),
    ),
  );
});
test('punctuation and cash back wording do not break matching', () => {
  assert.deepEqual(
    search('cash back').map((o) => o.id),
    search('cashback').map((o) => o.id),
  );
  assert.deepEqual(
    search('airport, lounge access!').map((o) => o.id),
    search('airport lounge access').map((o) => o.id),
  );
});
