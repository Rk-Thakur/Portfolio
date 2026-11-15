'use client';
import { MotionConfig } from 'framer-motion';

// reducedMotion="user" turns off transform animations for people who ask for less motion.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
