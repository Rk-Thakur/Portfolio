'use client';
import { createContext, useContext } from 'react';
import { staticPortfolio, type Portfolio } from '@/lib/data';

const PortfolioContext = createContext<Portfolio>(staticPortfolio);

/** Makes the portfolio (loaded on the server) available to every client component. */
export function PortfolioProvider({ value, children }: { value: Portfolio; children: React.ReactNode }) {
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export const usePortfolio = () => useContext(PortfolioContext);
