'use client';
import { motion, type Variants } from 'framer-motion';

const AppleLogo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="store-btn__logo">
    <path fill="currentColor" d="M16.37 12.6c-.02-2.27 1.86-3.36 1.94-3.41-1.06-1.55-2.7-1.76-3.28-1.78-1.4-.14-2.73.82-3.44.82-.71 0-1.8-.8-2.96-.78-1.52.02-2.93.89-3.71 2.25-1.58 2.75-.4 6.81 1.14 9.04.75 1.09 1.65 2.31 2.82 2.27 1.13-.05 1.56-.73 2.93-.73 1.37 0 1.75.73 2.95.71 1.22-.02 1.99-1.11 2.73-2.2.86-1.26 1.22-2.49 1.24-2.55-.03-.01-2.37-.91-2.4-3.62zM14.12 5.93c.62-.76 1.04-1.8.93-2.85-.9.04-1.99.6-2.63 1.35-.58.67-1.08 1.74-.95 2.77 1 .08 2.03-.51 2.65-1.27z" />
  </svg>
);

const PlayLogo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="store-btn__logo">
    <path fill="#34A853" d="M3.6 2.2c-.3.3-.4.8-.4 1.3v17c0 .5.1 1 .4 1.3l.1.1 9.5-9.5v-.2L3.7 2.1z" />
    <path fill="#FBBC04" d="m16.4 15.6-3.2-3.2v-.2l3.2-3.2.1.1 3.8 2.1c1.1.6 1.1 1.6 0 2.2l-3.8 2.2z" />
    <path fill="#EA4335" d="m16.5 15.5-3.3-3.3-9.6 9.6c.4.4.9.4 1.6.1l11.3-6.4" />
    <path fill="#4285F4" d="M16.5 8.9 5.2 2.5c-.7-.4-1.2-.3-1.6.1l9.6 9.6z" />
  </svg>
);

const item: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

/** "Download on the App Store" / "Get it on Google Play" buttons. Renders nothing without links. */
export default function StoreButtons({ appStore, playStore, appName, delay = 0 }: {
  appStore?: string | null; playStore?: string | null; appName: string; delay?: number;
}) {
  if (!appStore && !playStore) return null;
  return (
    <motion.div
      className="store-btns" initial="hidden" animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: delay } } }}
    >
      {appStore && (
        <motion.a
          variants={item} href={appStore} target="_blank" rel="noopener noreferrer" className="store-btn"
          aria-label={`Download ${appName} on the App Store`}
          whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
        >
          <AppleLogo />
          <span className="store-btn__text"><small>Download on the</small><strong>App Store</strong></span>
        </motion.a>
      )}
      {playStore && (
        <motion.a
          variants={item} href={playStore} target="_blank" rel="noopener noreferrer" className="store-btn"
          aria-label={`Get ${appName} on Google Play`}
          whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
        >
          <PlayLogo />
          <span className="store-btn__text"><small>Get it on</small><strong>Google Play</strong></span>
        </motion.a>
      )}
    </motion.div>
  );
}
