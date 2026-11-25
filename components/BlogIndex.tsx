'use client';
import Link from 'next/link';
import {
  AnimatePresence, LayoutGroup, animate, motion, useInView, useMotionValue, useSpring, useTransform, type MotionValue,
} from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import PostCard from './PostCard';
import { Reveal } from './Reveal';
import type { PostSummary } from '@/lib/blog-shared';
import { ease } from '@/lib/motion';

const WORDS = ['Notes', 'from', 'building', 'apps'];
const EXTRA = ['📱', '⚡', '🧠', '🛠️', '✍️', '🚀', '💡'];

// Where the floating emojis sit in the hero (percent of the cloud box) and how "deep" they are
const SPOTS = [
  { x: 62, y: 10, size: 4.2, depth: 1.2, dur: 6 },
  { x: 18, y: 30, size: 3, depth: 0.6, dur: 7.5 },
  { x: 74, y: 56, size: 3.4, depth: 0.9, dur: 5.5 },
  { x: 34, y: 66, size: 2.4, depth: 0.4, dur: 8 },
  { x: 8, y: 2, size: 2, depth: 0.3, dur: 9 },
  { x: 46, y: 34, size: 5.2, depth: 1.5, dur: 6.5 },
  { x: 90, y: 24, size: 2.2, depth: 0.5, dur: 7 },
];

function Count({ to }: { to: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.2, ease, delay: 0.6, onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, to]);
  return <b ref={ref}>{v}</b>;
}

function Floater({ emoji, spot, i, mx, my }: {
  emoji: string; spot: (typeof SPOTS)[number]; i: number; mx: MotionValue<number>; my: MotionValue<number>;
}) {
  const x = useTransform(mx, (v) => v * 28 * spot.depth);
  const y = useTransform(my, (v) => v * 22 * spot.depth);
  return (
    <motion.span className="blog-cloud__item" style={{ left: `${spot.x}%`, top: `${spot.y}%`, fontSize: `${spot.size}rem`, x, y, zIndex: Math.round(spot.depth * 10) }}>
      <motion.span
        initial={{ opacity: 0, scale: 0, rotate: -30 }}
        animate={{ opacity: spot.depth < 0.5 ? 0.45 : 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.3 + i * 0.09 }}
      >
        <motion.span
          animate={{ y: [0, -14, 0], rotate: [0, i % 2 ? 8 : -8, 0] }}
          transition={{ duration: spot.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
          style={{ display: 'inline-block' }}
        >{emoji}</motion.span>
      </motion.span>
    </motion.span>
  );
}

export default function BlogIndex({ posts }: { posts: PostSummary[] }) {
  const [tag, setTag] = useState<string>('All');
  const [query, setQuery] = useState('');

  const tags = useMemo(() => {
    const count = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
    return [['All', posts.length] as const, ...[...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))];
  }, [posts]);

  const q = query.trim().toLowerCase();
  const shown = posts.filter((p) =>
    (tag === 'All' || p.tags.includes(tag)) &&
    (!q || `${p.title} ${p.excerpt} ${p.tags.join(' ')}`.toLowerCase().includes(q)));
  const showFeatured = tag === 'All' && !q;
  const totalMinutes = posts.reduce((n, p) => n + p.minutes, 0);

  // Emoji cloud: the posts' own covers first, topped up with defaults
  const cloud = useMemo(() => {
    const own = [...new Set(posts.map((p) => p.cover))];
    return [...own, ...EXTRA.filter((e) => !own.includes(e))].slice(0, SPOTS.length);
  }, [posts]);

  // Mouse parallax for the cloud
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <main id="main" className="blog">
      <section className="cx-hero blog-hero" onPointerMove={onMove} onPointerLeave={() => { mx.set(0); my.set(0); }}>
        <div className="aurora aurora--case" aria-hidden="true"><span /><span /><span /></div>
        <div className="cx-hero__grid" aria-hidden="true" />
        <div className="blog-cloud" aria-hidden="true">
          {cloud.map((e, i) => <Floater key={e} emoji={e} spot={SPOTS[i]} i={i} mx={mx} my={my} />)}
        </div>

        <div className="container cx-hero__inner">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease }}>
            <Link href="/" className="case__back"><span aria-hidden="true">←</span> Home</Link>
          </motion.div>

          <motion.p className="kicker blog-hero__kicker" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <span className="blog-hero__pulse" aria-hidden="true" /> The blog
          </motion.p>

          <h1 className="case__title cx-title blog-hero__title" aria-label={WORDS.join(' ')}>
            {WORDS.map((w, i) => {
              const word = (
                <span className="w" key={i} aria-hidden="true">
                  <motion.span
                    className={w === 'apps' ? 'cx-dash' : undefined}
                    initial={{ y: '110%', rotate: 6 }} animate={{ y: '0%', rotate: 0 }}
                    transition={{ duration: 0.9, ease: [0.2, 0.9, 0.25, 1], delay: 0.15 + i * 0.08 }}
                  >{w}</motion.span>
                </span>
              );
              if (w !== 'apps') return word;
              // The underline sits outside the word's clipping box so it isn't cut off
              return (
                <span className="blog-hero__ink" key={i} aria-hidden="true">
                  {word}
                  <svg className="blog-hero__scribble" viewBox="0 0 200 24" preserveAspectRatio="none">
                    <motion.path
                      d="M3 15 C 40 5, 80 5, 110 12 S 170 22, 197 8"
                      fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.95 }}
                    />
                  </svg>
                </span>
              );
            })}
          </h1>

          <motion.p className="case__summary cx-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.45 }}>
            What I learn shipping mobile apps and backends: Flutter, iOS, APIs, AI tools, and the decisions behind them.
          </motion.p>

          <motion.ul
            className="blog-stats" initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.55 } } }}
          >
            {[
              { n: posts.length, label: posts.length === 1 ? 'post' : 'posts' },
              { n: totalMinutes, label: 'min of reading' },
              { n: tags.length - 1, label: tags.length === 2 ? 'topic' : 'topics' },
            ].map((s) => (
              <motion.li key={s.label} variants={{ hidden: { opacity: 0, y: 14, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } } }}>
                <Count to={s.n} /> <span>{s.label}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      <div className="container blog-wrap">
        {posts.length === 0 ? (
          <Reveal className="blog-empty">
            <span className="blog-empty__icon" aria-hidden="true">🌱</span>
            <h2>First posts are on the way</h2>
            <p>I&apos;m writing up lessons from building mobile apps, AI tools and this site. Check back soon.</p>
            <Link href="/#projects" className="link-arrow">Meanwhile, see my projects</Link>
          </Reveal>
        ) : (
          <>
            <Reveal className="blog-controls" y={20}>
              <label className="blog-search">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                <input
                  type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts…" aria-label="Search posts"
                />
                <AnimatePresence>
                  {query && (
                    <motion.button
                      type="button" className="blog-search__clear" onClick={() => setQuery('')} aria-label="Clear search"
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    >×</motion.button>
                  )}
                </AnimatePresence>
              </label>
              {tags.length > 2 && (
                <div className="filters blog-filters" role="tablist" aria-label="Filter posts by topic">
                  {tags.map(([t, n]) => (
                    <button key={t} role="tab" aria-selected={tag === t} className={`filter${tag === t ? ' is-active' : ''}`} onClick={() => setTag(t)}>
                      {tag === t && <motion.span className="filter__pill" layoutId="blog-filter-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                      <span className="filter__label">{t} <em className="blog-filters__n">{n}</em></span>
                    </button>
                  ))}
                </div>
              )}
            </Reveal>

            <LayoutGroup>
              <motion.div className="post-grid" layout>
                <AnimatePresence mode="popLayout">
                  {shown.map((p, i) => (
                    <PostCard key={p.slug} post={p} layout featured={showFeatured && i === 0} delay={(i % 3) * 0.07} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>

            <AnimatePresence>
              {shown.length === 0 && (
                <motion.div className="blog-none" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <span aria-hidden="true">🔍</span>
                  <p>No posts match{q ? <> “<strong>{query.trim()}</strong>”</> : null}{tag !== 'All' ? <> in <strong>{tag}</strong></> : null}.</p>
                  <button type="button" className="link-arrow" onClick={() => { setQuery(''); setTag('All'); }}>Show all posts</button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </main>
  );
}
