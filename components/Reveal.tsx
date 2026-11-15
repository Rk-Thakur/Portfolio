'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, useInView, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from 'framer-motion';
import { useCallback, useRef } from 'react';
import { ease } from '@/lib/motion';

const tags = { div: motion.div, article: motion.article, li: motion.li, ul: motion.ul, p: motion.p, section: motion.section } as const;
type Tag = keyof typeof tags;

type RevealProps = Omit<HTMLMotionProps<'div'>, 'ref'> & { as?: Tag; delay?: number; y?: number; ref?: React.Ref<HTMLElement> };

/** Keeps our in-view ref working when a parent (e.g. AnimatePresence popLayout) also passes a ref. */
function useMergedRef(outer?: React.Ref<HTMLElement>) {
  const inner = useRef<HTMLElement | null>(null);
  const set = useCallback((el: HTMLElement | null) => {
    inner.current = el;
    if (typeof outer === 'function') outer(el);
    else if (outer) (outer as React.MutableRefObject<HTMLElement | null>).current = el;
  }, [outer]);
  return [inner, set] as const;
}

/** Fades/blurs/rises into view once. Adds `is-in` so CSS can stagger children (pills, bullets, dots). */
export function Reveal({ as = 'div', className = '', delay = 0, y = 40, children, ref: outer, ...rest }: RevealProps) {
  const [ref, setRef] = useMergedRef(outer);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const C = tags[as] as any;
  return (
    <C
      ref={setRef}
      className={`${className}${inView ? ' is-in' : ''}`}
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
      transition={{ duration: 0.9, ease, delay }}
      {...rest}
    >
      {children}
    </C>
  );
}

/** Reveal + 3D tilt toward the cursor (spring-smoothed) + a spotlight that follows the pointer. */
export function TiltCard({ as = 'article', className = '', delay = 0, children, ref: outer, ...rest }: RevealProps) {
  const [ref, setRef] = useMergedRef(outer);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-7, 7]), { stiffness: 200, damping: 18 });
  const C = tags[as] as any;

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    px.set(x / r.width); py.set(y / r.height);
    e.currentTarget.style.setProperty('--mx', `${x}px`);
    e.currentTarget.style.setProperty('--my', `${y}px`);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };

  return (
    <C
      ref={setRef}
      className={`spot ${className}${inView ? ' is-in' : ''}`}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.9, ease, delay }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </C>
  );
}
