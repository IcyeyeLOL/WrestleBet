// API route for handling Stripe webhooks
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
// Static export configuration for Next.js
export const dynamic = 'force-static';
export const revalidate = false;



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // TODO: Add WrestleCoins to user's account
      await handleSuccessfulPayment(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // TODO: Handle failed payment
      await handleFailedPayment(failedPayment);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(paymentIntent) {
  const { userId, wcAmount, bonusAmount, packageId } = paymentIntent.metadata;
  
  try {
    // In a real application, you would:
    // 1. Update user's WrestleCoin balance in the database
    // 2. Create a transaction record
    // 3. Send confirmation email
    // 4. Log the purchase for analytics
    
    console.log(`Adding ${wcAmount} WC + ${bonusAmount} bonus to user ${userId}`);
    
    // TODO: Implement database updates here
    // await updateUserBalance(userId, parseInt(wcAmount) + parseInt(bonusAmount));
    // await createTransactionRecord(userId, paymentIntent);
    
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(paymentIntent) {
  const { userId, packageId } = paymentIntent.metadata;
  
  try {
    // Handle failed payment
    console.log(`Payment failed for user ${userId}, package ${packageId}`);
    
    // TODO: Implement failure handling
    // - Send notification to user
    // - Log the failure
    // - Possibly retry payment
    
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}
