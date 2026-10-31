// Part 2: chapters 7–8 (retaining wall at the toe, report)
const L = require('./lib.js'); const { execSync } = require('child_process'); const fs = require('fs');
const G1 = [[0, 10], [9.07, 10], [10.5, 12.5], [15, 12.5], [35, 22.5], [50, 24], [70, 25]];
const log = (...a) => console.log(...a);
(async () => {
  const { b, p } = await L.open();
  await L.loadJSON(p, L.path.join(L.EX, 'tutorial-2-nails.json'));
  await L.setLine(p, '地表線', G1); await p.click('#btnFit');
  await L.shotUnion(p, ['[data-pane="geo"] .sec:nth-of-type(2)'], '07-ground.png');
  // wall tab
  await L.tab(p, 'wall'); await p.click('#btnAddWall'); await p.waitForTimeout(200);
  const c = '[data-w="0"]';
  for (const [f, v] of [['x0', '8.5'], ['z0', '9'], ['H', '3.5'], ['B', '3'], ['b', '1']]) { await p.fill(`${c} [data-p="${f}"]`, v); await p.press(`${c} [data-p="${f}"]`, 'Tab'); }
  await p.fill(`${c} [data-wf="name"]`, '坡趾重力式擋土牆'); await p.press(`${c} [data-wf="name"]`, 'Tab');
  await p.fill(`${c} [data-wf="gamma"]`, '23.5'); await p.press(`${c} [data-wf="gamma"]`, 'Tab');
  await p.waitForTimeout(300);
  await L.shotUnion(p, ['[data-pane="wall"] .sec:nth-of-type(1)'], '07-code.png');
  await L.shot(p, c, '07-wall-card.png');
  await L.shot(p, '#wallOut', '07-check-1.png'); log('wall1', (await p.textContent('#wallOut')).replace(/\s+/g, ' ').slice(0, 400));
  await p.evaluate(() => { document.querySelector('[data-dk="x0"]').open = true; });
  await p.check(`${c} [data-xs="passive"]`); await p.waitForTimeout(300);
  await L.shot(p, `${c} [data-dk="x0"]`, '07-ext.png');
  await p.evaluate(() => { document.querySelector('[data-dk="x0"]').open = false; });
  await L.shot(p, '#wallOut', '07-check-2.png'); log('wall2', (await p.textContent('#wallOut')).replace(/\s+/g, ' ').slice(0, 400));
  await p.evaluate(() => { const d = document.querySelector('#wallOut details'); if (d) d.open = true; });
  await L.shot(p, '#wallOut details', '07-forces.png');
  await p.evaluate(() => { const d = document.querySelector('#wallOut details'); if (d) d.open = false; });
  // global stability with the wall
  await L.runSearch(p); log('ch7 run', await L.fsText(p));
  await L.tab(p, 'wall'); await L.shot(p, '.board', '07-board-global.png');
  { const bb = await (await p.$('#cv')).boundingBox(); const sy = await p.evaluate(() => scrollY);
    await p.screenshot({ path: L.path.join(L.IMG, '07-board-forces.png'), fullPage: true, clip: { x: bb.x, y: bb.y + sy + bb.height * 0.28, width: bb.width * 0.42, height: bb.height * 0.5 } }); }
  await L.runScen(p); log('ch7 scen', (await p.textContent('#scenOut table')).replace(/\s+/g, ' '));
  await L.shot(p, '#scenOut table', '07-summary.png');
  // ---- chapter 8: report
  await L.tab(p, 'case');
  for (const [id, v] of [['#rep-title', '道路上邊坡穩定分析計算書'], ['#rep-project', 'SSA 使用手冊教學案例'], ['#rep-author', '○○工程顧問公司 王○○'], ['#rep-note', '教學用案例，參數為假設值。']]) { await p.fill(id, v); await p.press(id, 'Tab'); }
  await L.shotUnion(p, ['[data-pane="case"] .sec:nth-of-type(2)'], '08-report-form.png');
  const [d] = await Promise.all([p.waitForEvent('download'), p.click('#btnRepDocx')]);
  const docx = L.path.join(L.EX, 'tutorial-report.docx'); await d.saveAs(docx);
  await L.saveJSON(p, L.path.join(L.EX, 'tutorial-3-wall.json'));
  await L.tab(p, 'set'); await L.shotUnion(p, ['#saveSec', '[data-pane="set"] .sec:last-child .row'], '08-save.png');
  log('ERR', p.errs); await b.close();
  // render report pages
  execSync(`cd /tmp && rm -rf rep && mkdir rep && soffice --headless --convert-to pdf --outdir /tmp/rep "${docx}" >/dev/null 2>&1`);
  const pdf = '/tmp/rep/tutorial-report.pdf'; fs.copyFileSync(pdf, L.path.join(L.EX, 'tutorial-report.pdf'));
  execSync(`pdftoppm -r 70 -png ${pdf} /tmp/rep/pg`); log(fs.readdirSync('/tmp/rep').join(' '));
})();
