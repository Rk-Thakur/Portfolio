# Ranjan Kumar Thakur — Portfolio

Next.js (App Router) + Framer Motion, with content stored in **Supabase**.

## How content flows

```
Supabase (tables + RLS)  ──get_portfolio()──►  lib/portfolio.ts  ──►  PortfolioProvider  ──►  components
                                                     │
                                       unreachable?  └──► falls back to lib/data.ts
```

- Pages are pre-rendered and **refreshed from Supabase at most every 5 minutes** (ISR).
- If Supabase is paused or unreachable, the site uses `lib/data.ts`, so it never breaks.

## Commands

```bash
npm install          # first time only
npm run dev          # live preview at http://localhost:3000
npm run build        # production build (needs a Next.js host, e.g. Vercel)
npm run db:seed-sql  # regenerate supabase/seed.sql from lib/data.ts
```

## Environment

Copy `.env.example` to `.env.local` and fill in your Supabase Project URL and
anon/publishable key. Never commit `.env.local`. See `supabase/README.md`.

## Editing content

- **Day to day:** edit rows in Supabase → Table Editor. The live site updates within 5 minutes.
- **Fallback copy:** `lib/data.ts` (used only when Supabase is unreachable).

## Deploying (Vercel)

1. Push this folder to GitHub and import it in Vercel.
2. In Vercel → Settings → Environment Variables, add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy. (This is no longer a static export, so plain static hosts won't work.)

The original plain-HTML version is kept in `_static-version/`.
