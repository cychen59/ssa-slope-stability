// Part 3: advanced chapters 9–16
const L = require('./lib.js');
const log = (...a) => console.log(...a);
const ONLY = process.argv[2] ? process.argv[2].split(',') : null;
const want = k => !ONLY || ONLY.includes(k);
const T1 = L.path.join(L.EX, 'tutorial-1-slope.json');
const waitBusy = async p => { await p.waitForTimeout(300); await p.waitForFunction(() => !document.querySelector('#btnRun').disabled, null, { timeout: 300000 }); await p.waitForTimeout(300); };
(async () => {
  const { b, p } = await L.open();
  const fresh = async () => { await p.goto(p.url()); await p.waitForTimeout(900); await L.loadJSON(p, T1); };
  if (want('ctrl')) {   // ---- 9 control points
    await fresh(); await L.tab(p, 'geo'); await p.check('#ctrlOn'); await p.click('#btnCtrlAdd'); await p.waitForTimeout(200);
    const c = '#ctrlList [data-c="0"]';
    const sel = (await p.$(c)) ? c : '#ctrlList .rcard:first-child';
    for (const [f, v] of [['name', 'BH-1 傾斜管'], ['x', '28'], ['depth', '8'], ['tol', '0.3']]) { await p.fill(`${sel} [data-cf="${f}"]`, v); await p.press(`${sel} [data-cf="${f}"]`, 'Tab'); }
    await p.waitForTimeout(200);
    await L.shot(p, '#ctrlSec', '09-ctrl.png');
    await L.runSearch(p); log('ctrl', await L.fsText(p));
    await L.shot(p, '.board', '09-board.png'); 
  }
  if (want('circle')) { // ---- 10 specified surface from a circle, 11 back analysis
    await fresh(); await L.tab(p, 'geo'); await p.click('#lineList .lrow:has-text("指定滑動面")');
    await p.fill('#ciXc', '14'); await p.fill('#ciZc', '34'); await p.fill('#ciR', '26'); await p.click('#btnCircle'); await waitBusy(p);
    log('circle', await L.fsText(p));
    await L.shotUnion(p, ['[data-pane="geo"] .sec:nth-of-type(2)'], '10-circle.png');
    await L.shot(p, '.board', '10-board.png');
    // back analysis on the critical surface after a rain (water raised 2 m)
    await fresh(); await L.runSearch(p); await L.tab(p, 'geo'); await p.click('#lineList .lrow:has-text("指定滑動面")'); await p.click('#btnCopyCrit'); await p.waitForTimeout(300);
    await L.setLine(p, '地下水位線', [[0, 9], [15, 10.5], [35, 19], [70, 23]]);
    await p.click('#btnTrial'); await waitBusy(p); log('trial', await L.fsText(p));
    await L.tab(p, 'set'); await p.selectOption('#bkParam', 'phi'); await p.fill('#bkTarget', '1'); await p.click('#btnBack');
    await p.waitForFunction(() => document.querySelector('#bkOut').textContent.trim().length > 20 && !document.querySelector('#btnBack').disabled, null, { timeout: 300000 }); await p.waitForTimeout(500);
    log('back', (await p.textContent('#bkOut')).replace(/\s+/g, ' ').slice(0, 300));
    await L.shot(p, '#backSec', '11-back.png');
  }
  if (want('piezo')) {  // ---- 12 piezometric line and ru
    await fresh(); await L.tab(p, 'geo'); await p.click('#btnAddPiezo'); await p.waitForTimeout(200);
    await p.fill('#coords', [[0, 11], [15, 14], [35, 22], [70, 24.5]].map(q => q.join('\t')).join('\n')); await p.click('#btnApply');
    await p.fill('#piezoName', 'BH-2 風化岩水頭'); await p.$eval('#piezoName', e => { e.dispatchEvent(new Event('change', { bubbles: true })); e.blur(); }); await p.waitForTimeout(200);
    await L.shotUnion(p, ['[data-pane="geo"] .sec:nth-of-type(1)', '[data-pane="geo"] .sec:nth-of-type(2)'], '12-piezo-line.png');
    await L.tab(p, 'soil'); await p.selectOption('.layer[data-i="1"] [data-f="poreType"]', 'p0'); await p.waitForTimeout(300);
    await L.shot(p, '.layer[data-i="1"]', '12-soil-pore.png');
    await L.runSearch(p); log('piezo', await L.fsText(p)); await L.shot(p, '.board', '12-board.png');
    await L.tab(p, 'soil'); await p.selectOption('.layer[data-i="0"] [data-f="poreType"]', 'ru'); await p.waitForTimeout(200);
    await p.fill('.layer[data-i="0"] [data-f="ru"]', '0.2'); await p.press('.layer[data-i="0"] [data-f="ru"]', 'Tab'); await p.waitForTimeout(200);
    await L.shot(p, '.layer[data-i="0"]', '12-ru.png');
  }
  if (want('pond')) {   // ---- 13 ponded water and tension crack
    await fresh(); await L.setLine(p, '地下水位線', [[0, 13], [16, 13], [35, 17], [70, 21]]);
    await L.tab(p, 'set'); await p.check('#s-tcOn'); await p.waitForTimeout(200); await p.check('#s-tcWater'); await p.waitForTimeout(200);
    await L.runSearch(p); log('pond', await L.fsText(p));
    await L.tab(p, 'set'); await L.shot(p, '#tcSec', '13-tc.png');
    await L.shot(p, '.board', '13-board.png');
  }
  if (want('pile')) {   // ---- 14 piles
    await fresh(); await L.tab(p, 'reinf'); await p.click('#btnAddPile'); await p.waitForTimeout(200);
    const c = '#reinfList .rcard:first-child';
    for (const [f, v] of [['x', '22'], ['L', '12'], ['D', '2']]) { await p.fill(`${c} [data-f="${f}"]`, v); await p.press(`${c} [data-f="${f}"]`, 'Tab'); }
    await L.runSearch(p); log('pile run', await L.fsText(p));
    await L.tab(p, 'reinf'); await p.fill('#pdPFs', '1.5'); await p.press('#pdPFs', 'Tab'); await p.click('#btnPileDesign');
    await p.waitForFunction(() => document.querySelector('#pdOut').textContent.trim().length > 30, null, { timeout: 300000 }); await p.waitForTimeout(800);
    log('pd', (await p.textContent('#pdOut')).replace(/\s+/g, ' ').slice(0, 400));
    await L.shot(p, c, '14-pile-card.png'); await L.shot(p, '#pileSec', '14-pd.png');
    for (const [f, v] of [['Do', '406.4'], ['t', '12.7'], ['D', '1.5'], ['L', '14']]) { await p.fill(`${c} [data-f="${f}"]`, v); await p.press(`${c} [data-f="${f}"]`, 'Tab'); }
    await L.runSearch(p); await L.tab(p, 'reinf'); await p.click('#btnPileDesign'); await p.waitForTimeout(1500);
    log('pd2', (await p.textContent('#pdOut')).replace(/\s+/g, ' ').slice(0, 900));
    await L.shot(p, '#pdOut', '14-pd2.png');
    await p.click('#btnAddMpile'); await p.click('#btnAddGeo'); await p.waitForTimeout(200);
    await L.shot(p, '#reinfList .rcard:nth-child(2)', '14-mpile.png'); await L.shot(p, '#reinfList .rcard:nth-child(3)', '14-geo.png');
  }
  if (want('method')) { // ---- 15 methods and search settings
    await fresh(); await L.tab(p, 'set'); await p.selectOption('#s-method', 'spencer'); await p.waitForTimeout(200);
    await L.shot(p, '[data-pane="set"] .sec:has(#s-method)', '15-method.png');
    await L.runSearch(p); log('spencer', await L.fsText(p)); await L.shot(p, '#results', '15-results.png');
    await L.tab(p, 'set'); await L.shot(p, '[data-pane="set"] .sec:has(#s-nCol)', '15-search.png');
    await L.shot(p, '[data-pane="set"] .sec:has(#s-tol)', '15-conv.png');
  }
  if (want('verify')) { // ---- 16 verification report and units
    await fresh(); await L.tab(p, 'soil'); await L.shotUnion(p, ['[data-pane="soil"] > .grid2'], '16-units.png');
    await L.tab(p, 'doc'); await p.click('#btnVerify');
    await p.waitForFunction(() => !document.querySelector('#btnVerify').disabled && document.querySelector('#verOut details'), null, { timeout: 590000 });
    await p.evaluate(() => document.querySelectorAll('#verOut details').forEach(d => d.open = false));
    log('verify', (await p.textContent('#verOut')).replace(/\s+/g, ' ').slice(0, 120));
    await L.shot(p, '#verOut', '16-verify.png');
  }
  log('ERR', p.errs); await b.close();
})();
