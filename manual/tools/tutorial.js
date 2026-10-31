// Part 1: beginner tutorial (chapters 0–8). Writes images to ../img and example files to ../examples
const L = require('./lib.js'); const fs = require('fs');
const G0 = [[0, 10], [10, 10], [35, 22.5], [50, 24], [70, 25]];
const B1 = [[0, 6], [15, 7.5], [35, 16], [70, 19]];
const B2 = [[0, 2], [35, 9], [70, 12]];
const WT = [[0, 7], [15, 8.5], [35, 17], [70, 21]];
const G1 = [[0, 10], [9.07, 10], [10.5, 12.5], [15, 12.5], [35, 22.5], [50, 24], [70, 25]];
const log = (...a) => console.log(...a);
(async () => {
  const { b, p } = await L.open();
  // ---- chapter 0: overview with callouts
  await L.badges(p, [['header.top .top-actions', '1', -6, -12], ['.tabs', '2', -14, -10], ['.toolbar', '3', -14, -10], ['#cv', '4', 10, 30], ['#btnRun', '5', -20, -14], ['#results', '6', -14, -10], ['.statusbar', '7', -14, -4]]);
  await p.screenshot({ path: L.path.join(L.IMG, '00-overview.png') });
  await L.clearBadges(p);
  // ---- chapter 1: profile
  await L.setLine(p, '地表線', G0);
  await L.shotUnion(p, ['[data-pane="geo"] .sec:nth-of-type(1)', '[data-pane="geo"] .sec:nth-of-type(2)'], '01-ground.png');
  await L.setLine(p, '風化岩', B1); await L.setLine(p, '岩盤', B2); await L.setLine(p, '地下水位線', WT);
  await p.fill('#zBase', '0'); await p.press('#zBase', 'Tab'); await p.click('#btnFit'); await p.waitForTimeout(300);
  await L.shot(p, '.board', '01-profile.png');
  await p.click('[data-pane="geo"] details.sample summary');
  await L.shot(p, '[data-pane="geo"] .sec:has(#csvIn)', '01-csv.png');
  // ---- chapter 2: soils
  await L.tab(p, 'soil'); await L.shot(p, '[data-pane="soil"]', '02-soils.png');
  // ---- chapter 3: loads
  await L.tab(p, 'load'); await p.selectOption('#loadTpl', 'road'); await p.click('#btnAddLoad'); await p.waitForTimeout(200);
  const lc = '[data-l="0"]';
  for (const [f, v] of [['x1', '36'], ['x2', '44'], ['q', '10']]) { await p.fill(`${lc} [data-lf="${f}"]`, v); await p.press(`${lc} [data-lf="${f}"]`, 'Tab'); }
  await p.waitForTimeout(200);
  await L.shotUnion(p, ['[data-pane="load"] .sec:nth-of-type(1)'], '03-load.png');
  // ---- chapter 4: first run
  await L.runSearch(p); log('ch4', await L.fsText(p));
  await L.shot(p, '.board', '04-board.png'); await L.shot(p, '#results', '04-results.png');
  await L.saveJSON(p, L.path.join(L.EX, 'tutorial-1-slope.json'));
  // ---- chapter 5: soil nails
  await L.tab(p, 'reinf'); await p.selectOption('#s-reinfMode', 'passive'); await p.click('#btnAddNail'); await p.waitForTimeout(200);
  await p.fill('[data-r="0"] [data-f="L"]', '6').catch(async () => { await p.fill('#reinfList .rcard:nth-of-type(1) [data-f="L"]', '6'); });
  await p.press('#reinfList [data-f="L"]', 'Tab');
  await p.fill('#rbXa', '16'); await p.fill('#rbXb', '34'); await p.fill('#rbN', '8'); await p.click('#btnBatchReplace'); await p.waitForTimeout(300);
  await L.shotUnion(p, ['[data-pane="reinf"] .sec:nth-of-type(1)', '#reinfList .rcard:first-child'], '05-nail.png');
  await L.shot(p, '[data-pane="reinf"] .sec:has(#rbXa)', '05-batch.png');
  await L.runSearch(p); log('ch5 L6', await L.fsText(p));
  await L.shot(p, '#results', '05-results-L6.png');
  // lengthen: edit last nail then replace the whole row
  const last = '#reinfList .rcard:last-child [data-f="L"]';
  await p.fill(last, '9'); await p.press(last, 'Tab'); await p.click('#btnBatchReplace'); await p.waitForTimeout(300);
  await L.runSearch(p); log('ch5 L9', await L.fsText(p));
  await L.shot(p, '.board', '05-board-L9.png'); await L.shot(p, '#results', '05-results-L9.png');
  // ---- chapter 6: scenarios
  await L.tab(p, 'case');
  await p.fill('#scenList .rcard:has(span.no:text-is("S2")) [data-scf="dh"]', '2').catch(e => log('dh sel', e.message.slice(0, 80)));
  await p.press('#scenList .rcard:has(span.no:text-is("S2")) [data-scf="dh"]', 'Tab').catch(() => {});
  await p.fill('#scenList .rcard:has(span.no:text-is("S3")) [data-scf="kh"]', '0.15').catch(e => log('kh sel', e.message.slice(0, 80)));
  await p.press('#scenList .rcard:has(span.no:text-is("S3")) [data-scf="kh"]', 'Tab').catch(() => {});
  await p.waitForTimeout(200);
  await L.shot(p, '#scenList', '06-cases.png');
  await L.runScen(p); log('ch6', (await p.textContent('#scenOut')).replace(/\s+/g, ' ').slice(0, 300));
  await L.shot(p, '#scenOut', '06-summary.png');
  await L.saveJSON(p, L.path.join(L.EX, 'tutorial-2-nails.json'));
  log('ERR', p.errs); await b.close();
})();
