'use client';
import Link from 'next/link';
import { animate, motion, useInView, useScroll, useSpring, useTransform, type Variants } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from './Reveal';
import Magnetic from './Magnetic';
import StoreButtons from './StoreButtons';
import type { Project } from '@/lib/data';
import { usePortfolio } from './PortfolioProvider';
import { ease } from '@/lib/motion';

const catLabel = { mobile: 'Mobile app', backend: 'Backend & AI', oss: 'Open source' } as const;
const platform = { mobile: 'iOS & Android', backend: 'Server & cloud', oss: 'Developer tooling' } as const;

const MotionLink = motion.create(Link);

/** Number that counts up when it scrolls into view. */
function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1, ease, onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{v}</span>;
}

const chips: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const chip: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.85 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 20 } },
};

export default function ProjectDetail({ project: p, prev, next, index, total }: {
  project: Project; prev: Project; next: Project; index: number; total: number;
}) {
  const { profile, experience } = usePortfolio();
  const words = p.title.split(' ');
  const appName = p.title.split(' — ')[0];
  const builtDuring = experience.find((e) => e.projects?.includes(p.slug));

  // Hero parallax: the big emoji drifts and turns as you scroll away
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const markY = useTransform(heroProgress, [0, 1], [0, 160]);
  const markRotate = useTransform(heroProgress, [0, 1], [-8, 12]);
  const heroFade = useTransform(heroProgress, [0, 0.8], [1, 0.2]);

  // "What I built" line that fills as you read
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress: listProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 55%'] });
  const lineScale = useSpring(listProgress, { stiffness: 120, damping: 25 });

  const glance = [
    { label: 'Category', value: p.badge },
    { label: 'Platform', value: platform[p.cat] },
    { label: 'Tools used', value: <Count to={p.tags.length} /> },
    { label: 'Highlights', value: <Count to={p.highlights.length} /> },
  ];

  return (
    <main id="main" className="case case--v2">
      {/* ===== Hero ===== */}
      <section className="cx-hero" ref={heroRef}>
        <div className="aurora aurora--case" aria-hidden="true"><span /><span /><span /></div>
        <div className="cx-hero__grid" aria-hidden="true" />
        <motion.div
          className="cx-hero__mark" aria-hidden="true"
          style={{ y: markY, rotate: markRotate }}
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.2 }}
        >
          {p.icon}
        </motion.div>

        <motion.div className="container cx-hero__inner" style={{ opacity: heroFade }}>
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease }}>
            <Link href="/#projects" className="case__back"><span aria-hidden="true">←</span> All projects</Link>
          </motion.div>

          <div className="cx-hero__top">
            <motion.div
              className="case__icon"
              initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
              whileHover={{ rotate: -10, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
            >
              {p.icon}
            </motion.div>
            <motion.p className="kicker cx-kicker" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
              <span className="cx-index">{String(index + 1).padStart(2, '0')}<em>/{String(total).padStart(2, '0')}</em></span>
              {p.badge} · {catLabel[p.cat]}
            </motion.p>
          </div>

          <h1 className="case__title cx-title" aria-label={p.title}>
            {words.map((w, i) => (
              <span className="w" key={i} aria-hidden="true">
                <motion.span
                  className={w === '—' ? 'cx-dash' : undefined}
                  initial={{ y: '110%', rotate: 6 }} animate={{ y: '0%', rotate: 0 }}
                  transition={{ duration: 0.9, ease: [0.2, 0.9, 0.25, 1], delay: 0.15 + i * 0.07 }}
                >{w}</motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="case__summary cx-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.45 }}>
            {p.summary}
          </motion.p>

          <StoreButtons appStore={p.appStore} playStore={p.playStore} appName={appName} delay={0.7} />
        </motion.div>
      </section>

      <div className="container cx-wrap">
        {/* ===== At a glance ===== */}
        <motion.ul
          className="cx-glance" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {glance.map((g) => (
            <motion.li
              key={g.label}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
              whileHover={{ y: -4 }}
            >
              <span className="cx-glance__label">{g.label}</span>
              <strong className="cx-glance__value">{g.value}</strong>
            </motion.li>
          ))}
        </motion.ul>

        {/* ===== Body: highlights + sticky sidebar ===== */}
        <div className="cx-body">
          <section aria-labelledby="cx-built">
            <Reveal className="cx-section-head">
              <p className="kicker" id="cx-built">What I built</p>
              <h2>Highlights</h2>
            </Reveal>
            <ol className="cx-steps" ref={listRef}>
              <span className="cx-steps__track" aria-hidden="true" />
              <motion.span className="cx-steps__fill" style={{ scaleY: lineScale }} aria-hidden="true" />
              {p.highlights.map((h, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6, ease, delay: 0.05 }}
                >
                  <motion.span
                    className="cx-steps__dot" aria-hidden="true"
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, amount: 0.8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.15 }}
                  />
                  <motion.div className="cx-steps__card" whileHover={{ x: 6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                    <span className="cx-steps__num">{String(i + 1).padStart(2, '0')}</span>
                    <p>{h}</p>
                  </motion.div>
                </motion.li>
              ))}
            </ol>
          </section>

          <aside className="cx-aside" aria-label="Project details">
            <Reveal className="cx-panel">
              <h3>Tech stack</h3>
              <motion.ul className="cx-stack" initial="hidden" whileInView="show" viewport={{ once: true }} variants={chips}>
                {p.tags.map((t) => (
                  <motion.li key={t} variants={chip} whileHover={{ y: -2, scale: 1.05 }}>{t}</motion.li>
                ))}
              </motion.ul>

              {builtDuring && (
                <div className="cx-panel__row">
                  <span className="cx-panel__label">Built during</span>
                  <span>{builtDuring.company}</span>
                  <span className="cx-muted">{builtDuring.date}</span>
                </div>
              )}

              <div className="cx-panel__cta">
                <p>Want the details behind this project?</p>
                <Magnetic className="btn btn--primary" href={`mailto:${profile.email}?subject=${encodeURIComponent(`About ${appName}`)}`}>
                  <span>Ask me about it</span>
                </Magnetic>
              </div>
            </Reveal>
          </aside>
        </div>

        {/* ===== Prev / next ===== */}
        <nav className="cx-pager" aria-label="More projects">
          {[{ dir: 'Previous', proj: prev }, { dir: 'Next', proj: next }].map(({ dir, proj }) => (
            <MotionLink
              key={dir} href={`/projects/${proj.slug}/`} className={`cx-pager__card cx-pager__card--${dir.toLowerCase()}`}
              initial="rest" whileHover="hover" animate="rest"
            >
              <span className="kicker">{dir} project</span>
              <span className="cx-pager__row">
                {(() => {
                  const isNext = dir === 'Next';
                  const arrow = (
                    <motion.span key="arrow" className="cx-pager__arrow" aria-hidden="true"
                      variants={{ rest: { x: 0 }, hover: { x: isNext ? 8 : -8 } }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}>{isNext ? '→' : '←'}</motion.span>
                  );
                  const icon = (
                    <motion.span key="icon" className="cx-pager__icon" aria-hidden="true"
                      variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: isNext ? 12 : -12, scale: 1.15 } }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}>{proj.icon}</motion.span>
                  );
                  const title = <span key="title" className="cx-pager__title">{proj.title}</span>;
                  // Previous: ← icon title   ·   Next: title icon →
                  return isNext ? [title, icon, arrow] : [arrow, icon, title];
                })()}
              </span>
            </MotionLink>
          ))}
        </nav>
      </div>
    </main>
  );
}
