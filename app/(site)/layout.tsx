import Loader from '@/components/Loader';
import ScrollProgress from '@/components/ScrollProgress';
import CursorGlow from '@/components/CursorGlow';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { PortfolioProvider } from '@/components/PortfolioProvider';
import { getPortfolio } from '@/lib/portfolio';
import { getPosts } from '@/lib/blog';

// Re-check Supabase for new content at most every 5 minutes (ISR).
// Saving in /admin refreshes these pages immediately.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ source: _source, ...portfolio }, posts] = await Promise.all([getPortfolio(), getPosts()]);
  return (
    <PortfolioProvider value={portfolio}>
      <a className="skip" href="#main">Skip to content</a>
      <Loader />
      <ScrollProgress />
      <CursorGlow />
      <Nav showBlog={posts.length > 0} />
      {children}
      <Footer />
    </PortfolioProvider>
  );
}
