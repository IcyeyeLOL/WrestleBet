import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount, donorInfo } = await request.json();

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

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: donorInfo.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: donorInfo.email,
        name: donorInfo.name,
        metadata: {
          platform: 'WrestleBet',
          type: 'donor'
        }
      });
    }

    // Create a product for this donation amount (if it doesn't exist)
    const productId = `wrestlebet-monthly-${amount}`;
    let product;
    
    try {
      product = await stripe.products.retrieve(productId);
    } catch (error) {
      if (error.code === 'resource_missing') {
        product = await stripe.products.create({
          id: productId,
          name: `WrestleBet Monthly Donation - $${amount}`,
          description: `Monthly recurring donation of $${amount} to support WrestleBet platform`,
          metadata: {
            platform: 'WrestleBet',
            type: 'monthly_donation',
            amount: amount.toString()
          }
        });
      } else {
        throw error;
      }
    }

    // Create price for the subscription
    const priceId = `${productId}-price`;
    let price;
    
    try {
      price = await stripe.prices.retrieve(priceId);
    } catch (error) {
      if (error.code === 'resource_missing') {
        price = await stripe.prices.create({
          id: priceId,
          product: product.id,
          unit_amount: amountInCents,
          currency: 'usd',
          recurring: {
            interval: 'month'
          },
          metadata: {
            platform: 'WrestleBet',
            amount: amount.toString()
          }
        });
      } else {
        throw error;
      }
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: price.id,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        platform: 'WrestleBet',
        donorName: donorInfo.name,
        donorEmail: donorInfo.email,
        donorMessage: donorInfo.message || '',
        type: 'monthly_donation'
      }
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId: customer.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        amount: amountInCents,
        currency: 'usd',
        interval: 'month'
      }
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription: ' + error.message },
      { status: 500 }
    );
  }
}
