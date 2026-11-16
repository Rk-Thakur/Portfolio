'use client';
import { usePortfolio } from './PortfolioProvider';

export default function Footer() {
  const { profile } = usePortfolio();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <a href="#top" className="link-arrow up">Back to top</a>
      </div>
    </footer>
  );
}
