import { Inter, Roboto_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { GlobalStateProvider } from './contexts/GlobalStateContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { BettingProvider } from './contexts/SimpleBettingProviderWrapper';
import ErrorBoundary from './components/ErrorBoundary';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "WrestleBet - Wrestling Betting Platform",
  description: "Bet on wrestling matches with WrestleCoins",
  keywords: "wrestling, betting, sports, WrestleCoins, matches",
  authors: [{ name: "WrestleBet Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-white/90 shadow-xl border-0",
        }
      }}
    >
      <html lang="en">
        <body
          className={`${inter.variable} ${robotoMono.variable} antialiased`}
        >
          <ErrorBoundary>
            <GlobalStateProvider>
              <CurrencyProvider>
                <BettingProvider>
                  {children}
                </BettingProvider>
              </CurrencyProvider>
            </GlobalStateProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
