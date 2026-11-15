'use client';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01';

/** Text that decodes from random glyphs when it scrolls into view (and whenever `trigger` changes). */
export default function Scramble({ text, trigger = 0 }: { text: string; trigger?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 1 });
  const [chars, setChars] = useState<{ ch: string; noise: boolean }[] | null>(null);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const queue = [...text].map((ch, i) => ({ ch, start: Math.floor(Math.random() * 10), end: 10 + Math.floor(Math.random() * 18) + i }));
    let frame = 0, raf = 0;
    const tick = () => {
      let done = 0;
      const out = queue.map((q) => {
        if (frame >= q.end) { done++; return { ch: q.ch, noise: false }; }
        if (frame >= q.start && q.ch !== ' ') return { ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], noise: true };
        return { ch: q.ch === ' ' ? ' ' : '', noise: false };
      });
      setChars(out);
      frame++;
      if (done < queue.length) raf = requestAnimationFrame(tick); else setChars(null);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [inView, text, trigger]);

  return (
    <span ref={ref} aria-label={text}>
      <span aria-hidden="true">
        {chars ? chars.map((c, i) => (c.noise ? <span key={i} className="sc">{c.ch}</span> : c.ch)) : text}
      </span>
    </span>
  );
}
