import type { Metadata } from 'next';
import BlogIndex from '@/components/BlogIndex';
import { getPosts } from '@/lib/blog';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Notes on mobile and software engineering: Flutter, iOS, backend and the things I learn shipping apps.',
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
};

export default async function BlogPage() {
  const posts = await getPosts();
  return <BlogIndex posts={posts} />;
}
