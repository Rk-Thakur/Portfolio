'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import PalettePicker from './PalettePicker';
import Scramble from './Scramble';
import { usePortfolio } from './PortfolioProvider';

const links = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
];

export default function Nav({ showBlog = false }: { showBlog?: boolean }) {
  const { profile } = usePortfolio();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isBlog = pathname.startsWith('/blog');
  const pageActive = isBlog ? 'blog' : 'projects';
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState<string | null>(isHome ? null : pageActive);
  const [paletteTick, setPaletteTick] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onPal = () => setPaletteTick((t) => t + 1);
    document.addEventListener('palettechange', onPal);
    return () => { window.removeEventListener('scroll', onScroll); document.removeEventListener('palettechange', onPal); };
  }, []);

  // Highlight the section in view (home page only)
  useEffect(() => {
    if (!isHome) { setActive(pageActive); return; }
    setActive(null);
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); }),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, [isHome, pageActive]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  const href = (id: string) => (id === 'blog' ? '/blog/' : isHome ? `#${id}` : `/#${id}`);
  const items = showBlog ? [...links, { id: 'blog', label: 'Blog' }] : links;

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`} id="top">
      <div className="container nav__inner">
        <Link href="/" className="brand" aria-label="Home">
          <span className="brand__mark">{profile.initials}</span>
          <span className="brand__name"><Scramble text={profile.short} trigger={paletteTick} /></span>
        </Link>
        <nav aria-label="Primary">
          <ul className={`nav__links${menu ? ' is-open' : ''}`} id="navLinks" onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setMenu(false); }}>
            {items.map((l) => (
              <li key={l.id}>
                <Link href={href(l.id)} className={active === l.id ? 'is-active' : ''}>
                  {l.label}
                  {active === l.id && (
                    <motion.span className="nav__indicator" layoutId="nav-indicator" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                  )}
                </Link>
              </li>
            ))}
            <li><Link href={href('contact')} className="nav__cta">Contact</Link></li>
          </ul>
        </nav>
        <div className="nav__actions">
          <PalettePicker />
          <button
            className={`icon-btn menu-btn${menu ? ' is-open' : ''}`}
            aria-label={menu ? 'Close menu' : 'Open menu'}
            aria-expanded={menu}
            aria-controls="navLinks"
            onClick={() => setMenu((m) => !m)}
          >
            <span className="burger" aria-hidden="true"><i /><i /><i /></span>
          </button>
        </div>
      </div>
    </header>
  );
}
