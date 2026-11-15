(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ----- Split headline into animated words -----
  let w = 0;
  $$('.split .line').forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.textContent = '';
    words.forEach((word, i) => {
      const outer = document.createElement('span');
      outer.className = 'word';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = word;
      inner.style.setProperty('--w', w++);
      outer.appendChild(inner);
      line.appendChild(outer);
      if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
    });
  });

  // ----- Stagger indices for lists -----
  ['.pills', '.about__tags', '.job__card > ul:not(.tags)'].forEach((sel) =>
    $$(sel).forEach((list) => [...list.children].forEach((c, i) => c.style.setProperty('--i', i)))
  );

  // ----- Loader -----
  const done = () => document.body.classList.add('is-loaded');
  if (reduce) done();
  else if (document.readyState === 'complete') setTimeout(done, 350);
  else window.addEventListener('load', () => setTimeout(done, 350));
  setTimeout(done, 2500); // safety net

  // ----- Scroll progress + timeline draw -----
  const progress = $('#progress');
  const timeline = $('.timeline');
  let ticking = false;
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.setProperty('--p', max > 0 ? (h.scrollTop / max).toFixed(4) : 0);
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
      timeline.style.setProperty('--tp', p.toFixed(4));
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ----- Typing role rotator -----
  const typed = $('#typed');
  const roles = [
    'Flutter & Dart Engineer',
    'iOS & Android Developer',
    'Python / FastAPI Backend Engineer',
    'CI/CD & Release Automation',
    'Clean Architecture Advocate',
  ];
  if (typed && !reduce) {
    let ri = 0, ci = roles[0].length, deleting = true;
    const step = () => {
      const word = roles[ri];
      if (deleting) {
        ci--;
        if (ci <= 0) { deleting = false; ri = (ri + 1) % roles.length; }
      } else {
        ci++;
        if (ci >= roles[ri].length) { deleting = true; typed.textContent = roles[ri]; return setTimeout(step, 2200); }
      }
      typed.textContent = (deleting ? word : roles[ri]).slice(0, Math.max(0, ci));
      setTimeout(step, deleting ? 35 : 70);
    };
    setTimeout(step, 3200);
  }

  // ----- Hero particle network -----
  const canvas = $('#particles');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let W, H, dpr, pts = [];
    const mouse = { x: -9999, y: -9999 };
    const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#22d3ee';
    const hexToRgb = (hex) => {
      const m = hex.replace('#', '').match(/.{2}/g);
      return m ? m.map((x) => parseInt(x, 16)).join(',') : '34,211,238';
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, (W * H) / 18000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.6 + 0.6,
      }));
    };
    resize();
    window.addEventListener('resize', resize);
    canvas.parentElement.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

    let visible = true;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);
    const draw = () => {
      requestAnimationFrame(draw);
      if (!visible) return;
      const rgb = hexToRgb(accent());
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 120) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},.55)`; ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(${rgb},${(1 - d / 130) * 0.22})`;
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
    };
    draw();
  }

  if (reduce) return;

  // ----- Cursor glow -----
  if (finePointer) {
    document.body.classList.add('has-pointer');
    const glow = $('#cursorGlow');
    window.addEventListener('pointermove', (e) => {
      glow.style.setProperty('--cx', e.clientX + 'px');
      glow.style.setProperty('--cy', e.clientY + 'px');
    }, { passive: true });
  }

  // ----- Phone 3D tilt -----
  const hv = $('#heroVisual'), phone = $('#phone');
  if (hv && phone && finePointer) {
    hv.addEventListener('pointermove', (e) => {
      const r = hv.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.setProperty('--ry', (x * 22).toFixed(2) + 'deg');
      phone.style.setProperty('--rx', (-y * 18).toFixed(2) + 'deg');
    });
    hv.addEventListener('pointerleave', () => { phone.style.setProperty('--rx', '0deg'); phone.style.setProperty('--ry', '0deg'); });
  }

  // ----- Card spotlight + tilt -----
  $$('.skill-card, .project, .edu__card, .job__card, .contact__list li').forEach((card) => {
    card.classList.add('spot');
    if (!finePointer) return;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px'); card.style.setProperty('--my', y + 'px');
      if (card.matches('.job__card, .contact__list li')) return;
      const rx = ((y / r.height) - 0.5) * -8, ry = ((x / r.width) - 0.5) * 8;
      card.classList.add('tilting');
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.classList.remove('tilting'); card.style.transform = ''; });
  });

  // ----- Magnetic buttons -----
  if (finePointer) {
    $$('.magnetic, .socials a, .nav__cta').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // ----- Project filter pop-in -----
  $$('.filter').forEach((btn) => btn.addEventListener('click', () => {
    let i = 0;
    $$('.project').forEach((p) => {
      p.classList.remove('is-filtering');
      if (!p.classList.contains('is-hidden')) {
        p.style.setProperty('--i', i++);
        void p.offsetWidth; // restart animation
        p.classList.add('is-filtering');
      }
    });
  }));
})();

// ----- Text scramble on section labels -----
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const glyphs = '!<>-_\\/[]{}—=+*^?#01';
  const scramble = (el) => {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    const queue = [...final].map((ch, i) => ({ ch, start: Math.floor(Math.random() * 10), end: 10 + Math.floor(Math.random() * 18) + i }));
    let frame = 0;
    const tick = () => {
      let out = '', done = 0;
      for (const q of queue) {
        if (frame >= q.end) { out += q.ch; done++; }
        else if (frame >= q.start && q.ch !== ' ') out += `<span class="sc">${glyphs[Math.floor(Math.random() * glyphs.length)]}</span>`;
        else out += q.ch === ' ' ? ' ' : '';
      }
      el.innerHTML = out;
      frame++;
      if (done < queue.length) requestAnimationFrame(tick); else el.textContent = final;
    };
    tick();
  };
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { scramble(en.target); io.unobserve(en.target); }
  }), { threshold: 1 });
  document.querySelectorAll('.kicker').forEach((k) => io.observe(k));

  // Re-scramble the brand name when the palette changes, as a small flourish
  document.addEventListener('palettechange', () => {
    const b = document.querySelector('.brand__name');
    if (b) scramble(b);
  });
})();
