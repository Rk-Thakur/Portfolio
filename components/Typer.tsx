'use client';
import { useEffect, useState } from 'react';

/** Types and deletes each role in turn, like a terminal. */
export default function Typer({ words, startDelay = 2500 }: { words: string[]; startDelay?: number }) {
  const [text, setText] = useState(words[0]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let wi = 0, ci = words[0].length, deleting = true, t: ReturnType<typeof setTimeout>;
    const step = () => {
      if (deleting) {
        ci--;
        setText(words[wi].slice(0, Math.max(0, ci)));
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
        t = setTimeout(step, 35);
      } else {
        ci++;
        setText(words[wi].slice(0, ci));
        if (ci >= words[wi].length) { deleting = true; t = setTimeout(step, 2200); }
        else t = setTimeout(step, 70);
      }
    };
    t = setTimeout(step, startDelay);
    return () => clearTimeout(t);
  }, [words, startDelay]);

  return <span>{text}</span>;
}
