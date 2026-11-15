(() => {
  const root = document.documentElement;

  // ----- Theme (dark default, follows OS, remembers choice) -----
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  // ----- Palette picker (circular reveal via View Transitions) -----
  const LIGHT = new Set(['paper', 'sand']);
  const palBtn = document.getElementById('paletteBtn');
  const palMenu = document.getElementById('paletteMenu');
  const palItems = [...palMenu.querySelectorAll('[data-palette]')];
  const markActive = () => palItems.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.palette === root.dataset.palette)));
  const applyPalette = (name) => {
    root.dataset.palette = name;
    root.dataset.theme = LIGHT.has(name) ? 'light' : 'dark';
    store.set('palette', name);
    markActive();
    document.dispatchEvent(new CustomEvent('palettechange', { detail: name }));
  };
  const setMenuOpen = (open) => {
    palMenu.classList.toggle('is-open', open);
    palBtn.setAttribute('aria-expanded', String(open));
    if (open) (palMenu.querySelector('[aria-checked="true"]') || palItems[0]).focus();
  };
  markActive();
  palBtn.addEventListener('click', (e) => { e.stopPropagation(); setMenuOpen(!palMenu.classList.contains('is-open')); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.palette')) setMenuOpen(false); });
  palMenu.addEventListener('keydown', (e) => {
    const i = palItems.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); palItems[(i + 1) % palItems.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); palItems[(i - 1 + palItems.length) % palItems.length].focus(); }
    if (e.key === 'Escape') { setMenuOpen(false); palBtn.focus(); }
  });
  palItems.forEach((item) => item.addEventListener('click', (e) => {
    const name = item.dataset.palette;
    setMenuOpen(false);
    if (name === root.dataset.palette) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) { applyPalette(name); return; }
    const r = palBtn.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(() => applyPalette(name)).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  }));

  // ----- Mobile menu -----
  const menuBtn = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  const setMenu = (open) => {
    links.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  // ----- Nav border on scroll + active section -----
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const navMap = new Map([...links.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navMap.forEach((a) => a.classList.remove('is-active'));
          navMap.get(en.target.id)?.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));

    // ----- Reveal on scroll -----
    const rev = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); rev.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 70}ms`;
      rev.observe(el);
    });

    // ----- Count-up stats -----
    const counters = document.querySelectorAll('[data-count]');
    const cnt = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target; const end = +el.dataset.count; const suf = el.dataset.suffix || '';
        const t0 = performance.now(); const dur = 1200;
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cnt.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => cnt.observe(c));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
  }

  // ----- Project filters -----
  const filters = document.querySelectorAll('.filter');
  const projects = document.querySelectorAll('.project');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    filters.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
    const f = btn.dataset.filter;
    projects.forEach((p) => {
      const show = f === 'all' || p.dataset.cat === f;
      p.classList.toggle('is-hidden', !show);
      if (show) p.classList.add('is-in');
    });
  }));

  // ----- Copy email -----
  const toast = document.getElementById('toast');
  const showToast = (msg) => {
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('is-on'), 1800);
  };
  document.getElementById('copyEmail').addEventListener('click', async (e) => {
    const email = e.currentTarget.dataset.email;
    try { await navigator.clipboard.writeText(email); showToast('Email copied'); }
    catch { showToast(email); }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
