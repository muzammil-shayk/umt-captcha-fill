const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = () => JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

test('is Manifest V3 named "UMT Captcha Fill", with the description saying it is unofficial', () => {
  const m = read();
  assert.equal(m.manifest_version, 3);
  assert.equal(m.name, 'UMT Captcha Fill');
  assert.match(m.description, /unofficial/i);
});

test('asks for no permissions at all', () => {
  const m = read();
  assert.equal(m.permissions, undefined);
  assert.equal(m.optional_permissions, undefined);
  assert.equal(m.host_permissions, undefined);
  assert.equal(m.background, undefined);
});

test('runs one content script, only on the portal, at document_idle', () => {
  const m = read();
  assert.deepEqual(m.content_scripts, [
    { matches: ['https://online.umt.edu.pk/*'], js: ['content.js'], run_at: 'document_idle' },
  ]);
});

test('declares a gecko id and no data collection', () => {
  const g = read().browser_specific_settings.gecko;
  assert.match(g.id, /^[a-zA-Z0-9-._]*@[a-zA-Z0-9-._]+$/);
  assert.deepEqual(g.data_collection_permissions, { required: ['none'] });
});

test('desktop Firefox only: min version 140 supports data_collection_permissions, no gecko_android', () => {
  const b = read().browser_specific_settings;
  assert.ok(parseFloat(b.gecko.strict_min_version) >= 140);
  assert.equal(b.gecko_android, undefined);
});

test('icons 48, 96 and 128 exist on disk', () => {
  const icons = read().icons;
  for (const size of ['48', '96', '128']) {
    assert.ok(icons[size], `icon ${size}`);
    assert.ok(fs.existsSync(path.join(root, icons[size])), icons[size]);
  }
});

test('content script makes no network calls and stores nothing', () => {
  const src = fs.readFileSync(path.join(root, 'content.js'), 'utf8');
  assert.doesNotMatch(src, /fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|browser\.|chrome\.|eval|Function\(|\.submit|\.click/);
});
