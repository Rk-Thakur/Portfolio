'use client';
import { useEffect, useRef, useState } from 'react';
import { palettes } from '@/lib/data';

type Doc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

export default function PalettePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('midnight');
  const btn = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => { setCurrent(document.documentElement.dataset.palette || 'midnight'); }, []);

  useEffect(() => {
    if (!open) return;
    const i = Math.max(0, palettes.findIndex((p) => p.id === current));
    items.current[i]?.focus();
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.palette')) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open, current]);

  const apply = (id: string) => {
    const p = palettes.find((x) => x.id === id)!;
    const root = document.documentElement;
    root.dataset.palette = id;
    root.dataset.theme = p.light ? 'light' : 'dark';
    try { localStorage.setItem('palette', id); } catch { /* storage blocked */ }
    setCurrent(id);
    document.dispatchEvent(new CustomEvent('palettechange', { detail: id }));
  };

  const choose = (id: string, e: React.MouseEvent) => {
    setOpen(false);
    if (id === current) return;
    const doc = document as Doc;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!doc.startViewTransition || reduce) { apply(id); return; }
    const r = btn.current!.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2;
    const y = e.clientY || r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(() => apply(id)).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    const i = items.current.findIndex((el) => el === document.activeElement);
    const n = palettes.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); items.current[(i + 1) % n]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items.current[(i - 1 + n) % n]?.focus(); }
    if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); }
  };

  return (
    <div className="palette">
      <button
        ref={btn}
        className="icon-btn palette__btn"
        aria-label="Choose color palette"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="paletteMenu"
        title="Color palette"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        <span className="palette__swatch" aria-hidden="true" />
      </button>
      <div className={`palette__menu${open ? ' is-open' : ''}`} id="paletteMenu" role="menu" aria-label="Color palettes" onKeyDown={onKey}>
        <p className="palette__title">Palette</p>
        {palettes.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => { items.current[i] = el; }}
            role="menuitemradio"
            aria-checked={current === p.id}
            tabIndex={open ? 0 : -1}
            style={{ '--a': p.a, '--b': p.b, '--c': p.c } as React.CSSProperties}
            onClick={(e) => choose(p.id, e)}
          >
            <i /><span>{p.name}</span><small>{p.note}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
