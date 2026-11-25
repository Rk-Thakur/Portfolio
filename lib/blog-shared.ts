// Blog helpers usable on both the server and in the browser (admin preview).
import GithubSlugger from 'github-slugger';

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  tags: string[];
  date: string;          // yyyy-mm-dd
  minutes: number;       // reading time
};
export type Post = PostSummary & { body: string; updatedAt: string };
export type TocItem = { id: string; text: string; depth: 2 | 3 };

/** Plain words of a Markdown body (code blocks count too, at a lower weight). */
export function readingMinutes(md: string) {
  const code = (md.match(/```[\s\S]*?```/g) ?? []).join(' ');
  const prose = md.replace(/```[\s\S]*?```/g, ' ');
  const words = (s: string) => (s.match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;
  return Math.max(1, Math.round(words(prose) / 220 + words(code) / 400));
}

/** "2026-11-25" → "Nov 25, 2026" (no timezone surprises). */
export function formatDate(d: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

/** ## and ### headings, with the same ids rehype-slug gives them. */
export function tableOfContents(md: string): TocItem[] {
  const slugger = new GithubSlugger();
  const out: TocItem[] = [];
  let inFence = false;
  for (const line of md.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    // Strip inline Markdown so the text matches what is rendered
    const text = m[2].replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`~]/g, '').trim();
    const id = slugger.slug(text); // every heading level advances the slugger, like rehype-slug
    if (m[1].length === 2 || m[1].length === 3) out.push({ id, text, depth: m[1].length as 2 | 3 });
  }
  return out;
}
