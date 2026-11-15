# Ranjan Kumar Thakur — Portfolio

Next.js (App Router) + Framer Motion, exported as a static site.

## Commands

```bash
npm install      # first time only
npm run dev      # live preview at http://localhost:3000
npm run build    # writes the deployable static site to ./out
```

## Editing content

All text (profile, skills, experience, projects, education, palettes) lives in `lib/data.ts`.
Adding a project there automatically creates its card and its `/projects/<slug>/` page.

## Deploying

Upload the `out/` folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
For GitHub Pages under `https://<user>.github.io/<repo>/`, set `basePath: '/<repo>'` in `next.config.mjs`.

The previous plain-HTML version is kept in `_static-version/`.
# Portfolio
