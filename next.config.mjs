/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pages are pre-rendered and refreshed from Supabase every 5 minutes (ISR),
  // so this needs a Next.js host such as Vercel (no longer a plain static export).
  // Lets a production build run without disturbing a running dev server (NEXT_DIST_DIR=.next-build)
  distDir: process.env.NEXT_DIST_DIR || '.next',
  trailingSlash: true,
  images: { unoptimized: true },
  // Dev server log shows each Supabase request and whether it hit the cache
  logging: { fetches: { fullUrl: false } },
};
export default nextConfig;
