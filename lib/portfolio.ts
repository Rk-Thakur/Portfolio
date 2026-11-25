import 'server-only';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { staticPortfolio, type Portfolio } from './data';

/**
 * How often (seconds) pages re-check Supabase for new content.
 * Production: every 5 minutes. Development (npm run dev): every request,
 * so a change in Supabase shows up on a normal browser refresh.
 */
export const REVALIDATE_SECONDS = process.env.NODE_ENV === 'development' ? 0 : 300;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Server-side client with the public key (RLS applies). Every request it makes
// goes through Next's fetch cache, so pages are rebuilt at most every 5 minutes.
export const publicSupabase =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: (input, init) =>
            fetch(input, { ...init, next: { revalidate: REVALIDATE_SECONDS, tags: ['portfolio'] } }),
        },
      })
    : null;

/** Basic shape check so a bad response never breaks the page. */
function isPortfolio(d: unknown): d is Portfolio {
  const p = d as Portfolio;
  return !!p && typeof p === 'object' && !!p.profile && Array.isArray(p.projects) && Array.isArray(p.experience)
    && Array.isArray(p.skills) && Array.isArray(p.stats);
}

/** Fill gaps from the static copy (e.g. a null field in the database). */
function normalize(d: Portfolio): Portfolio {
  const fb = staticPortfolio;
  const profile = { ...fb.profile };
  for (const [k, v] of Object.entries(d.profile ?? {})) {
    if (v !== null && v !== undefined && v !== '') (profile as Record<string, unknown>)[k] = v;
  }
  return {
    profile,
    stats: d.stats.map((s) => ({ ...s, value: Number(s.value), decimals: Number(s.decimals ?? 0) })),
    strengths: d.strengths ?? [],
    marquee: d.marquee?.length ? d.marquee : fb.marquee,
    skills: d.skills,
    experience: d.experience.map((e) => ({ ...e, sub: e.sub ?? '', location: e.location ?? '' })),
    projects: d.projects,
    education: (d.education ?? []).map((e) => ({ ...e, loc: e.loc ?? '' })),
  };
}

/**
 * The whole portfolio. Reads Supabase (one RPC call); falls back to lib/data.ts
 * if the env vars are missing, the project is paused, or the response is invalid.
 * Wrapped in React cache() so layout + page share one call per render.
 */
export const getPortfolio = cache(async (): Promise<Portfolio & { source: 'supabase' | 'fallback' }> => {
  const supabase = publicSupabase;
  if (!supabase) return { ...staticPortfolio, source: 'fallback' };
  try {
    const { data, error } = await supabase.rpc('get_portfolio');
    if (error) throw error;
    if (!isPortfolio(data)) throw new Error('Unexpected get_portfolio() response shape');
    return { ...normalize(data), source: 'supabase' };
  } catch (err) {
    const msg = (err as { message?: string } | null)?.message ?? String(err);
    console.warn(`[portfolio] Supabase unavailable, using lib/data.ts fallback: ${msg}`);
    return { ...staticPortfolio, source: 'fallback' };
  }
});
