import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// Dynamic export configuration for Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get subscription details
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'customer']
    });

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        customer: subscription.customer,
        latest_invoice: subscription.latest_invoice
      }
    });

  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve subscription' },
      { status: 500 }
    );
  }
}

// Cancel subscription
export async function DELETE(request) {
  try {
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Cancel at period end to be customer-friendly
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.current_period_end
      }
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

// Update subscription
export async function PUT(request) {
  try {
    const { subscriptionId, newAmount } = await request.json();

    if (!subscriptionId || !newAmount) {
      return NextResponse.json(
        { error: 'Subscription ID and new amount are required' },
        { status: 400 }
      );
    }

    // Get current subscription
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const amountInCents = Math.round(newAmount * 100);

    // Create new price for the new amount
    const productId = `wrestlebet-monthly-${newAmount}`;
    const priceId = `${productId}-price`;
    
    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
    } catch (error) {
      if (error.code === 'resource_missing') {
        // Create product if needed
        let product;
        try {
          product = await stripe.products.retrieve(productId);
        } catch (productError) {
          if (productError.code === 'resource_missing') {
            product = await stripe.products.create({
              id: productId,
              name: `WrestleBet Monthly Donation - $${newAmount}`,
              description: `Monthly recurring donation of $${newAmount} to support WrestleBet platform`
            });
          } else {
            throw productError;
          }
        }

        price = await stripe.prices.create({
          id: priceId,
          product: product.id,
          unit_amount: amountInCents,
          currency: 'usd',
          recurring: {
            interval: 'month'
          }
        });
      } else {
        throw error;
      }
    }

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: currentSubscription.items.data[0].id,
        price: price.id,
      }],
      proration_behavior: 'create_prorations'
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        amount: amountInCents,
        currency: 'usd'
      }
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
