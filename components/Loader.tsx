'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { easeInOut, LOADER_MS } from '@/lib/motion';

// Curtain that lifts away on first load.
export default function Loader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="loader"
          aria-hidden="true"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.8, ease: easeInOut }}
          style={{ clipPath: 'inset(0 0 0% 0)' }}
        >
          <motion.span
            className="loader__mark"
            initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          >
            RT
          </motion.span>
          <span className="loader__bar"><i /></span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
