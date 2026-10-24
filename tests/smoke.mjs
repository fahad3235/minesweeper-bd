// Headless-Chrome smoke test via raw CDP. Run: node tests/smoke.mjs
// Requires /opt/meta-chromium/chrome. Exits non-zero on any failed check.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const INDEX = 'file://' + path.resolve(DIR, '..', 'index.html');
const PORT = 9333;
const chrome = spawn('/opt/meta-chromium/chrome', [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  '--user-data-dir=/tmp/msbd-smoke-profile',
  '--remote-debugging-port=' + PORT, 'about:blank',
], { stdio: 'ignore' });

let ws, msgId = 0;
const pending = new Map();
const consoleErrors = [];
function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.result?.subtype === 'error' || r.exceptionDetails) {
    throw new Error('evaluate failed: ' + expr + ' -> ' + JSON.stringify(r.exceptionDetails || r.result));
  }
  return r.result.value;
}
let checks = 0;
function check(name, cond) {
  checks++;
  if (!cond) throw new Error('CHECK FAILED: ' + name);
  console.log('ok - ' + name);
}
try {
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch('http://127.0.0.1:' + PORT + '/json')).json(); break; }
    catch { await sleep(200); }
  }
  if (!targets) throw new Error('chrome debugging endpoint never came up');
  ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((res) => { ws.onopen = res; });
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d); pending.delete(d.id); }
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') {
      consoleErrors.push(JSON.stringify(d.params.args));
    }
    if (d.method === 'Runtime.exceptionThrown') consoleErrors.push('exception');
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: INDEX });
  for (let i = 0; i < 50; i++) {
    if (await ev("document.readyState === 'complete' && !!document.querySelector('.cell')")) break;
    await sleep(200);
  }
  check('title is Minesweeper BD', await ev('document.title') === 'Minesweeper BD');
  check('beginner board has 81 cells', await ev("document.querySelectorAll('.cell').length") === 81);
  check('4 difficulty buttons present', await ev("document.querySelectorAll('.diff-btn').length") === 4);
  check('first click reveals cells (first-click safety + flood)', await ev(
    "document.querySelector('.cell').click(); document.querySelectorAll('.cell.open').length > 0"));
  check('mine counter drops after flagging', await ev(
    "document.getElementById('modeBtn').click();" +
    "document.querySelector('.cell:not(.open)').click();" +
    "document.querySelectorAll('.cell.flag').length === 1"));
  check('language toggle switches subtitle to Bangla', await ev(
    "document.getElementById('langBtn').click();" +
    "document.querySelector('.subtitle').textContent !== 'Dodge the mines, open every safe cell.'"));
  check('language toggle back restores English subtitle', await ev(
    "document.getElementById('langBtn').click();" +
    "document.querySelector('.subtitle').textContent === 'Dodge the mines, open every safe cell.'"));
  check('custom validation rejects rows=3', await ev(
    "document.getElementById('inRows').value = '3';" +
    "document.getElementById('customForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));" +
    "document.getElementById('customError').textContent.length > 0"));
  check('expert board renders 480 cells', await ev(
    "document.querySelectorAll('.diff-btn')[2].click();" +
    "document.querySelectorAll('.cell').length === 480"));
  await send('Page.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await sleep(300);
  check('beginner board fits 390px viewport without horizontal overflow', await ev(
    "document.querySelectorAll('.diff-btn')[0].click();" +
    "document.documentElement.scrollWidth <= 391"));
  check('no console errors or page exceptions', consoleErrors.length === 0);
  console.log('ALL ' + checks + ' SMOKE CHECKS PASSED');
} finally {
  try { ws?.close(); } catch {}
  chrome.kill('SIGKILL');
}
