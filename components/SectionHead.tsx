'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Scramble from './Scramble';

/** Section label (decodes in) + heading whose words rise in one by one, plus an underline that draws. */
export default function SectionHead({ kicker, title, className = '' }: { kicker: string; title: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const words = title.split(' ');
  return (
    <div ref={ref} className={`section__head ${className}${inView ? ' is-in' : ''}`}>
      <p className="kicker"><Scramble text={kicker} /></p>
      <h2 aria-label={title}>
        {words.map((w, i) => (
          <span className="w" key={i} aria-hidden="true">
            <motion.span
              initial={{ y: '110%', rotate: 5 }}
              animate={inView ? { y: '0%', rotate: 0 } : undefined}
              transition={{ duration: 0.8, ease: [0.2, 0.9, 0.25, 1], delay: 0.1 + i * 0.06 }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </h2>
    </div>
  );
}
