'use client';
import Link from 'next/link';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import PostCard from './PostCard';
import { Reveal } from './Reveal';
import type { PostSummary } from '@/lib/blog-shared';
import { ease } from '@/lib/motion';

const TITLE = 'Notes from building apps';

export default function BlogIndex({ posts }: { posts: PostSummary[] }) {
  const [tag, setTag] = useState<string>('All');
  const tags = useMemo(() => {
    const count = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
    return ['All', ...[...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t)];
  }, [posts]);
  const shown = posts.filter((p) => tag === 'All' || p.tags.includes(tag));
  const totalMinutes = posts.reduce((n, p) => n + p.minutes, 0);

  return (
    <main id="main" className="blog">
      <section className="cx-hero blog-hero">
        <div className="aurora aurora--case" aria-hidden="true"><span /><span /><span /></div>
        <div className="cx-hero__grid" aria-hidden="true" />
        <motion.div
          className="cx-hero__mark blog-hero__mark" aria-hidden="true"
          initial={{ opacity: 0, scale: 0.6, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: -8 }}
          transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.2 }}
        >✍️</motion.div>
        <div className="container cx-hero__inner">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease }}>
            <Link href="/" className="case__back"><span aria-hidden="true">←</span> Home</Link>
          </motion.div>
          <motion.p className="kicker blog-hero__kicker" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            Blog · {posts.length} {posts.length === 1 ? 'post' : 'posts'}{totalMinutes ? ` · ${totalMinutes} min of reading` : ''}
          </motion.p>
          <h1 className="case__title cx-title blog-hero__title" aria-label={TITLE}>
            {TITLE.split(' ').map((w, i) => (
              <span className="w" key={i} aria-hidden="true">
                <motion.span
                  className={w === 'apps' ? 'cx-dash' : undefined}
                  initial={{ y: '110%', rotate: 6 }} animate={{ y: '0%', rotate: 0 }}
                  transition={{ duration: 0.9, ease: [0.2, 0.9, 0.25, 1], delay: 0.15 + i * 0.07 }}
                >{w}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="case__summary cx-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.45 }}>
            What I learn shipping mobile apps and backends: Flutter, iOS, APIs, AI tools, and the decisions behind them.
          </motion.p>
          <motion.a
            href="/rss.xml" className="blog-rss" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3a16 16 0 0 1 16 16h-3A13 13 0 0 0 5 6zm0 6a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7zm1.5 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" /></svg>
            RSS feed
          </motion.a>
        </div>
      </section>

      <div className="container blog-wrap">
        {posts.length === 0 ? (
          <Reveal className="blog-empty">
            <span className="blog-empty__icon" aria-hidden="true">🌱</span>
            <h2>First posts are on the way</h2>
            <p>I&apos;m writing up lessons from building KiiBank, AI tools and this site. Check back soon.</p>
            <Link href="/#projects" className="link-arrow">Meanwhile, see my projects</Link>
          </Reveal>
        ) : (
          <>
            {tags.length > 2 && (
              <Reveal className="filters blog-filters" role="tablist" aria-label="Filter posts by tag">
                {tags.map((t) => (
                  <button key={t} role="tab" aria-selected={tag === t} className={`filter${tag === t ? ' is-active' : ''}`} onClick={() => setTag(t)}>
                    {tag === t && <motion.span className="filter__pill" layoutId="blog-filter-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                    <span className="filter__label">{t}</span>
                  </button>
                ))}
              </Reveal>
            )}
            <LayoutGroup>
              <motion.div className="post-grid" layout>
                <AnimatePresence mode="popLayout">
                  {shown.map((p, i) => (
                    <PostCard key={p.slug} post={p} layout featured={tag === 'All' && i === 0 && posts.length > 1} delay={(i % 3) * 0.06} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          </>
        )}
      </div>
    </main>
  );
}
