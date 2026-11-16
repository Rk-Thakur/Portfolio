'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useState } from 'react';

export default function AdminNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === '/admin/' ? pathname === '/admin' || pathname === '/admin/' : pathname.startsWith(href.replace(/\/$/, '')));

  const items = links.map((l) => (
    <li key={l.href}>
      <Link href={l.href} className={isActive(l.href) ? 'is-active' : ''} onClick={() => setOpen(false)}>
        {/* The highlight slides between items (shared layout animation) */}
        {isActive(l.href) && (
          <motion.span className="adm-nav__pill" layoutId="adm-nav-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
        )}
        <span className="adm-nav__label">{l.label}</span>
      </Link>
    </li>
  ));

  return (
    <nav className="adm-nav" aria-label="Admin">
      <motion.button
        className="adm-nav__toggle adm-btn adm-btn--ghost" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.95 }}
      >
        Menu <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>▾</motion.span>
      </motion.button>

      {/* Desktop: always visible */}
      <LayoutGroup id="nav-desktop"><ul className="adm-nav__list">{items}</ul></LayoutGroup>

      {/* Phone: drops down with a staggered reveal */}
      <AnimatePresence>
        {open && (
          <motion.ul
            className="adm-nav__drop"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <LayoutGroup id="nav-phone">{items}</LayoutGroup>
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  );
}
