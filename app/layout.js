import { Inter, Roboto_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import ErrorBoundary from './components/ErrorBoundary';
import ConditionalContextProvider from './components/ConditionalContextProvider';
import { APP_CONFIG } from './lib/constants';

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
  title: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
  description: APP_CONFIG.description,
  keywords: "wrestling, betting, sports, WrestleCoins, matches",
  authors: [{ name: `${APP_CONFIG.name} Team` }],
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
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in"}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up"}
      fallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || "/"}
      forceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || "/"}
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
            <ConditionalContextProvider>
              {children}
            </ConditionalContextProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}