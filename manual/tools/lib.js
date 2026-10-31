// helpers for driving the SSA page and taking manual screenshots
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.SSA_URL || 'http://127.0.0.1:8766/index.html';
const IMG = path.join(__dirname, '..', 'img');
const EX = path.join(__dirname, '..', 'examples');
async function open(o = {}) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: o.w || 1400, height: o.h || 1000 }, deviceScaleFactor: 2, acceptDownloads: true, locale: 'zh-TW' });
  const p = await ctx.newPage();
  p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto(BASE + '?lang=zh'); await p.waitForTimeout(1200);
  return { b, p };
}
const tab = (p, t) => p.click('#tab-' + t);
async function setLine(p, label, pts) {
  await tab(p, 'geo');
  await p.click(`#lineList .lrow:has-text("${label}")`);
  await p.fill('#coords', pts.map(q => q.join('\t')).join('\n'));
  await p.click('#btnApply'); await p.waitForTimeout(150);
}
// screenshot the union of several elements (sidebar sections etc.)
async function shotUnion(p, sels, file, pad = 6) {
  const boxes = [];
  for (const s of sels) { const e = await p.$(s); if (!e) throw new Error('no ' + s); await e.scrollIntoViewIfNeeded(); }
  const first = await p.$(sels[0]); await first.scrollIntoViewIfNeeded();
  for (const s of sels) { const bb = await (await p.$(s)).boundingBox(); boxes.push(bb); }
  const x = Math.min(...boxes.map(b => b.x)) - pad, y = Math.min(...boxes.map(b => b.y)) - pad;
  const x2 = Math.max(...boxes.map(b => b.x + b.width)) + pad, y2 = Math.max(...boxes.map(b => b.y + b.height)) + pad;
  // make the region visible: use full-page screenshot with clip
  const sy = await p.evaluate(() => window.scrollY);
  await p.screenshot({ path: path.join(IMG, file), clip: { x, y: y + sy, width: x2 - x, height: y2 - y }, fullPage: true });
}
async function shot(p, sel, file) { const e = await p.$(sel); await e.scrollIntoViewIfNeeded(); await e.screenshot({ path: path.join(IMG, file) }); }
// numbered callouts placed on elements
async function badges(p, list) {
  await p.evaluate(list => {
    document.querySelectorAll('.mbadge').forEach(e => e.remove());
    for (const [sel, n, dx, dy] of list) {
      const e = document.querySelector(sel); if (!e) continue; const r = e.getBoundingClientRect();
      const d = document.createElement('div'); d.className = 'mbadge'; d.textContent = n;
      Object.assign(d.style, { position: 'absolute', left: (r.left + window.scrollX + (dx || 0)) + 'px', top: (r.top + window.scrollY + (dy || 0)) + 'px', width: '26px', height: '26px', borderRadius: '13px', background: '#C0392B', color: '#fff', font: '700 15px/26px sans-serif', textAlign: 'center', zIndex: 9999, boxShadow: '0 1px 4px rgba(0,0,0,.35)' });
      document.body.appendChild(d);
    }
  }, list);
}
const clearBadges = p => p.evaluate(() => document.querySelectorAll('.mbadge').forEach(e => e.remove()));
async function runSearch(p) {
  await p.click('#btnRun');
  await p.waitForFunction(() => !document.querySelector('#btnRun').disabled, null, { timeout: 300000 }); await p.waitForTimeout(400);
}
async function runScen(p) {
  await tab(p, 'case'); await p.click('#btnScenRun');
  await p.waitForFunction(() => !document.querySelector('#btnScenRun').disabled && document.querySelector('#scenOut table'), null, { timeout: 600000 }); await p.waitForTimeout(400);
}
async function loadJSON(p, file) { await p.setInputFiles('#fileIn', file); await p.waitForTimeout(800); }
async function saveJSON(p, file) { await tab(p, 'set'); const [d] = await Promise.all([p.waitForEvent('download'), p.click('#btnSaveJson')]); await d.saveAs(file); }
const fsText = p => p.$eval('#results', e => e.textContent.replace(/\s+/g, ' ').slice(0, 200));
module.exports = { open, tab, setLine, shotUnion, shot, badges, clearBadges, runSearch, runScen, loadJSON, saveJSON, fsText, IMG, EX, path };
