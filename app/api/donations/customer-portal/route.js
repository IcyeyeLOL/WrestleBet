import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// Dynamic export configuration for Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { customerId, returnUrl } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Create a billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/donation`,
    });

    return NextResponse.json({
      url: portalSession.url
    });

  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}
