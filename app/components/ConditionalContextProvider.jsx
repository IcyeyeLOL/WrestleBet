"use client";

import { usePathname } from 'next/navigation';
import { GlobalStateProvider } from '../contexts/GlobalStateContext';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { BettingProvider } from '../contexts/SimpleBettingProviderWrapper';

// Conditional context wrapper - only provides contexts for front page
export default function ConditionalContextProvider({ children }) {
  const pathname = usePathname();
  
  // Only provide contexts for the home page to avoid API calls on other pages
  if (pathname === '/') {
    return (
      <GlobalStateProvider>
        <CurrencyProvider>
          <BettingProvider>
            {children}
          </BettingProvider>
        </CurrencyProvider>
      </GlobalStateProvider>
    );
  }
  
  // For other pages, just return children without contexts
  return <>{children}</>;
}
