'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === '/admin/' ? pathname === '/admin' || pathname === '/admin/' : pathname.startsWith(href.replace(/\/$/, '')));
  return (
    <nav className="adm-nav" aria-label="Admin">
      <button className="adm-nav__toggle adm-btn adm-btn--ghost" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Menu {open ? '▲' : '▼'}
      </button>
      <ul className={open ? 'is-open' : ''}>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={isActive(l.href) ? 'is-active' : ''} onClick={() => setOpen(false)}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
