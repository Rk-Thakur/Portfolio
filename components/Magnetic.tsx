'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { strength?: number };

/** A link that leans toward the cursor and springs back when it leaves. */
export default function Magnetic({ strength = 0.3, children, className = '', ...rest }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 250, damping: 15, mass: 0.4 });

  return (
    <motion.a
      {...(rest as React.ComponentProps<typeof motion.a>)}
      className={className}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.94 }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength * 1.2);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.a>
  );
}
