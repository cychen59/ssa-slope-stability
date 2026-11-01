// Build the PDF manual: node build-pdf.js  (MLANG=en or ja for the translations; needs the repo served at SSA_ORIGIN, default http://127.0.0.1:8766/)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const ORIGIN = process.env.SSA_ORIGIN || 'http://127.0.0.1:8766/';
const LANG = ['en', 'ja'].includes(process.env.MLANG) ? process.env.MLANG : 'zh';
const MANUAL = path.join(__dirname, '..');
const ROOT = LANG === 'zh' ? MANUAL : path.join(MANUAL, LANG);
const T = {
  zh: { file: 'SSA-使用手冊.pdf', url: 'manual/index.html', font: 'Noto Sans CJK TC', title: 'SSA 邊坡穩定分析 使用手冊', author: '陳振宇', subj: v => `SSA v${v} 使用手冊`, foot: (m, v) => `SSA 邊坡穩定分析 使用手冊 ${m}（對應程式 v${v}）` },
  en: { file: 'SSA-User-Manual-EN.pdf', url: 'manual/en/index.html', font: 'Noto Sans', title: 'SSA Slope Stability Analysis User Manual', author: 'Chen-Yu Chen', subj: v => `User manual for SSA v${v}`, foot: (m, v) => `SSA Slope Stability Analysis User Manual ${m} (program v${v})` },
  ja: { file: 'SSA-User-Manual-JA.pdf', url: 'manual/ja/index.html', font: 'Noto Sans CJK JP', title: 'SSA 斜面安定解析 ユーザーマニュアル', author: '陳振宇 (Chen-Yu Chen)', subj: v => `SSA v${v} ユーザーマニュアル`, foot: (m, v) => `SSA 斜面安定解析 ユーザーマニュアル ${m}（プログラム v${v}）` },
}[LANG];
const OUT = path.join(ROOT, T.file);
(async () => {
  // the manual must match the program version
  const app = fs.readFileSync(path.join(MANUAL, '..', 'index.html'), 'utf8');
  const ver = (app.match(/SSA_VERSION = '([^']+)'/) || [])[1];
  const man = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const mver = (man.match(/data-ssa-version="([^"]+)"/) || [])[1];
  if (ver !== mver) console.warn(`!! [${LANG}] 手冊標示的程式版本 ${mver} 與程式 ${ver} 不同，請檢查手冊內容後更新 data-ssa-version。`);
  const manVer = (man.match(/data-manual-version="([^"]+)"/) || [])[1];
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(ORIGIN + T.url, { waitUntil: 'networkidle' }); await p.emulateMedia({ media: 'print' });
  const opts = { format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, outline: true, tagged: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font:7.5px '${T.font}','Noto Sans CJK TC',sans-serif;color:#7a8682;padding:0 15mm;display:flex;justify-content:space-between"><span>${T.foot(manVer, ver)}</span><span class="pageNumber"></span></div>` };
  // pass 1: mark chapter headings and find their pages
  await p.evaluate(() => document.querySelectorAll('section.chap').forEach(s => { const m = document.createElement('span'); m.className = 'pgmark'; m.textContent = `@@${s.id}@@`; s.querySelector('h2').appendChild(m); }));
  const tmp = path.join(require('os').tmpdir(), `ssa-manual-pass1-${LANG}.pdf`);
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
  const body = path.join(require('os').tmpdir(), `ssa-manual-body-${LANG}.pdf`), cover = path.join(require('os').tmpdir(), `ssa-manual-cover-${LANG}.pdf`);
  await p.pdf(Object.assign({ path: body }, opts));
  await p.pdf(Object.assign({}, opts, { path: cover, displayHeaderFooter: false, outline: false, pageRanges: '1' }));
  // the cover page without the footer
  execFileSync('python3', ['-c', `
import sys
from pypdf import PdfReader, PdfWriter
w = PdfWriter(clone_from=sys.argv[1])
w.insert_page(PdfReader(sys.argv[2]).pages[0], 0)
w.remove_page(1)
w.add_metadata({'/Title': sys.argv[4], '/Author': sys.argv[5], '/Subject': sys.argv[6]})
w.write(sys.argv[3])`, body, cover, OUT, T.title, T.author, T.subj(ver)], { stdio: ['ignore', 'inherit', 'inherit'] });
  await b.close();
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB');
})();
