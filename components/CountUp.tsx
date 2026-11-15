'use client';
import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function CountUp({ to, suffix = '', decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(to);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.4, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setVal(Number(v.toFixed(decimals))) });
    return () => controls.stop();
  }, [inView, to, decimals]);

  return <b ref={ref}>{val.toFixed(decimals)}{suffix}</b>;
}
