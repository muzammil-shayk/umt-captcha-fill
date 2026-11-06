const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'content.js'), 'utf8');
const fixture = fs.readFileSync(path.join(__dirname, 'fixtures', 'login.html'), 'utf8');
const EMPTY = '<!DOCTYPE html><html><body></body></html>';
const tick = () => new Promise((r) => setTimeout(r, 0));

// Load a page, optionally prepare it, then run content.js inside it like Firefox would.
function load(html = fixture, before = () => {}) {
  const dom = new JSDOM(html, { url: 'https://online.umt.edu.pk/Account/Login', runScripts: 'outside-only' });
  const w = dom.window;
  before(w);
  w.eval(script);
  return w;
}
const $ = (w, sel) => w.document.querySelector(sel);

test('copies the captcha text into #SecurityCode, case kept, whitespace trimmed', () => {
  const w = load();
  assert.equal($(w, '#SecurityCode').value, 'aB3xZ');
});

test('fires input, change and keyup on the captcha field', () => {
  const seen = [];
  const w = load(fixture, (w) => {
    const input = w.document.querySelector('#SecurityCode');
    for (const t of ['input', 'change', 'keyup']) input.addEventListener(t, (e) => seen.push(`${t}:${e.bubbles}`));
  });
  assert.deepEqual(seen, ['input:true', 'change:true', 'keyup:true']);
});

test('uses the native prototype value setter, never an own or page-level one', () => {
  const proto = Object.getOwnPropertyDescriptor;
  let ownSetterCalls = 0;
  const w = load(fixture, (w) => {
    const input = w.document.querySelector('#SecurityCode');
    const native = proto(w.HTMLInputElement.prototype, 'value');
    Object.defineProperty(input, 'value', { configurable: true, get() { return native.get.call(this); }, set() { ownSetterCalls++; } });
  });
  const input = $(w, '#SecurityCode');
  assert.equal(ownSetterCalls, 0);
  assert.equal(proto(w.HTMLInputElement.prototype, 'value').get.call(input), 'aB3xZ');
});

test('never touches the id or password fields and never submits', () => {
  let submitted = false;
  const w = load(fixture, (w) => {
    w.document.querySelector('#student_id').value = 'keep-id';
    w.document.querySelector('#loginform').addEventListener('submit', (e) => { submitted = true; e.preventDefault(); });
    w.HTMLFormElement.prototype.submit = () => { submitted = true; };
    w.HTMLFormElement.prototype.requestSubmit = () => { submitted = true; };
    w.document.querySelector('#loginbtn').addEventListener('click', () => { submitted = true; });
  });
  assert.equal($(w, '#student_id').value, 'keep-id');
  assert.equal($(w, '#Password').value, '');
  assert.equal(submitted, false);
});

for (const bad of ['ab', 'abcdefghijk', 'a b c', 'ab<1>', '']) {
  test(`ignores captcha text that is not 3-10 letters/digits: ${JSON.stringify(bad)}`, () => {
    const w = load(fixture.replace(' aB3xZ ', bad));
    assert.equal($(w, '#SecurityCode').value, '');
  });
}

test('waits for the login form when it is added after the script runs', async () => {
  const w = load(EMPTY);
  w.document.body.innerHTML = fixture.match(/<form[\s\S]*<\/form>/)[0];
  await tick();
  assert.equal($(w, '#SecurityCode').value, 'aB3xZ');
});

test('refills when the captcha text changes (refresh)', async () => {
  const w = load();
  $(w, 'span.captcha').textContent = 'Zq9P2';
  await tick();
  assert.equal($(w, '#SecurityCode').value, 'Zq9P2');
});

test('refills when the captcha span is replaced', async () => {
  const w = load();
  const span = w.document.createElement('span');
  span.className = 'captcha';
  span.textContent = 'NEW77';
  $(w, 'span.captcha').replaceWith(span);
  await tick();
  assert.equal($(w, '#SecurityCode').value, 'NEW77');
});

test('does not overwrite a value the user typed', async () => {
  const w = load();
  $(w, '#SecurityCode').value = 'mine';
  $(w, 'span.captcha').textContent = 'Zq9P2';
  await tick();
  assert.equal($(w, '#SecurityCode').value, 'mine');
});

test('stops watching if the login form never appears within the timeout', async () => {
  let fire;
  const w = load(EMPTY, (w) => {
    w.setTimeout = (fn, ms) => { assert.ok(ms >= 5000 && ms <= 30000, `timeout ${ms} ms`); fire = fn; return 1; };
  });
  assert.equal(typeof fire, 'function', 'a timeout was scheduled');
  fire();
  w.document.body.innerHTML = fixture.match(/<form[\s\S]*<\/form>/)[0];
  await tick();
  assert.equal($(w, '#SecurityCode').value, '');
});

test('keeps watching for captcha refreshes after the form was found, even past the timeout', async () => {
  let fire;
  const w = load(fixture, (w) => { w.setTimeout = (fn) => { fire = fn; return 1; }; });
  if (fire) fire();
  $(w, 'span.captcha').textContent = 'Late42';
  await tick();
  assert.equal($(w, '#SecurityCode').value, 'Late42');
});
