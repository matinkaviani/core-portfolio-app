'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { PortfolioData } from '@/lib/content/load-portfolio'

const PortfolioContext = createContext<PortfolioData | null>(null)

export function PortfolioProvider({
  portfolio,
  children,
}: {
  portfolio: PortfolioData
  children: ReactNode
}) {
  return (
    <PortfolioContext.Provider value={portfolio}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio(): PortfolioData {
  const ctx = useContext(PortfolioContext)
  if (!ctx) {
    throw new Error('usePortfolio must be used within PortfolioProvider')
  }
  return ctx
}
