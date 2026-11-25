// Turns an uploaded .json file into blog post fields (runs in the browser).

export type ImportedPost = {
  title?: string;
  slug?: string;
  cover?: string;
  published_on?: string;
  excerpt?: string;
  tags?: string[];
  body?: string;
  published?: boolean;
};

export const ACCEPTED = '.json,application/json';
export const MAX_BYTES = 5 * 1024 * 1024;

/** "Flutter vs Swift: when I pick each" → "flutter-vs-swift-when-i-pick-each" */
export function slugify(s: string) {
  return s
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 80).replace(/-+$/g, '');
}

const KEYS: Record<string, keyof ImportedPost> = {
  title: 'title', slug: 'slug', url: 'slug', 'url slug': 'slug',
  cover: 'cover', emoji: 'cover', icon: 'cover', 'cover (emoji)': 'cover',
  date: 'published_on', published_on: 'published_on', publishedon: 'published_on',
  excerpt: 'excerpt', summary: 'excerpt', description: 'excerpt',
  tags: 'tags', tag: 'tags', topics: 'tags',
  published: 'published', status: 'published',
  body: 'body', content: 'body', markdown: 'body', post: 'body',
};

const toTags = (v: unknown): string[] =>
  (Array.isArray(v) ? v.map(String) : String(v ?? '').replace(/^\[|\]$/g, '').split(/[,\n]/))
    .map((t) => t.trim().replace(/^["'#]|["']$/g, '').trim())
    .filter(Boolean);

const toBool = (v: unknown) => (typeof v === 'boolean' ? v : /^(true|yes|1|published|live)$/i.test(String(v).trim()));

/** Accepts yyyy-mm-dd, or anything Date can read ("Nov 25, 2026"). */
function toDate(v: unknown): string | undefined {
  const s = String(v ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!s || Number.isNaN(d.getTime())) return undefined;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function assign(out: ImportedPost, rawKey: string, value: unknown) {
  const key = KEYS[rawKey.trim().toLowerCase().replace(/[*_`]/g, '')];
  if (!key || value === undefined || value === null || value === '') return false;
  switch (key) {
    case 'tags': out.tags = toTags(value); break;
    case 'published': out.published = toBool(value); break;
    case 'published_on': { const d = toDate(value); if (d) out.published_on = d; break; }
    case 'slug': out.slug = slugify(String(value)); break;
    default: (out as Record<string, unknown>)[key] = String(value).trim();
  }
  return true;
}

/** If the body starts with "# Title", use it as the title and remove it (the page shows the title already). */
function splitTitle(md: string): { title?: string; body: string } {
  let text = md.replace(/\r\n?/g, '\n');
  const h1 = /^\s*#\s+(.+?)\s*#*\s*$/m.exec(text);
  if (h1 && text.slice(0, h1.index).trim() === '') {
    text = text.slice(h1.index + h1[0].length);
    return { title: h1[1].replace(/[*_`]/g, '').trim(), body: text.trim() };
  }
  return { body: text.trim() };
}

function fromJson(raw: string): ImportedPost {
  let data: unknown;
  try { data = JSON.parse(raw); } catch { throw new Error('This JSON file isn’t valid. Check for a missing comma or quote.'); }
  if (Array.isArray(data)) data = data[0];
  if (data && typeof data === 'object' && 'post' in data && typeof (data as { post: unknown }).post === 'object') data = (data as { post: unknown }).post;
  if (!data || typeof data !== 'object') throw new Error('The JSON should be an object like {"title": "...", "body": "..."}.');
  const out: ImportedPost = {};
  for (const [k, v] of Object.entries(data)) assign(out, k, v);
  // A body written as Markdown may itself start with a "# Title"
  if (out.body) {
    const inner = splitTitle(out.body);
    out.body = inner.body;
    if (!out.title && inner.title) out.title = inner.title;
  }
  return out;
}

/** Fill gaps the file didn't provide (slug from title, excerpt from the first paragraph). */
function complete(p: ImportedPost): ImportedPost {
  const out = { ...p };
  if (out.title && !out.slug) out.slug = slugify(out.title);
  if (!out.excerpt && out.body) {
    const para = out.body.split(/\n\s*\n/).map((s) => s.trim())
      .find((s) => s && !/^(#|```|>|-|\*|\d+\.|\||!\[)/.test(s));
    if (para) {
      const plain = para.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
      out.excerpt = plain.length > 220 ? `${plain.slice(0, 217).replace(/\s+\S*$/, '')}…` : plain;
    }
  }
  return out;
}

export async function parsePostFile(file: File): Promise<ImportedPost> {
  if (file.size > MAX_BYTES) throw new Error('That file is larger than 5 MB.');
  if (!file.name.toLowerCase().endsWith('.json')) throw new Error('Upload a .json file (use “Download JSON template” for the format).');
  const post = complete(fromJson(await file.text()));
  if (!post.title && !post.body) throw new Error('Couldn’t find a title or any text in that file.');
  return post;
}

/** A starter JSON file people can download and fill in. */
export const TEMPLATE = {
  title: 'My post title',
  slug: 'my-post-title',
  cover: '📱',
  date: new Date().toISOString().slice(0, 10),
  excerpt: 'One or two sentences shown on the blog list and in link previews.',
  tags: ['Flutter', 'iOS'],
  published: false,
  body: '## First section\n\nWrite your post in **Markdown** here.\n\n```dart\nvoid main() => print(\'hello\');\n```',
};
