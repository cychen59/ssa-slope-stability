// Build the PDF manual: node build-pdf.js  (needs the repo served at SSA_URL's origin, default http://127.0.0.1:8766/)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const ORIGIN = process.env.SSA_ORIGIN || 'http://127.0.0.1:8766/';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'SSA-使用手冊.pdf');
(async () => {
  // the manual must match the program version
  const app = fs.readFileSync(path.join(ROOT, '..', 'index.html'), 'utf8');
  const ver = (app.match(/SSA_VERSION = '([^']+)'/) || [])[1];
  const man = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const mver = (man.match(/data-ssa-version="([^"]+)"/) || [])[1];
  if (ver !== mver) console.warn(`!! 手冊標示的程式版本 ${mver} 與程式 ${ver} 不同，請檢查手冊內容後更新 data-ssa-version。`);
  const manVer = (man.match(/data-manual-version="([^"]+)"/) || [])[1];
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(ORIGIN + 'manual/index.html', { waitUntil: 'networkidle' }); await p.emulateMedia({ media: 'print' });
  const opts = { format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, outline: true, tagged: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font:7.5px 'Noto Sans CJK TC',sans-serif;color:#7a8682;padding:0 15mm;display:flex;justify-content:space-between"><span>SSA 邊坡穩定分析 使用手冊 ${manVer}（對應程式 v${ver}）</span><span class="pageNumber"></span></div>` };
  // pass 1: mark chapter headings and find their pages
  await p.evaluate(() => document.querySelectorAll('section.chap').forEach(s => { const m = document.createElement('span'); m.className = 'pgmark'; m.textContent = `@@${s.id}@@`; s.querySelector('h2').appendChild(m); }));
  const tmp = path.join(require('os').tmpdir(), 'ssa-manual-pass1.pdf');
  await p.pdf(Object.assign({ path: tmp }, opts));
  const map = JSON.parse(execFileSync('python3', ['-c', `
import pdfplumber, json, re, sys
out = {}
with pdfplumber.open(sys.argv[1]) as pdf:
    for i, pg in enumerate(pdf.pages):
        for m in re.findall(r'@@(c\\d+|ax)@@', pg.extract_text() or ''):
            out.setdefault(m, i + 1)
print(json.dumps(out))`, tmp], { stdio: ['ignore', 'pipe', 'ignore'] }).toString());
  console.log('chapter pages', map);
  // pass 2: page numbers in the table of contents
  await p.evaluate(map => { document.querySelectorAll('.pgmark').forEach(e => e.remove()); window.setPages(map); }, map);
  const body = path.join(require('os').tmpdir(), 'ssa-manual-body.pdf'), cover = path.join(require('os').tmpdir(), 'ssa-manual-cover.pdf');
  await p.pdf(Object.assign({ path: body }, opts));
  await p.pdf(Object.assign({}, opts, { path: cover, displayHeaderFooter: false, outline: false, pageRanges: '1' }));
  // the cover page without the footer
  execFileSync('python3', ['-c', `
import sys
from pypdf import PdfReader, PdfWriter
w = PdfWriter(clone_from=sys.argv[1])
w.insert_page(PdfReader(sys.argv[2]).pages[0], 0)
w.remove_page(1)
w.add_metadata({'/Title': 'SSA 邊坡穩定分析 使用手冊', '/Author': '陳振宇', '/Subject': 'SSA v' + sys.argv[4] + ' 使用手冊'})
w.write(sys.argv[3])`, body, cover, OUT, ver], { stdio: ['ignore', 'inherit', 'inherit'] });
  await b.close();
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB');
})();
