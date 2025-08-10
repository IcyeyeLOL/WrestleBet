// Simplified API route for creating payment intents (for testing)
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { packageId, amount } = await request.json();
    
    // For testing purposes, we'll simulate a successful payment intent creation
    // In production, you would use actual Stripe API here
    
    console.log(`Creating payment intent for package: ${packageId}, amount: $${amount/100}`);
    
    // Simulate Stripe payment intent response
    const mockPaymentIntent = {
      client_secret: `pi_test_${Date.now()}_secret_test`,
      status: 'requires_payment_method',
      amount: amount,
      currency: 'usd',
      metadata: {
        packageId: packageId
      }
    };

    // For testing, we'll return a mock client secret
    // In production, replace this with actual Stripe integration:
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: { packageId }
    });
    */

    return NextResponse.json({
      clientSecret: mockPaymentIntent.client_secret,
      packageId: packageId
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
