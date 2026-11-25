'use client';
import Link from 'next/link';
import { TiltCard } from './Reveal';
import { formatDate, type PostSummary } from '@/lib/blog-shared';

/** Stable hue (0–359) from the slug, so every post gets its own cover colours. */
export const postHue = (slug: string) => {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 360;
};

/** Generated "cover art": colour mesh + dot grid + floating emoji, unique per post. */
export function PostArt({ post: p, big = false }: { post: PostSummary; big?: boolean }) {
  return (
    <div className={`post-art${big ? ' post-art--big' : ''}`} style={{ '--h': postHue(p.slug) } as React.CSSProperties} aria-hidden="true">
      <span className="post-art__blob post-art__blob--a" />
      <span className="post-art__blob post-art__blob--b" />
      <span className="post-art__blob post-art__blob--c" />
      <span className="post-art__dots" />
      <span className="post-art__ring" />
      <span className="post-art__emoji"><span>{p.cover}</span></span>
      <span className="post-art__read">{p.minutes} min read</span>
    </div>
  );
}

/** Blog card used on /blog and in the home "Writing" section. */
export default function PostCard({ post: p, delay = 0, featured = false, layout }: {
  post: PostSummary; delay?: number; featured?: boolean; layout?: boolean;
}) {
  return (
    <TiltCard
      className={`project post-card${featured ? ' post-card--featured' : ''}`} delay={delay} layout={layout}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(6px)', transition: { duration: 0.25 } }}
    >
      <PostArt post={p} big={featured} />
      <div className="post-card__body">
        <div className="post-card__meta">
          {featured && <span className="post-card__badge">★ Featured</span>}
          <time dateTime={p.date}>{formatDate(p.date)}</time>
        </div>
        <h3>{p.title}</h3>
        <p>{p.excerpt}</p>
        {p.tags.length > 0 && <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>}
        <span className="project__more post-card__more">Read post <span aria-hidden="true">→</span></span>
      </div>
      <Link href={`/blog/${p.slug}/`} className="project__cover" aria-label={`Read “${p.title}”`} />
    </TiltCard>
  );
}
