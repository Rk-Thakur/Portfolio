'use client';
import { motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import { TiltCard } from './Reveal';
import { SkillIcon } from './Icons';
import type { SkillGroup } from '@/lib/data';

// Height of the pill area when collapsed: exactly 3 rows of pills (see .pills li in CSS).
const COLLAPSED = 104;

/**
 * Fixed-size skill card. Shows as many skills as fit in 3 rows,
 * fades the overflow and offers "+N more" to expand smoothly.
 */
export default function SkillCard({ group, delay }: { group: SkillGroup; delay: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(0);
  const [open, setOpen] = useState(false);

  // Count pills that fall below the collapsed height (re-run on resize)
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const pills = [...el.querySelectorAll<HTMLElement>('li')];
      setHidden(pills.filter((p) => p.offsetTop + p.offsetHeight > COLLAPSED + 1).length);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.querySelector('ul')!);
    return () => ro.disconnect();
  }, []);

  return (
    <TiltCard className={`skill-card${open ? ' is-open' : ''}`} delay={delay}>
      <div className="skill-card__head">
        <div className="skill-card__icon"><SkillIcon name={group.icon} /></div>
        <h3>{group.title}</h3>
        <span className="skill-card__count" aria-label={`${group.items.length} skills`}>{group.items.length}</span>
      </div>

      <motion.div
        ref={wrap}
        className={`pills-wrap${!open && hidden > 0 ? ' is-clipped' : ''}`}
        initial={false}
        animate={{ height: open ? 'auto' : COLLAPSED }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <ul className="pills">
          {group.items.map((it, i) => <li key={it} style={{ '--i': i } as React.CSSProperties}>{it}</li>)}
        </ul>
      </motion.div>

      <div className="skill-card__foot">
        {hidden > 0 ? (
          <button className="skill-card__more" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? 'Show less' : `+${hidden} more`}
            <motion.span aria-hidden="true" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>↓</motion.span>
          </button>
        ) : (
          <span className="skill-card__all">All shown</span>
        )}
      </div>
    </TiltCard>
  );
}
