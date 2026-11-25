'use client';
import Link from 'next/link';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { usePortfolio } from './PortfolioProvider';
import { formatDate, type Post, type PostSummary, type TocItem } from '@/lib/blog-shared';
import { ease } from '@/lib/motion';

const MotionLink = motion.create(Link);

export default function PostView({ post: p, toc, prev, next, children }: {
  post: Post; toc: TocItem[]; prev: PostSummary | null; next: PostSummary | null; children: React.ReactNode;
}) {
  const { profile } = usePortfolio();
  const words = p.title.split(' ');

  // Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const markY = useTransform(heroProgress, [0, 1], [0, 140]);
  const markRotate = useTransform(heroProgress, [0, 1], [-8, 10]);
  const heroFade = useTransform(heroProgress, [0, 0.8], [1, 0.2]);

  // Reading progress through the article body
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: readProgress } = useScroll({ target: bodyRef, offset: ['start 30%', 'end 70%'] });
  const readScale = useSpring(readProgress, { stiffness: 140, damping: 26 });
  const [pct, setPct] = useState(0);
  useEffect(() => readProgress.on('change', (v) => setPct(Math.round(Math.min(1, Math.max(0, v)) * 100))), [readProgress]);

  // Highlight the heading currently being read
  const [active, setActive] = useState<string | null>(toc[0]?.id ?? null);
  useEffect(() => {
    const heads = toc.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (!heads.length) return;
    // The last heading above the top third of the screen is the one being read
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = heads[0].id;
      for (const h of heads) { if (h.getBoundingClientRect().top <= line) current = h.id; else break; }
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [toc]);

  // Share
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(window.location.href.split('#')[0]), []);
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ }
  };

  return (
    <main id="main" className="case case--v2 post">
      {/* ===== Hero ===== */}
      <section className="cx-hero post-hero" ref={heroRef}>
        <div className="aurora aurora--case" aria-hidden="true"><span /><span /><span /></div>
        <div className="cx-hero__grid" aria-hidden="true" />
        <motion.div
          className="cx-hero__mark" aria-hidden="true" style={{ y: markY, rotate: markRotate }}
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.2 }}
        >{p.cover}</motion.div>

        <motion.div className="container cx-hero__inner" style={{ opacity: heroFade }}>
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease }}>
            <Link href="/blog/" className="case__back"><span aria-hidden="true">←</span> All posts</Link>
          </motion.div>

          <motion.p className="kicker post-hero__meta" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <time dateTime={p.date}>{formatDate(p.date)}</time><span aria-hidden="true">·</span>{p.minutes} min read
          </motion.p>

          <h1 className="case__title cx-title post-hero__title" aria-label={p.title}>
            {words.map((w, i) => (
              <span className="w" key={i} aria-hidden="true">
                <motion.span
                  initial={{ y: '110%', rotate: 6 }} animate={{ y: '0%', rotate: 0 }}
                  transition={{ duration: 0.9, ease: [0.2, 0.9, 0.25, 1], delay: 0.15 + i * 0.05 }}
                >{w}</motion.span>
              </span>
            ))}
          </h1>

          {p.excerpt && (
            <motion.p className="case__summary cx-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.4 }}>
              {p.excerpt}
            </motion.p>
          )}

          {p.tags.length > 0 && (
            <motion.ul
              className="tags post-hero__tags" initial="hidden" animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.6 } } }}
            >
              {p.tags.map((t) => (
                <motion.li key={t} variants={{ hidden: { opacity: 0, y: 8, scale: 0.85 }, show: { opacity: 1, y: 0, scale: 1 } }}>{t}</motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      </section>

      {/* ===== Article + sidebar ===== */}
      <div className="container cx-wrap">
        <div className="post-body">
          <motion.article
            ref={bodyRef} className="post-article"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.3 }}
          >
            {children}
          </motion.article>

          <aside className="cx-aside post-aside" aria-label="About this post">
            <div className="cx-panel">
              <div className="post-progress">
                <div className="post-progress__head">
                  <h3>Reading progress</h3>
                  <span className="post-progress__pct">{pct}%</span>
                </div>
                <span className="post-progress__track"><motion.span className="post-progress__fill" style={{ scaleX: readScale }} /></span>
              </div>

              {toc.length > 1 && (
                <nav className="post-toc" aria-label="On this page">
                  <h3>On this page</h3>
                  <ul>
                    {toc.map((t) => (
                      <li key={t.id} className={`post-toc__d${t.depth}${active === t.id ? ' is-active' : ''}`}>
                        {active === t.id && <motion.span className="post-toc__bar" layoutId="toc-bar" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                        <a href={`#${t.id}`}>{t.text}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              <div className="cx-panel__row post-share">
                <span className="cx-panel__label">Share</span>
                <div className="post-share__btns">
                  <motion.button type="button" onClick={copyLink} whileTap={{ scale: 0.94 }} aria-label="Copy link to this post">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span key={copied ? 'y' : 'n'} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.15 }}>
                        {copied ? 'Copied ✓' : 'Copy link'}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                  <motion.a whileTap={{ scale: 0.94 }} href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">LinkedIn</motion.a>
                  <motion.a whileTap={{ scale: 0.94 }} href={`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(p.title)}`} target="_blank" rel="noopener noreferrer">X</motion.a>
                </div>
              </div>

              <div className="cx-panel__row post-author">
                <span className="cx-panel__label">Written by</span>
                <span className="post-author__who"><span className="brand__mark">{profile.initials}</span><span>{profile.name}<small>{profile.title}</small></span></span>
                <Link href="/#contact" className="link-arrow">Get in touch</Link>
              </div>
            </div>
          </aside>
        </div>

        {/* ===== Previous / next (admin order) ===== */}
        {(prev || next) && (
          <nav className="cx-pager" aria-label="More posts">
            {[{ dir: 'Previous', proj: prev, cls: 'previous' }, { dir: 'Next', proj: next, cls: 'next' }].map(({ dir, proj, cls }) =>
              proj ? (
                <MotionLink key={dir} href={`/blog/${proj.slug}/`} className={`cx-pager__card cx-pager__card--${cls}`} initial="rest" whileHover="hover" animate="rest">
                  <span className="kicker">{dir} post</span>
                  <span className="cx-pager__row">
                    {(() => {
                      const isOlder = dir === 'Next';
                      const arrow = (
                        <motion.span key="arrow" className="cx-pager__arrow" aria-hidden="true"
                          variants={{ rest: { x: 0 }, hover: { x: isOlder ? 8 : -8 } }}
                          transition={{ type: 'spring', stiffness: 300, damping: 18 }}>{isOlder ? '→' : '←'}</motion.span>
                      );
                      const icon = (
                        <motion.span key="icon" className="cx-pager__icon" aria-hidden="true"
                          variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: isOlder ? 12 : -12, scale: 1.15 } }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}>{proj.cover}</motion.span>
                      );
                      const title = <span key="title" className="cx-pager__title">{proj.title}</span>;
                      return isOlder ? [title, icon, arrow] : [arrow, icon, title];
                    })()}
                  </span>
                </MotionLink>
              ) : <span key={dir} className="cx-pager__spacer" aria-hidden="true" />
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
