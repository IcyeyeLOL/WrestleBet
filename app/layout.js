import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { BettingProvider } from './contexts/SimpleBettingContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "WrestleBet - Wrestling Betting Platform",
  description: "Bet on wrestling matches with WrestleCoins",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <BettingProvider>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </BettingProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
