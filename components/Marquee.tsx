'use client';
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useRef } from 'react';
import { wrap } from '@/lib/motion';

/** Tech ticker that speeds up, reverses and skews with your scroll speed. */
export default function Marquee({ items, baseSpeed = 2 }: { items: string[]; baseSpeed?: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const skewX = useTransform(smooth, [-2500, 2500], [10, -10]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(-1);

  useAnimationFrame((_, delta) => {
    let move = dir.current * baseSpeed * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = 1;
    else if (f > 0) dir.current = -1;
    move += dir.current * Math.abs(move) * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  const list = (hidden?: boolean) => (
    <ul aria-hidden={hidden || undefined}>
      {items.map((t) => <li key={t}>{t}</li>)}
    </ul>
  );

  return (
    <div className="marquee" aria-label="Technologies">
      <motion.div className="marquee__track" style={{ x, skewX }}>
        {list()}
        {list(true)}
      </motion.div>
    </div>
  );
}
