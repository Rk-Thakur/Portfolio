'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * A success message that slides in, disappears after a few seconds, and removes
 * its ?saved / ?deleted flag from the address bar so it doesn't come back on reload.
 */
export default function Flash({ message, param, ms = 3500 }: { message: string; param?: string; ms?: number }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (param) {
      const url = new URL(window.location.href);
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        // Plain history update: no navigation, no re-render
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
      }
    }
    const t = setTimeout(() => setShow(false), ms);
    return () => clearTimeout(t);
  }, [param, ms]);

  return (
    <AnimatePresence>
      {show && (
        <motion.p
          className="adm-alert adm-alert--ok adm-flash" role="status"
          initial={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span>✓ {message}</span>
          <button type="button" className="adm-flash__close" onClick={() => setShow(false)} aria-label="Dismiss">×</button>
          <motion.i className="adm-flash__timer" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: ms / 1000, ease: 'linear' }} />
        </motion.p>
      )}
    </AnimatePresence>
  );
}
