// Stripe configuration for payment processing
import { loadStripe } from '@stripe/stripe-js';

// Validate environment variable
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Warning: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

// Initialize Stripe with your publishable key
export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Stripe configuration object
export const stripeConfig = {
  // Currency settings
  currency: 'usd',
  
  // WrestleCoins packages with real pricing
  packages: [
    {
      id: 'starter',
      wc: 100,
      priceId: 'price_starter_100wc', // Stripe Price ID
      amount: 99, // $0.99 in cents
      bonus: 0,
      description: 'Perfect for trying out betting'
    },
    {
      id: 'basic',
      wc: 500,
      priceId: 'price_basic_500wc',
      amount: 499, // $4.99 in cents
      bonus: 50,
      description: 'Great value for casual bettors'
    },
    {
      id: 'premium',
      wc: 1000,
      priceId: 'price_premium_1000wc',
      amount: 999, // $9.99 in cents
      bonus: 200,
      description: 'Most popular choice'
    },
    {
      id: 'pro',
      wc: 2500,
      priceId: 'price_pro_2500wc',
      amount: 1999, // $19.99 in cents
      bonus: 500,
      description: 'For serious bettors'
    },
    {
      id: 'ultimate',
      wc: 5000,
      priceId: 'price_ultimate_5000wc',
      amount: 3999, // $39.99 in cents
      bonus: 1500,
      description: 'Maximum value package'
    }
  ]
};

// Helper function to get package by ID
export const getPackageById = (packageId) => {
  return stripeConfig.packages.find(pkg => pkg.id === packageId);
};

// Helper function to format price for display
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: stripeConfig.currency,
  }).format(amount / 100);
};
