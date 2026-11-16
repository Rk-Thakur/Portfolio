'use client';
import { motion } from 'framer-motion';

// Re-mounts on every navigation, so each page fades and rises in.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}
