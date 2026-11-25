import 'server-only';
import { cache } from 'react';
import { publicSupabase } from './portfolio';
import { readingMinutes, type Post, type PostSummary } from './blog-shared';

type Row = {
  slug: string; title: string; excerpt: string; cover: string; tags: string[] | null;
  body: string; published_on: string; updated_at: string;
};

const toSummary = (r: Row): PostSummary => ({
  slug: r.slug, title: r.title, excerpt: r.excerpt ?? '', cover: r.cover || '✍️',
  tags: r.tags ?? [], date: r.published_on, minutes: readingMinutes(r.body ?? ''),
});

/**
 * Published posts, newest first. RLS hides drafts from the public key.
 * Uses the same 5-minute cache + 'portfolio' tag as the rest of the site,
 * so saving in /admin refreshes the blog immediately.
 * Returns [] if Supabase is unreachable (the blog then shows an empty state).
 */
export const getPosts = cache(async (): Promise<PostSummary[]> => {
  if (!publicSupabase) return [];
  try {
    const { data, error } = await publicSupabase
      .from('posts')
      .select('slug, title, excerpt, cover, tags, body, published_on, updated_at')
      .eq('published', true)
      .order('published_on', { ascending: false })
      .order('id', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as Row[]).map(toSummary);
  } catch (err) {
    console.warn(`[blog] Could not load posts: ${(err as { message?: string })?.message ?? err}`);
    return [];
  }
});

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  if (!publicSupabase || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  try {
    const { data, error } = await publicSupabase
      .from('posts')
      .select('slug, title, excerpt, cover, tags, body, published_on, updated_at')
      .eq('published', true)
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const r = data as Row;
    return { ...toSummary(r), body: r.body ?? '', updatedAt: r.updated_at };
  } catch (err) {
    console.warn(`[blog] Could not load post "${slug}": ${(err as { message?: string })?.message ?? err}`);
    return null;
  }
});
