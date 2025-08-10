import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Log successful donation (in production, save to database)
      console.log('Donation successful:', {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        donor: paymentIntent.metadata.donorName,
        email: paymentIntent.metadata.donorEmail,
        type: paymentIntent.metadata.donationType,
        timestamp: new Date().toISOString()
      });

      // TODO: Save donation to database, send confirmation email, etc.
      
      return NextResponse.json({
        success: true,
        donation: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          donorName: paymentIntent.metadata.donorName,
          donorEmail: paymentIntent.metadata.donorEmail,
          donationType: paymentIntent.metadata.donationType,
          message: paymentIntent.metadata.donorMessage
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Payment was not successful', status: paymentIntent.status },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error confirming donation:', error);
    return NextResponse.json(
      { error: 'Failed to confirm donation' },
      { status: 500 }
    );
  }
}
