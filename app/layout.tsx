import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Loader from '@/components/Loader';
import ScrollProgress from '@/components/ScrollProgress';
import CursorGlow from '@/components/CursorGlow';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { PortfolioProvider } from '@/components/PortfolioProvider';
import { getPortfolio } from '@/lib/portfolio';
import { profile } from '@/lib/data';

export const metadata: Metadata = {
  title: { default: `${profile.name} — Mobile Engineer (Flutter, iOS, Android) & Software Engineer`, template: `%s · ${profile.short}` },
  description:
    'Ranjan Kumar Thakur — Mobile & Software Engineer. 3+ years shipping production iOS and Android apps used by 10,000+ people, plus the FastAPI services, real-time sync, CI/CD and data pipelines behind them.',
  openGraph: {
    title: `${profile.name} — Mobile & Software Engineer`,
    description: 'Mobile & Software Engineer: Flutter, iOS, Android, FastAPI, CI/CD. 40% faster delivery, 70% less release effort, 4.5★ apps.',
    type: 'website',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='%2322d3ee'/><text x='50%25' y='56%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-weight='700' font-size='28' fill='%230b0f17'>RT</text></svg>",
  },
};

export const viewport: Viewport = { themeColor: '#0b0f17' };

// Runs before first paint so the saved palette never flashes.
const paletteScript = `(function(){var light={paper:1,sand:1},p;try{p=localStorage.getItem('palette')}catch(e){}
if(!p)p=window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'paper':'midnight';
var r=document.documentElement;r.dataset.palette=p;r.dataset.theme=light[p]?'light':'dark';})();`;

// Re-check Supabase for new content at most every 5 minutes (ISR)
export const revalidate = 300;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { source: _source, ...portfolio } = await getPortfolio();
  return (
    <html lang="en" data-palette="midnight" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: paletteScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <PortfolioProvider value={portfolio}>
          <a className="skip" href="#main">Skip to content</a>
          <Loader />
          <ScrollProgress />
          <CursorGlow />
          <Nav />
          {children}
          <Footer />
          </PortfolioProvider>
        </Providers>
      </body>
    </html>
  );
}
