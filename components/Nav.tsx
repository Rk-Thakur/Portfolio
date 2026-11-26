'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll, useSpring, type Variants,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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

const sheet: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.18 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};
const sheetItem: Variants = {
  hidden: { y: 48, opacity: 0, rotate: 4 },
  show: { y: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } },
  exit: { y: 24, opacity: 0, transition: { duration: 0.15 } },
};

export default function Nav({ showBlog = false }: { showBlog?: boolean }) {
  const { profile } = usePortfolio();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isBlog = pathname.startsWith('/blog');
  const pageActive = isBlog ? 'blog' : 'projects';
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const [origin, setOrigin] = useState('calc(100% - 40px) 34px');
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(isHome ? null : pageActive);
  const [paletteTick, setPaletteTick] = useState(0);
  const burger = useRef<HTMLButtonElement>(null);

  // Scroll: shrink into a floating pill, hide when scrolling down, come back when scrolling up
  const { scrollY, scrollYProgress } = useScroll();
  const ring = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    if (y < 200) setHidden(false);
    else if (y > prev + 6) setHidden(true);
    else if (y < prev - 6) setHidden(false);
  });

  useEffect(() => {
    setScrolled(window.scrollY > 40);
    const onPal = () => setPaletteTick((t) => t + 1);
    document.addEventListener('palettechange', onPal);
    return () => document.removeEventListener('palettechange', onPal);
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

  // Phone menu: Escape closes it, the page behind can't scroll, and it closes on navigation
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); html.style.overflow = prevOverflow; };
  }, [menu]);
  useEffect(() => { setMenu(false); }, [pathname]);

  const toggleMenu = () => {
    // The menu grows out of the burger button
    const r = burger.current?.getBoundingClientRect();
    if (r) setOrigin(`${Math.round(r.left + r.width / 2)}px ${Math.round(r.top + r.height / 2)}px`);
    setMenu((m) => !m);
  };

  const href = (id: string) => (id === 'blog' ? '/blog/' : isHome ? `#${id}` : `/#${id}`);
  const items = showBlog ? [...links, { id: 'blog', label: 'Blog' }] : links;

  return (
    <>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}${menu ? ' is-menu' : ''}`} id="top">
        <motion.div
          className="nav__slide"
          animate={{ y: hidden && !menu ? '-140%' : '0%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        >
          <div className="container nav__inner">
            <div className="nav__in">
              <Link href="/" className="brand" aria-label="Home">
                <span className="brand__mark">
                  <svg className="brand__ring" viewBox="0 0 44 44" aria-hidden="true">
                    <rect className="brand__ring-track" x="2" y="2" width="40" height="40" rx="13" />
                    <motion.rect className="brand__ring-fill" x="2" y="2" width="40" height="40" rx="13" pathLength={1} style={{ pathLength: ring }} />
                  </svg>
                  <span className="brand__initials">{profile.initials}</span>
                </span>
                <span className="brand__name"><Scramble text={profile.short} trigger={paletteTick} /></span>
              </Link>
            </div>

            <nav aria-label="Primary" className="nav__desk">
              <LayoutGroup id="nav-desktop">
                <ul className="nav__links" onMouseLeave={() => setHovered(null)}>
                  {items.map((l) => (
                    <li key={l.id} className="nav__in" onMouseEnter={() => setHovered(l.id)}>
                      <Link href={href(l.id)} className={active === l.id ? 'is-active' : ''} aria-current={active === l.id ? 'true' : undefined}>
                        {hovered === l.id && (
                          <motion.span className="nav__hover" layoutId="nav-hover" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                        )}
                        <span className="nav__label">{l.label}</span>
                        {active === l.id && (
                          <motion.span className="nav__indicator" layoutId="nav-indicator" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                        )}
                      </Link>
                    </li>
                  ))}
                  <li className="nav__in">
                    <Link href={href('contact')} className="nav__cta"><span>Contact</span><i aria-hidden="true">→</i></Link>
                  </li>
                </ul>
              </LayoutGroup>
            </nav>

            <div className="nav__actions nav__in">
              <PalettePicker />
              <button
                ref={burger}
                className={`icon-btn menu-btn${menu ? ' is-open' : ''}`}
                aria-label={menu ? 'Close menu' : 'Open menu'}
                aria-expanded={menu}
                aria-controls="mobileMenu"
                onClick={toggleMenu}
              >
                <span className="burger" aria-hidden="true"><i /><i /><i /></span>
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Phone menu: a full-screen sheet that grows out of the burger button */}
      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobileMenu" className="mnav" role="dialog" aria-modal="true" aria-label="Menu"
            initial={{ clipPath: `circle(0px at ${origin})` }}
            animate={{ clipPath: `circle(160vmax at ${origin})` }}
            exit={{ clipPath: `circle(0px at ${origin})`, transition: { duration: 0.45, ease: [0.7, 0, 0.2, 1], delay: 0.1 } }}
            transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
          >
            <div className="mnav__glow" aria-hidden="true" />
            <motion.ul className="mnav__list" variants={sheet} initial="hidden" animate="show" exit="exit">
              {items.map((l, i) => (
                <motion.li key={l.id} variants={sheetItem}>
                  <Link href={href(l.id)} onClick={() => setMenu(false)} className={active === l.id ? 'is-active' : ''}>
                    <span className="mnav__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="mnav__label">{l.label}</span>
                    <span className="mnav__arrow" aria-hidden="true">→</span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div className="mnav__foot" variants={sheetItem} initial="hidden" animate="show" exit="exit" transition={{ delay: 0.5 }}>
              <Link href={href('contact')} onClick={() => setMenu(false)} className="btn btn--primary mnav__cta">Let&apos;s talk <span aria-hidden="true">→</span></Link>
              <a href={`mailto:${profile.email}`} className="mnav__mail">{profile.email}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
