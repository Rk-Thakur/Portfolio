'use client';
import SectionHead from './SectionHead';
import PostCard from './PostCard';
import { Reveal } from './Reveal';
import Link from 'next/link';
import type { PostSummary } from '@/lib/blog-shared';

/** Home page: the newest posts. Only rendered when at least one post is published. */
export default function LatestWriting({ posts, n }: { posts: PostSummary[]; n: string }) {
  return (
    <section className="section section--alt" id="writing">
      <div className="container">
        <SectionHead kicker={`${n} — Writing`} title="Latest from the blog" />
        <div className="post-grid post-grid--home">
          {posts.map((p, i) => <PostCard key={p.slug} post={p} delay={i * 0.08} />)}
        </div>
        <Reveal as="p" className="more"><Link href="/blog/" className="link-arrow">All posts</Link></Reveal>
      </div>
    </section>
  );
}
