import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Markdown from '@/components/Markdown';
import PostView from '@/components/PostView';
import { getPost, getPosts } from '@/lib/blog';
import { tableOfContents } from '@/lib/blog-shared';

export const revalidate = 300;
// Posts published after a deploy get their page on first visit
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: { type: 'article', title: post.title, description: post.excerpt, publishedTime: post.date, tags: post.tags },
    twitter: { card: 'summary', title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();
  const i = posts.findIndex((p) => p.slug === slug);
  const newer = i > 0 ? posts[i - 1] : null;
  const older = i >= 0 && i < posts.length - 1 ? posts[i + 1] : null;
  return (
    <PostView post={post} toc={tableOfContents(post.body)} newer={newer} older={older}>
      <Markdown source={post.body} />
    </PostView>
  );
}
