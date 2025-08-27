import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount, donationType, donorInfo } = await request.json();

    // Validate the request
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    if (!donorInfo || !donorInfo.name || !donorInfo.email) {
      return NextResponse.json(
        { error: 'Donor information is required' },
        { status: 400 }
      );
    }

    // Convert amount to cents (Stripe expects amounts in cents)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      description: `WrestleBet ${donationType} donation - $${amount}`,
      metadata: {
        donationType,
        donorName: donorInfo.name,
        donorEmail: donorInfo.email,
        donorMessage: donorInfo.message || '',
        platform: 'WrestleBet',
        type: 'donation'
      },
      receipt_email: donorInfo.email,
    });

    // Handle monthly donations by redirecting to subscription creation
    if (donationType === 'monthly') {
      // For monthly donations, create a subscription instead
      const subscriptionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/api/donations/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
        body: JSON.stringify({ amount, donorInfo })
      });

      if (!subscriptionResponse.ok) {
        throw new Error('Failed to create subscription');
      }

      const subscriptionData = await subscriptionResponse.json();
      
      return NextResponse.json({
        isSubscription: true,
        clientSecret: subscriptionData.clientSecret,
        subscriptionId: subscriptionData.subscriptionId,
        customerId: subscriptionData.customerId,
        subscription: subscriptionData.subscription
      });
    }

    // For one-time donations, proceed with payment intent
    return NextResponse.json({
      isSubscription: false,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('Error creating donation payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to process donation request' },
      { status: 500 }
    );
  }
}
