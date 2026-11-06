(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  /* ---------- Loader ---------- */
  function initLoader() {
    const loader = $('#loader'), pct = $('#loadPct'), bar = $('#loadBar');
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.random() * 14 + 6);
      pct.textContent = Math.floor(p);
      bar.style.width = p + '%';
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(() => {
          loader.classList.add('done');
          document.body.classList.add('ready');
          counter($('#evo'), 98.7, 1, 1800);
        }, 250);
      }
    }, 90);
  }

  function counter(el, to, dec = 0, dur = 1600) {
    if (reduce) { el.textContent = to.toFixed(dec); return; }
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    const burger = $('#burger'), links = $('#navLinks'), ind = $('#navInd');
    const anchors = $$('a:not(.btn)', links);
    const setOpen = o => {
      links.classList.toggle('open', o);
      burger.setAttribute('aria-expanded', o);
      burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', () => setOpen(!links.classList.contains('open')));
    links.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

    const moveInd = a => {
      if (!a || getComputedStyle(ind).display === 'none') return;
      const r = a.getBoundingClientRect(), p = ind.parentElement.getBoundingClientRect();
      ind.style.width = r.width * .6 + 'px';
      ind.style.transform = `translateX(${r.left - p.left + r.width * .2}px)`;
    };
    const activate = id => {
      let cur;
      anchors.forEach(a => {
        const on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) cur = a;
      });
      moveInd(cur);
    };
    // map sections to nav entries
    const map = { home: 'home', about: 'about', technology: 'technology', enhancements: 'enhancements', showcase: 'enhancements', future: 'enhancements', contact: 'contact' };
    const io = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting && activate(map[e.target.id]));
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section, footer').forEach(s => map[s.id] && io.observe(s));
    window.addEventListener('resize', () => moveInd($('a.is-active', links)));
    window.addEventListener('load', () => moveInd($('a.is-active', links)));
  }

  /* ---------- Scroll reveal & counters ---------- */
  function initReveal() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(c => counter(c, +c.dataset.count, +(c.dataset.dec || 0)));
      io.unobserve(e.target);
    }), { threshold: .15 });
    $$('.reveal').forEach((el, i) => {
      if (el.classList.contains('card')) el.style.transitionDelay = (i % 4) * 90 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Mouse glow & hero parallax ---------- */
  function initPointer() {
    if (!fine || reduce) return;
    const glow = $('#glow'), vis = $('#heroVisual');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; });
    (function loop() {
      cx += (x - cx) * .08; cy += (y - cy) * .08;
      glow.style.transform = `translate(${cx}px,${cy}px)`;
      vis.style.transform = `translate(${(cx - innerWidth / 2) * -.015}px,${(cy - innerHeight / 2) * -.015}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Particles (pauses when tab hidden) ---------- */
  function initParticles() {
    const cv = $('#particles'), ctx = cv.getContext('2d');
    let w, h, pts = [], raf;
    const resize = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      w = cv.width = innerWidth * d; h = cv.height = innerHeight * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.min(70, Math.floor(innerWidth / 18));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * innerWidth, y: Math.random() * innerHeight,
        r: Math.random() * 1.4 + .4, v: Math.random() * .25 + .08,
        c: Math.random() > .75 ? '157,78,221' : '0,245,255', a: Math.random() * .5 + .15
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of pts) {
        p.y -= p.v; if (p.y < -5) { p.y = innerHeight + 5; p.x = Math.random() * innerWidth; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(${p.c},${p.a})`; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); addEventListener('resize', resize);
    if (reduce) { draw(); cancelAnimationFrame(raf); return; }
    draw();
    document.addEventListener('visibilitychange', () => {
      document.hidden ? cancelAnimationFrame(raf) : draw();
    });
  }

  /* ---------- Hero HUD live value ---------- */
  function initHud() {
    const el = $('#hudA'); if (!el || reduce) return;
    setInterval(() => { el.textContent = 68 + Math.floor(Math.random() * 12); }, 1800);
  }

  /* ---------- Human vs Machine ---------- */
  function initVersus() {
    const data = [
      { n: 'Reaction time', h: 25, m: 95, hv: '250 ms', mv: '2 ms' },
      { n: 'Lifting strength', h: 30, m: 90, hv: '100 kg', mv: '600 kg' },
      { n: 'Vision range', h: 35, m: 98, hv: 'Visible light', mv: 'IR + UV + zoom' },
      { n: 'Data recall', h: 15, m: 100, hv: 'Fades with time', mv: 'Lossless' },
      { n: 'Endurance', h: 40, m: 92, hv: 'Hours', mv: 'Weeks' }
    ];
    const rows = $('#vsRows'), range = $('#vsRange'), val = $('#vsVal');
    rows.innerHTML = data.map((d, i) => `
      <div class="vs-row"><div class="vs-row__l"><em>${d.n}: ${d.hv}</em><strong data-v="${i}">${d.mv}</strong></div>
      <div class="vs-bar"><i data-b="${i}" style="width:${d.h}%"></i><u style="left:${d.h}%"></u></div></div>`).join('');
    const bars = $$('[data-b]', rows);
    const update = () => {
      const t = range.value / 100;
      val.textContent = range.value + '%';
      bars.forEach((b, i) => { b.style.width = (data[i].h + (data[i].m - data[i].h) * t).toFixed(1) + '%'; });
    };
    range.addEventListener('input', update);
  }

  /* ---------- Showcase tabs ---------- */
  function initShowcase() {
    const items = [
      { t: 'ROBOTICS', g: 'R-7', h: 'Robotic engineering', p: 'Servo-driven joints, carbon-fibre frames and force-sensing skin give prosthetics the grip of a hand and the strength of a machine.', s: ['Torque|420 Nm', 'Weight|1.8 kg', 'Haptic points|2,400'] },
      { t: 'NEURAL', g: 'N-1', h: 'Neural technology', p: 'A thin-film lattice reads intent from the motor cortex and returns touch to the brain, so control feels natural from the first day.', s: ['Channels|8,192', 'Bandwidth|1.6 Gbps', 'Calibration|12 min'] },
      { t: 'AI CORE', g: 'AI', h: 'Artificial intelligence', p: 'An on-device model learns your movement patterns, adjusts every actuator in real time and flags health risks before you feel them.', s: ['Inference|0.3 ms', 'Local only|Yes', 'Updates|Weekly'] },
      { t: 'BODY', g: 'B-X', h: 'Cybernetic body enhancements', p: 'Reinforced skeleton, synthetic muscle and a regulated power cell extend what the body can carry, survive and repair.', s: ['Frame|Ti-graphene', 'Power|72 h', 'Self-repair|Active'] }
    ];
    const tabs = $('#tabs'), panel = $('#panel');
    tabs.innerHTML = items.map((it, i) => `<button class="tab" role="tab" id="tab${i}" aria-selected="${i === 0}" aria-controls="panel" tabindex="${i ? -1 : 0}">${it.t}</button>`).join('');
    panel.setAttribute('aria-labelledby', 'tab0');
    const btns = $$('.tab', tabs);
    const show = i => {
      const it = items[i];
      btns.forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
      panel.setAttribute('aria-labelledby', 'tab' + i);
      $('#pTitle').textContent = it.h; $('#pText').textContent = it.p; $('#pGlyph').textContent = it.g;
      $('#pSpecs').innerHTML = it.s.map(s => { const [a, b] = s.split('|'); return `<li><span>${a}</span>${b}</li>`; }).join('');
      const txt = $('.show__txt', panel); txt.classList.remove('fade'); void txt.offsetWidth; txt.classList.add('fade');
    };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => show(i));
      b.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
        const n = (i + k + btns.length) % btns.length; show(n); btns[n].focus();
      });
    });
    show(0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLoader(); initNav(); initReveal(); initPointer();
    initParticles(); initHud(); initVersus(); initShowcase();
  });
})();

/* ===== v2 enhancements ===== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(pointer: fine)').matches;

  function scrollUI() {
    const bar = $('#progress'), nav = $('#nav'); let tick = false;
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      nav.classList.toggle('scrolled', scrollY > 40); tick = false;
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  }

  function scramble(el) {
    const end = el.textContent, set = '01<>/[]#%$&'; let f = 0; const total = 30;
    const t = setInterval(() => {
      f++; el.textContent = [...end].map((c, i) => c === ' ' || i < (f / total) * end.length ? c : set[Math.random() * set.length | 0]).join('');
      if (f >= total) { clearInterval(t); el.textContent = end; }
    }, 40);
  }
  function heroDecode() {
    if (reduce) return; const el = $('.hero__title .grad');
    const run = () => setTimeout(() => scramble(el), 350);
    if (document.body.classList.contains('ready')) return run();
    const mo = new MutationObserver(() => { if (document.body.classList.contains('ready')) { mo.disconnect(); run(); } });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  function cursor() {
    if (!fine || reduce) return; const c = $('#cursor'); let x = 0, y = 0, cx = 0, cy = 0;
    document.body.classList.add('has-cursor');
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; c.classList.add('on'); });
    document.addEventListener('pointerleave', () => c.classList.remove('on'));
    document.addEventListener('pointerover', e => c.classList.toggle('hot', !!e.target.closest('a,button,input,.card')));
    (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  }

  function magnetic() {
    if (!fine || reduce) return;
    $$('.btn').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
  }

  function tilt() {
    if (!fine) return;
    $$('.card').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
        if (!reduce) { c.style.setProperty('--ry', ((x / r.width - .5) * 10).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((.5 - y / r.height) * 8).toFixed(2) + 'deg'); }
      });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  }

  document.addEventListener('DOMContentLoaded', () => { scrollUI(); heroDecode(); cursor(); magnetic(); tilt(); });
})();
