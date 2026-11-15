/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export: `npm run build` writes a deployable site to /out
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // If you host at https://<user>.github.io/<repo>/, set basePath: '/<repo>'
};
export default nextConfig;
