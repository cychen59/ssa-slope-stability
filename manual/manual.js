/* SSA manual: table of contents, figure numbers and version labels */
(function () {
  const meta = document.getElementById('meta').dataset;
  document.querySelectorAll('.v-ssa').forEach(e => e.textContent = 'v' + meta.ssaVersion);
  document.querySelectorAll('.v-date').forEach(e => e.textContent = meta.ssaDate);
  document.querySelectorAll('.v-man').forEach(e => e.textContent = meta.manualVersion);
  // figure numbers per chapter
  document.querySelectorAll('section.chap').forEach(sec => {
    const no = sec.id === 'ax' ? 'A' : sec.id.slice(1);
    sec.querySelectorAll('figure figcaption').forEach((c, i) => { const s = document.createElement('span'); s.className = 'fno'; s.textContent = `圖 ${no}-${i + 1}　`; c.prepend(s); });
  });
  // table of contents
  const toc = document.getElementById('tocList'); let n = 0;
  for (const el of document.querySelectorAll('#doc > .part, #doc > section.chap')) {
    const li = document.createElement('li');
    if (el.classList.contains('part')) {
      li.className = 'toc-part'; li.innerHTML = `<a href="#${el.id}">${el.querySelector('.part-no').textContent}　${el.querySelector('.part-title').textContent}</a>`;
    } else {
      const h = el.querySelector('h2'), cn = h.querySelector('.cn').textContent, t = h.textContent.replace(cn, '');
      li.className = 'toc-chap'; li.innerHTML = `<a href="#${el.id}"><span class="tc-n">${cn}</span><span class="tc-t">${t}</span><span class="pg" data-for="${el.id}"></span></a>`;
      const subs = [...el.querySelectorAll('h3')];
      subs.forEach((s, k) => { if (!s.id) s.id = `${el.id}-${k + 1}`; });
      if (subs.length) li.innerHTML += `<ol class="toc-sub">${subs.map(s => `<li><a href="#${s.id}">${s.textContent}</a></li>`).join('')}</ol>`;
    }
    toc.appendChild(li); n++;
  }
  // page numbers injected by the PDF build (window.__pages = { id: page })
  window.setPages = map => document.querySelectorAll('.pg').forEach(e => { e.textContent = map[e.dataset.for] || ''; });
})();
