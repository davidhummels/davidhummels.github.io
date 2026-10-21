/* Econ 432 Math Toolkit — rendering, routing and answer checking.
   Content (modules, skills, problems) lives in content.js. */
(function () {
  'use strict';
  const MT = window.MT;
  const $ = (sel, el = document) => el.querySelector(sel);
  const h = (tag, attrs = {}, html) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
    }
    if (html !== undefined) el.innerHTML = html;
    return el;
  };

  /* ---------- math rendering ---------- */
  function typeset(el) {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(el, {
          delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }],
          throwOnError: false
        });
      } catch (e) { /* leave raw TeX */ }
    }
  }

  /* ---------- progress (per browser, optional) ---------- */
  const STORE = 'econ432-math-toolkit-v1';
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { progress = {}; }
  function markDone(id) {
    progress[id] = true;
    try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch (e) { /* private mode */ }
    renderSide();
  }
  function skillProgress(sk) {
    const n = sk.problems.length; let d = 0;
    for (const p of sk.problems) if (progress[p.id]) d++;
    return { d, n };
  }

  /* ---------- indexes ---------- */
  const skillIndex = {}; const moduleOfSkill = {}; const flatSkills = [];
  for (const m of MT.modules) for (const s of (m.skills || [])) { skillIndex[s.id] = s; moduleOfSkill[s.id] = m; flatSkills.push(s); }
  const moduleIndex = {}; for (const m of MT.modules) moduleIndex[m.id] = m;
  const lectureTitle = {}; for (const l of MT.lectures) lectureTitle[l.n] = l.title;

  /* ---------- number + expression parsing ---------- */
  function setupMath() {
    if (!window.math || setupMath.done) return;
    try { window.math.import({ ln: function (x) { return Math.log(x); } }, { override: false }); } catch (e) { /* already there */ }
    setupMath.done = true;
  }
  function parseNumber(raw) {
    let s = String(raw).trim();
    if (!s) return { empty: true };
    let pct = false;
    s = s.replace(/[$,\s]/g, '').replace(/−/g, '-').replace(/×/g, '*');
    if (s.endsWith('%')) { pct = true; s = s.slice(0, -1); }
    let v = Number(s);
    if (!isFinite(v)) {
      setupMath();
      try { v = window.math ? Number(window.math.evaluate(s.replace(/\bln\(/g, 'log('))) : NaN; } catch (e) { v = NaN; }
    }
    if (!isFinite(v)) return { error: 'I couldn’t read that as a number. Try something like 0.15, 2.5% or 3^1.5.' };
    return { v, pct };
  }

  const ALLOWED_FN = new Set(['ln', 'log', 'exp', 'sqrt']);
  function normalizeExpr(s) {
    return String(s).replace(/α/g, 'alpha').replace(/θ/g, 'theta').replace(/σ/g, 'sigma').replace(/−/g, '-').replace(/·|×/g, '*').replace(/\*\*/g, '^');
  }
  function parseExpr(raw, vars) {
    setupMath();
    if (!window.math) return { error: 'The algebra checker didn’t load. Check your connection and reload the page.' };
    const s = normalizeExpr(raw).trim();
    if (!s) return { empty: true };
    let node;
    try { node = window.math.parse(s); } catch (e) { return { error: 'I couldn’t parse that expression. Check your parentheses, and use * for multiplication and ^ for powers.' }; }
    const bad = [];
    node.traverse((n, path, parent) => {
      if (n.isFunctionNode) { const nm = n.fn && n.fn.name; if (nm && !ALLOWED_FN.has(nm)) bad.push('function ' + nm + '()'); }
      if (n.isSymbolNode && !(parent && parent.isFunctionNode && path === 'fn')) {
        if (!vars.includes(n.name) && n.name !== 'e' && n.name !== 'pi') bad.push(n.name);
      }
    });
    if (bad.length) {
      const nm = bad[0];
      return { error: `I don’t recognize <code>${nm}</code>. Use only ${vars.map(v => '<code>' + v + '</code>').join(', ')}, and put * between letters (write <code>alpha*K</code>, not <code>alphaK</code>).` };
    }
    return { node };
  }
  /* Live preview: render on every keystroke. Half-finished input (an open
     parenthesis, a trailing ^ or *) is patched just for display so the
     picture keeps up with the typing instead of waiting for valid syntax. */
  function renderPreview(raw, vars, box, note) {
    setupMath();
    const s = normalizeExpr(raw).trim();
    note.textContent = ''; note.className = 'me-note';
    if (!s) { box.innerHTML = '<span class="ph">The formatted equation appears here as you type.</span>'; box.classList.remove('partial'); return; }
    if (!window.math || !window.katex) { box.textContent = s; return; }
    let node = null, partial = false;
    try { node = window.math.parse(s); } catch (e) {
      let t = s.replace(/[+\-*/^(\s]+$/, '');
      const open = (t.match(/\(/g) || []).length - (t.match(/\)/g) || []).length;
      if (open > 0) t += ')'.repeat(open);
      try { if (t) { node = window.math.parse(t); partial = true; } } catch (e2) { node = null; }
    }
    if (!node) { box.classList.add('partial'); note.textContent = 'Keep typing… (this doesn’t parse yet)'; return; }
    try {
      // 'auto' drops grouping parentheses, so K^(alpha-1) shows as a clean exponent,
      // while K^alpha-1 visibly shows as K^alpha minus 1. Single letters stay italic,
      // and multiplication dots between letters are dropped to match textbook style.
      let tex = node.toTex({ parenthesis: 'auto', implicit: 'hide' });
      tex = tex.replace(/\\mathrm\{([A-Za-z])\}/g, '$1').replace(/\\cdot(?!\s*[0-9.])/g, '\\,');
      window.katex.render(tex, box, { throwOnError: false, displayMode: false });
    } catch (e) { box.textContent = s; }
    box.classList.toggle('partial', partial);
    if (partial) { note.textContent = 'Unfinished: missing parentheses are filled in for the preview.'; return; }
    const unknown = [];
    node.traverse((n, path, parent) => {
      if (n.isSymbolNode && !(parent && parent.isFunctionNode && path === 'fn') && !vars.includes(n.name) && n.name !== 'e' && n.name !== 'pi' && !unknown.includes(n.name)) unknown.push(n.name);
    });
    if (unknown.length) { note.className = 'me-note warn'; note.innerHTML = `<code>${unknown[0]}</code> isn’t one of the variables. Put * between letters, e.g. <code>alpha*K</code>.`; }
  }

  function atomicLogs(node) {
    let ok = true;
    node.traverse(n => {
      if (n.isFunctionNode && (n.fn.name === 'ln' || n.fn.name === 'log')) {
        const a = n.args[0]; if (!(a && a.isSymbolNode)) ok = false;
      }
    });
    return ok;
  }
  function sampleScopes(ranges, k = 8) {
    const out = [];
    for (let i = 0; i < k; i++) {
      const sc = {};
      for (const [v, [lo, hi]] of Object.entries(ranges)) sc[v] = lo + (hi - lo) * ((i * 0.6180339887 + Math.random() * 0.5) % 1);
      out.push(sc);
    }
    return out;
  }
  function evalNode(node, sc) { try { const r = node.compile().evaluate(Object.assign({}, sc)); return typeof r === 'number' ? r : Number(r); } catch (e) { return NaN; } }
  function sameExpr(nodeA, exprB, ranges) {
    setupMath();
    let nodeB; try { nodeB = typeof exprB === 'string' ? window.math.parse(normalizeExpr(exprB)) : exprB; } catch (e) { return false; }
    let n = 0;
    for (const sc of sampleScopes(ranges)) {
      const b = evalNode(nodeB, sc); if (!isFinite(b)) continue;
      const a = evalNode(nodeA, sc);
      if (!isFinite(a) || Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(b))) return false;
      n++;
    }
    return n >= 4;
  }

  /* ---------- checking ---------- */
  function close(a, b, tol) {
    const rel = tol && tol.rel !== undefined ? tol.rel : 0.006;
    const abs = tol && tol.abs !== undefined ? tol.abs : 0;
    return Math.abs(a - b) <= Math.max(abs, rel * Math.abs(b), 1e-12);
  }
  function check(spec, p, raw) {
    if (spec.type === 'expr') {
      const r = parseExpr(raw, Object.keys(spec.vars));
      if (r.empty) return { empty: true };
      if (r.error) return { parseError: r.error };
      if (sameExpr(r.node, spec.answer, spec.vars)) {
        if (spec.atomicLogs && !atomicLogs(r.node)) return { ok: false, diag: 'That’s equal to the right answer, but the log hasn’t been taken apart yet. Use the log rules until <code>ln</code> applies to a single letter, like <code>ln(K)</code>.' };
        return { ok: true };
      }
      for (const e of spec.errors || []) if (sameExpr(r.node, e.e, spec.vars)) return { ok: false, diag: e.msg };
      return { ok: false };
    }
    const r = parseNumber(raw);
    if (r.empty) return { empty: true };
    if (r.error) return { parseError: r.error };
    const v = r.v; const ans = spec.answer(p); const tol = spec.tol;
    if (close(v, ans, tol)) return { ok: true };
    for (const a of spec.alts || []) if (close(v, a.v(p), tol)) return { ok: true, note: a.msg(p) };
    for (const e of spec.errors || []) {
      const hit = e.v ? close(v, e.v(p), tol) : e.test(v, p);
      if (hit) return { ok: false, diag: e.msg(p) };
    }
    if (spec.unit === 'pct' && !r.pct && close(v * 100, ans, tol)) return { ok: false, diag: 'Right number, wrong units: it looks like you entered a decimal. Enter this one as a percent (type 4.5 for 4.5%).' };
    if (spec.unit !== 'pct' && r.pct && close(v / 100, ans, tol)) return { ok: true, note: 'Correct. (You wrote it as a percent, which is fine here.)' };
    if (close(-v, ans, tol)) return { ok: false, diag: 'Check the sign: you have the right size but the wrong direction.' };
    return { ok: false };
  }

  /* ---------- routing ---------- */
  function route() {
    const hsh = decodeURIComponent((location.hash || '').replace(/^#\/?/, ''));
    const [id, sub] = hsh.split('/');
    if (skillIndex[id]) return { view: 'skill', id };
    if (moduleIndex[id]) return { view: 'module', id };
    if (id === 'lectures') return { view: 'lectures', sub };
    return { view: 'home' };
  }
  function tellParent() {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'math-toolkit-hash', hash: location.hash }, '*');
      }
    } catch (e) { /* cross-origin parent */ }
  }
  function scrollTopNice() {
    try {
      if (window.parent && window.parent !== window && window.frameElement) {
        const r = window.frameElement.getBoundingClientRect();
        if (r.top < 0) window.parent.scrollBy({ top: r.top - 10 });
        return;
      }
    } catch (e) { /* ignore */ }
    window.scrollTo(0, 0);
  }

  /* ---------- sidebar ---------- */
  function renderSide() {
    const rt = route(); const side = $('#side');
    const curMod = rt.view === 'skill' ? moduleOfSkill[rt.id].id : rt.view === 'module' ? rt.id : null;
    let html = `<div class="side-head"><span>Econ 432</span><a href="#home">Math toolkit</a></div>
      <div class="side-links"><a href="#home" class="${rt.view === 'home' ? 'on' : ''}">All topics</a><a href="#lectures" class="${rt.view === 'lectures' ? 'on' : ''}">By lecture</a></div>`;
    for (const m of MT.modules) {
      if (m.planned) {
        html += `<div class="mod planned"><span><span class="num">${m.num}</span>${m.title}<span class="soon">soon</span></span></div>`;
        continue;
      }
      html += `<div class="mod"><a href="#${m.id}"><span class="num">${m.num}</span>${m.title}</a>`;
      if (curMod === m.id || true) {
        html += '<ul>' + m.skills.map(s => {
          const pr = skillProgress(s);
          return `<li><a href="#${s.id}" class="${rt.id === s.id ? 'on' : ''}"><span>${s.title}</span><span class="prog ${pr.d === pr.n ? 'done' : ''}">${pr.d}/${pr.n}</span></a></li>`;
        }).join('') + '</ul>';
      }
      html += '</div>';
    }
    side.innerHTML = html;
    typeset(side);
  }

  function lectureChips(list, label = 'Used in') {
    if (!list || !list.length) return '';
    return `<div class="chips"><span class="lbl">${label}</span>` + list.map(n => `<a class="chip" href="#lectures/${n}" title="${lectureTitle[n] || ''}">L${n}</a>`).join('') + '</div>';
  }

  /* ---------- views ---------- */
  function viewHome() {
    const main = $('#main');
    let cards = '';
    for (const m of MT.modules) {
      if (m.planned) {
        cards += `<div class="mcard planned"><span class="n">MODULE ${m.num} · COMING SOON</span><h3>${m.title}</h3><p>${m.blurb}</p></div>`;
      } else {
        let d = 0, n = 0; for (const s of m.skills) { const pr = skillProgress(s); d += pr.d; n += pr.n; }
        cards += `<a class="mcard" href="#${m.id}"><span class="n">MODULE ${m.num} · ${m.skills.length} SKILLS</span><h3>${m.title}</h3><p>${m.blurb}</p><div class="bar" title="${d} of ${n} problems solved"><i style="width:${n ? 100 * d / n : 0}%"></i></div></a>`;
      }
    }
    main.innerHTML = `
      <header><div class="eyebrow">Econ 432 · Growth and Innovation</div><h1>Math toolkit</h1>
      <p class="lead">${MT.intro}</p></header>
      <div class="howto">
        <div><b>Learn one idea</b>Each skill starts with a short explanation and an example taken from lecture.</div>
        <div><b>Try a problem</b>Type an answer. If it’s wrong, you get a hint aimed at the most likely slip.</div>
        <div><b>Break it down</b>Stuck? Split the problem into steps and solve them one at a time.</div>
        <div><b>New numbers</b>Get a fresh version of the same problem to check that it stuck.</div>
      </div>
      <section class="grid">${cards}</section>
      <div class="foot"><span>Progress is saved in this browser only. Nothing you type is sent anywhere.</span><a href="#lectures">Find the math for a specific lecture →</a></div>`;
    typeset(main);
  }

  function viewLectures(sub) {
    const main = $('#main');
    const byLec = {};
    for (const m of MT.modules) {
      for (const s of (m.skills || [])) for (const n of s.lectures) (byLec[n] = byLec[n] || []).push({ built: true, id: s.id, title: s.title });
      for (const s of (m.plannedSkills || [])) for (const n of s.lectures) (byLec[n] = byLec[n] || []).push({ built: false, title: s.title });
    }
    let rows = '';
    for (const l of MT.lectures) {
      const items = (byLec[l.n] || []);
      const built = items.filter(x => x.built), planned = items.filter(x => !x.built);
      const chips = built.map(x => `<a class="chip" href="#${x.id}">${x.title}</a>`).join(' ') +
        (planned.length ? ' ' + planned.map(x => `<span class="chip ghost" title="Coming soon">${x.title}</span>`).join(' ') : '');
      rows += `<tr id="lec-${l.n}"><td>${l.n}</td><td>${l.title}</td><td><div class="chips">${chips || '<span class="lbl">Mostly verbal: no new math</span>'}</div></td></tr>`;
    }
    main.innerHTML = `
      <header><div class="eyebrow">Econ 432 · Math toolkit</div><h1>Math by lecture</h1>
      <p class="lead">Find a lecture, then review the skills it uses. Solid chips link to finished skills; dashed ones are coming soon.</p></header>
      <div class="card" style="padding:8px 14px;overflow-x:auto"><table class="lec"><thead><tr><th>#</th><th>Lecture</th><th>Math used</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    typeset(main);
    if (sub) { const row = document.getElementById('lec-' + sub); if (row) { row.querySelectorAll('td').forEach(td => td.style.background = 'var(--accent-soft)'); setTimeout(() => { try { row.scrollIntoView({ block: 'center' }); } catch (e) { } }, 50); } }
  }

  function viewModule(id) {
    const m = moduleIndex[id]; const main = $('#main');
    const list = m.skills.map((s, i) => {
      const pr = skillProgress(s);
      return `<a class="mcard" href="#${s.id}"><span class="n">SKILL ${m.num}.${i + 1} · ${pr.d}/${pr.n} SOLVED</span><h3>${s.title}</h3><p>${s.summary}</p>${lectureChips(s.lectures)}</a>`;
    }).join('');
    main.innerHTML = `<header><div class="eyebrow"><a href="#home">Math toolkit</a> / Module ${m.num}</div><h1>${m.title}</h1><p class="lead">${m.intro || m.blurb}</p></header>
      <section class="grid">${list}</section>`;
    typeset(main);
  }

  function viewSkill(id) {
    const s = skillIndex[id]; const m = moduleOfSkill[id]; const main = $('#main');
    const i = flatSkills.indexOf(s);
    const prev = flatSkills[i - 1], next = flatSkills[i + 1];
    const idx = m.skills.indexOf(s) + 1;
    main.innerHTML = `<header><div class="eyebrow"><a href="#home">Math toolkit</a> / <a href="#${m.id}">${m.num}. ${m.title}</a> / Skill ${m.num}.${idx}</div>
      <h1>${s.title}</h1></header>
      ${lectureChips(s.lectures, 'Shows up in lecture')}
      <section class="card concept">${s.concept}</section>
      <div id="problems" style="display:flex;flex-direction:column;gap:16px"></div>
      <nav class="pager">${prev ? `<a class="prev" href="#${prev.id}"><span>← Previous</span>${prev.title}</a>` : '<span></span>'}${next ? `<a class="next" href="#${next.id}"><span>Next →</span>${next.title}</a>` : ''}</nav>`;
    typeset(main);
    if (s.afterRender) { try { s.afterRender(main); } catch (e) { console.error(e); } }
    const wrap = $('#problems', main);
    s.problems.forEach((pr, k) => wrap.appendChild(problemWidget(pr, k + 1, s.problems.length)));
  }

  /* ---------- problem widget ---------- */
  function inputFor(spec, onEnter) {
    const row = h('div', { class: 'answer-row' });
    const inp = h('input', { type: 'text', class: spec.type === 'expr' ? 'wide' : '', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Your answer', placeholder: spec.type === 'expr' ? (spec.placeholder || 'Type an expression') : (spec.unit === 'pct' ? 'e.g. 4.5' : 'Your answer') });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } });
    row.appendChild(inp);
    return { row, inp };
  }
  function unitNote(spec) {
    if (spec.type === 'expr') return 'Type it like a calculator: <code>*</code> to multiply, <code>^</code> for powers, <code>ln( )</code> for logs. Greek letters: <code>alpha</code>, <code>theta</code>.';
    if (spec.unit === 'pct') return 'Enter a percent (3.2 means 3.2%). About 3 significant digits is fine.';
    return spec.unitNote || 'About 3 significant digits is fine. You can type arithmetic like 2^1.5 or 15100*8880/1240.';
  }
  function feedback(el, res, spec, attempts) {
    el.hidden = false;
    if (res.parseError) { el.className = 'fb info'; el.innerHTML = res.parseError; return; }
    if (res.ok) {
      el.className = 'fb ok';
      el.innerHTML = `<p class="h">${res.note ? 'Accepted.' : pick(['Correct.', 'That’s it.', 'Right.', 'Nicely done.'])}</p>${res.note ? '<p>' + res.note + '</p>' : ''}${spec.after ? '<p>' + spec.after + '</p>' : ''}`;
    } else if (res.diag) {
      el.className = 'fb bad';
      el.innerHTML = `<p class="h">Not quite. Here’s what probably happened:</p><p>${res.diag}</p>`;
    } else {
      el.className = 'fb bad';
      el.innerHTML = `<p class="h">Not quite.</p><p>${attempts >= 2 ? 'Try breaking it into steps below. Each piece gets checked as you go.' : (spec.hintText || 'Check your work and try again, or ask for a hint.')}</p>`;
    }
    typeset(el);
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function mcBlock(spec, p, onResult) {
    const box = h('div', { class: 'mc', role: 'radiogroup' });
    const opts = spec.options(p).map((o, i) => Object.assign({ i }, o));
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    const name = 'mc-' + Math.random().toString(36).slice(2);
    for (const o of opts) {
      const lab = h('label');
      const r = h('input', { type: 'radio', name });
      lab.appendChild(r); lab.appendChild(h('span', {}, o.t));
      r.addEventListener('change', () => {
        box.querySelectorAll('label').forEach(l => l.classList.remove('picked-bad', 'picked-ok'));
        lab.classList.add(o.ok ? 'picked-ok' : 'picked-bad');
        onResult(o.ok ? { ok: true, note: null, why: o.why } : { ok: false, diag: o.why });
      });
      box.appendChild(lab);
    }
    return box;
  }

  function stepWidget(st, p, n, total, onDone) {
    const el = h('div', { class: 'step' });
    el.appendChild(h('div', { class: 's-title' }, `Step ${n} of ${total}`));
    el.appendChild(h('div', { class: 'prompt' }, typeof st.prompt === 'function' ? st.prompt(p) : st.prompt));
    const fb = h('div', { class: 'fb', hidden: true });
    let attempts = 0, solved = false;
    if (st.type === 'mc') {
      el.appendChild(mcBlock(st, p, res => {
        fb.hidden = false; fb.className = 'fb ' + (res.ok ? 'ok' : 'bad');
        fb.innerHTML = res.ok ? `<p class="h">Correct.</p>${res.why ? '<p>' + res.why + '</p>' : ''}` : `<p>${res.diag}</p>`;
        typeset(fb);
        if (res.ok && !solved) { solved = true; el.classList.add('done'); onDone(); }
      }));
      el.appendChild(fb);
      return el;
    }
    const doCheck = () => {
      if (solved) return;
      const res = check(st, p, inp.value);
      if (res.empty) return;
      if (!res.parseError) attempts++;
      if (!res.ok && !res.diag && !res.parseError) {
        res.diag = (attempts >= 2 && st.reveal) ? st.reveal(p) : (st.hint ? st.hint(p) : null);
      }
      feedback(fb, res, { hintText: 'Try again.' }, 0);
      if (res.ok) { solved = true; el.classList.add('done'); inp.readOnly = true; btn.disabled = true; onDone(); }
    };
    const { row, inp } = inputFor(st, doCheck);
    const btn = h('button', { class: 'primary', onclick: doCheck }, 'Check');
    row.appendChild(btn);
    if (st.unit === 'pct') row.appendChild(h('span', { class: 'unit' }, '%'));
    el.appendChild(row);
    el.appendChild(fb);
    typeset(el);
    return el;
  }

  function problemWidget(spec, num, total) {
    const card = h('section', { class: 'card problem', id: 'prob-' + spec.id });
    let p = spec.gen ? spec.gen() : {};
    let attempts = 0, solved = false;

    card.__mt = { spec, getP: () => p };
    function build() {
      card.innerHTML = '';
      attempts = 0; solved = false;
      const head = h('div', { class: 'p-head' });
      head.appendChild(h('div', { class: 'eyebrow' }, `<span class="dot ${progress[spec.id] ? 'done' : ''}" title="${progress[spec.id] ? 'Solved before' : 'Not yet solved'}"></span>Problem ${num} of ${total}${spec.label ? ' · ' + spec.label : ''}`));
      if (spec.gen) head.appendChild(h('button', { class: 'link', onclick: () => { p = spec.gen(); build(); } }, '↻ New numbers'));
      card.appendChild(head);
      card.appendChild(h('div', { class: 'prompt' }, spec.prompt(p)));

      const fb = h('div', { class: 'fb', hidden: true });
      const actions = h('div', { class: 'actions' });
      const stepsBox = h('div', { class: 'steps', hidden: true });
      const solBox = h('div', { class: 'solution', hidden: true });

      const onSolved = () => {
        if (!solved) { solved = true; markDone(spec.id); const dot = card.querySelector('.dot'); if (dot) dot.classList.add('done'); }
        solBtn.disabled = false;
      };

      if (spec.type === 'mc') {
        card.appendChild(mcBlock(spec, p, res => {
          attempts++;
          fb.hidden = false; fb.className = 'fb ' + (res.ok ? 'ok' : 'bad');
          fb.innerHTML = res.ok ? `<p class="h">Correct.</p>${res.why ? '<p>' + res.why + '</p>' : ''}` : `<p class="h">Not quite.</p><p>${res.diag}</p>`;
          typeset(fb);
          if (res.ok) onSolved();
        }));
      } else {
        const doCheck = () => {
          const res = check(spec, p, inp.value);
          if (res.empty) return;
          if (!res.parseError) attempts++;
          feedback(fb, res, spec, attempts);
          if (res.ok) { onSolved(); }
          else if (!res.parseError) {
            if (attempts >= 2) solBtn.disabled = false;
            if (spec.steps && attempts >= 2 && stepsBox.hidden) stepBtn.classList.add('primary');
          }
        };
        const { row, inp } = inputFor(spec, doCheck);
        if (spec.type === 'expr') {
          // Side-by-side entry: what you type on the left, the formatted equation on the right.
          const entry = h('div', { class: 'math-entry' });
          const left = h('div', { class: 'me-col' });
          left.appendChild(h('div', { class: 'me-label' }, 'You type'));
          left.appendChild(inp);
          const right = h('div', { class: 'me-col' });
          right.appendChild(h('div', { class: 'me-label' }, 'It reads as'));
          const box = h('div', { class: 'preview-box', 'aria-live': 'polite' }, '<span class="ph">The formatted equation appears here as you type.</span>');
          const note = h('div', { class: 'me-note' });
          right.appendChild(box);
          left.appendChild(note);
          entry.appendChild(left); entry.appendChild(right);
          card.appendChild(entry);
          const update = () => renderPreview(inp.value, Object.keys(spec.vars), box, note);
          inp.addEventListener('input', update);
          row.appendChild(h('button', { class: 'primary', onclick: doCheck }, 'Check'));
          card.appendChild(row);
        } else {
          row.appendChild(h('button', { class: 'primary', onclick: doCheck }, 'Check'));
          if (spec.unit === 'pct') row.appendChild(h('span', { class: 'unit' }, '%'));
          card.appendChild(row);
        }
        card.appendChild(h('div', { class: 'unit' }, unitNote(spec)));
      }
      card.appendChild(fb);

      const hintBtn = h('button', { class: 'link', onclick: () => {
        fb.hidden = false; fb.className = 'fb info'; fb.innerHTML = `<p class="h">Hint</p><p>${spec.hint(p)}</p>`; typeset(fb);
      } }, 'Hint');
      const stepBtn = h('button', { class: 'link', onclick: () => {
        stepBtn.hidden = true; stepBtn.classList.remove('primary');
        stepsBox.hidden = false; stepsBox.innerHTML = '';
        const steps = spec.steps(p);
        let k = 0;
        const next = () => {
          if (k < steps.length) {
            const w = stepWidget(steps[k], p, k + 1, steps.length, () => { k++; next(); });
            stepsBox.appendChild(w); typeset(w);
            const inp2 = w.querySelector('input[type=text]'); if (inp2 && k > 0) inp2.focus({ preventScroll: true });
          } else {
            const fin = h('div', { class: 'fb ok' }, `<p class="h">All steps done.</p><p>${spec.type === 'mc' ? 'Now go back and pick the answer above.' : 'Now enter the final answer in the box above.'}</p>`);
            stepsBox.appendChild(fin);
            solBtn.disabled = false;
          }
        };
        next();
      } }, 'Break it into steps');
      const solBtn = h('button', { class: 'link', disabled: true, title: 'Available after two tries or after the steps', onclick: () => {
        solBox.hidden = !solBox.hidden; solBtn.textContent = solBox.hidden ? 'Show worked solution' : 'Hide worked solution';
        if (!solBox.hidden) { solBox.innerHTML = '<div class="tag">Worked solution</div>' + spec.solution(p); typeset(solBox); }
      } }, 'Show worked solution');
      if (spec.hint) actions.appendChild(hintBtn);
      if (spec.steps) actions.appendChild(stepBtn);
      if (spec.solution) actions.appendChild(solBtn);
      card.appendChild(actions);
      card.appendChild(stepsBox);
      card.appendChild(solBox);
      typeset(card);
    }
    build();
    return card;
  }

  /* ---------- boot ---------- */
  let lastView = '';
  function render() {
    const rt = route();
    renderSide();
    if (rt.view === 'skill') viewSkill(rt.id);
    else if (rt.view === 'module') viewModule(rt.id);
    else if (rt.view === 'lectures') viewLectures(rt.sub);
    else viewHome();
    const key = rt.view + ':' + (rt.id || '');
    if (key !== lastView) { if (lastView) scrollTopNice(); lastView = key; }
    tellParent();
  }
  window.addEventListener('hashchange', render);
  function boot() { setupMath(); render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  // expose for testing
  window.MTEngine = { check, parseExpr, parseNumber, sameExpr };
})();
