import { getPosts } from '@/lib/blog';
import { getPortfolio } from '@/lib/portfolio';

export const revalidate = 300;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** RSS feed of published posts, at /rss.xml */
export async function GET(request: Request) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin;
  const [posts, { profile }] = await Promise.all([getPosts(), getPortfolio()]);
  const items = posts.map((p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${origin}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${origin}/blog/${p.slug}/</guid>
      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
      ${p.tags.map((t) => `<category>${esc(t)}</category>`).join('')}
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(profile.name)} — Blog</title>
    <link>${origin}/blog/</link>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${esc(`Notes on mobile and software engineering by ${profile.name}.`)}</description>
    <language>en</language>${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
