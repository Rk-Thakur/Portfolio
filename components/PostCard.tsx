'use client';
import Link from 'next/link';
import { TiltCard } from './Reveal';
import { formatDate, type PostSummary } from '@/lib/blog-shared';

/** Blog card used on /blog and in the home "Writing" section. */
export default function PostCard({ post: p, delay = 0, featured = false, layout }: {
  post: PostSummary; delay?: number; featured?: boolean; layout?: boolean;
}) {
  return (
    <TiltCard
      className={`project post-card${featured ? ' post-card--featured' : ''}`} delay={delay} layout={layout}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(6px)', transition: { duration: 0.25 } }}
    >
      <div className="post-card__top">
        <span className="post-card__cover" aria-hidden="true">{p.cover}</span>
        <span className="post-card__meta"><time dateTime={p.date}>{formatDate(p.date)}</time> · {p.minutes} min read</span>
      </div>
      {featured && <span className="post-card__badge">Latest</span>}
      <h3>{p.title}</h3>
      <p>{p.excerpt}</p>
      {p.tags.length > 0 && <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>}
      <Link href={`/blog/${p.slug}/`} className="project__cover" aria-label={`Read “${p.title}”`} />
      <span className="project__more">Read post <span aria-hidden="true">→</span></span>
    </TiltCard>
  );
}
