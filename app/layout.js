import { Inter, Roboto_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { BettingProvider } from './contexts/SimpleBettingContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "WrestleBet - Wrestling Betting Platform",
  description: "Bet on wrestling matches with WrestleCoins",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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
