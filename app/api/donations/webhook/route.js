import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// Static export configuration for Next.js
export const dynamic = 'force-static';
export const revalidate = false;



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleSuccessfulSubscriptionPayment(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleFailedSubscriptionPayment(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulSubscriptionPayment(invoice) {
  console.log('Subscription payment succeeded:', invoice.id);
  
  // Get customer details
  const customer = await stripe.customers.retrieve(invoice.customer);
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  
  // TODO: Store successful payment in your database
  console.log(`Payment of $${invoice.amount_paid / 100} succeeded for ${customer.email}`);
  
  // TODO: Send thank you email
  await sendSubscriptionPaymentConfirmationEmail({
    customerEmail: customer.email,
    customerName: customer.name,
    amount: invoice.amount_paid / 100,
    subscriptionId: subscription.id,
    invoiceId: invoice.id,
    nextPaymentDate: new Date(invoice.period_end * 1000)
  });
}

async function handleFailedSubscriptionPayment(invoice) {
  console.log('Subscription payment failed:', invoice.id);
  
  // Get customer details
  const customer = await stripe.customers.retrieve(invoice.customer);
  
  // TODO: Store failed payment in your database
  console.log(`Payment failed for ${customer.email}`);
  
  // TODO: Send payment failure notification email
  await sendSubscriptionPaymentFailedEmail({
    customerEmail: customer.email,
    customerName: customer.name,
    amount: invoice.amount_due / 100,
    invoiceId: invoice.id
  });
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  
  // TODO: Store subscription in your database
  const customer = await stripe.customers.retrieve(subscription.customer);
  console.log(`New subscription for ${customer.email}: ${subscription.id}`);
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // TODO: Update subscription in your database
  const customer = await stripe.customers.retrieve(subscription.customer);
  console.log(`Subscription updated for ${customer.email}: ${subscription.id}`);
}

async function handleSubscriptionCancelled(subscription) {
  console.log('Subscription cancelled:', subscription.id);
  
  // TODO: Update subscription status in your database
  const customer = await stripe.customers.retrieve(subscription.customer);
  console.log(`Subscription cancelled for ${customer.email}: ${subscription.id}`);
  
  // TODO: Send cancellation confirmation email
  await sendSubscriptionCancelledEmail({
    customerEmail: customer.email,
    customerName: customer.name,
    subscriptionId: subscription.id
  });
}

// Email functions (you can integrate with your preferred email service)
async function sendSubscriptionPaymentConfirmationEmail({ customerEmail, customerName, amount, subscriptionId, invoiceId, nextPaymentDate }) {
  console.log(`📧 Sending payment confirmation email to ${customerEmail}`);
  
  // TODO: Implement email sending using your preferred service (Nodemailer, SendGrid, etc.)
  // This is a placeholder for the actual email implementation
  console.log(`
    📧 EMAIL CONTENT:
    To: ${customerEmail}
    Subject: Thank you for your monthly donation to WrestleBet!
    
    Hi ${customerName},
    
    Thank you for your monthly donation of $${amount} to WrestleBet!
    
    Your subscription is active and your next payment will be processed on ${nextPaymentDate.toLocaleDateString()}.
    
    Subscription ID: ${subscriptionId}
    Invoice ID: ${invoiceId}
    
    You can manage your subscription anytime in your account dashboard.
    
    Thank you for supporting WrestleBet!
    
    Best regards,
    The WrestleBet Team
  `);
}

async function sendSubscriptionPaymentFailedEmail({ customerEmail, customerName, amount, invoiceId }) {
  console.log(`📧 Sending payment failed email to ${customerEmail}`);
  
  console.log(`
    📧 EMAIL CONTENT:
    To: ${customerEmail}
    Subject: Payment Issue with Your WrestleBet Subscription
    
    Hi ${customerName},
    
    We had trouble processing your monthly donation of $${amount} for your WrestleBet subscription.
    
    Please update your payment method to continue supporting WrestleBet.
    
    Invoice ID: ${invoiceId}
    
    You can update your payment method in your account dashboard.
    
    If you need help, please contact our support team.
    
    Best regards,
    The WrestleBet Team
  `);
}

async function sendSubscriptionCancelledEmail({ customerEmail, customerName, subscriptionId }) {
  console.log(`📧 Sending cancellation email to ${customerEmail}`);
  
  console.log(`
    📧 EMAIL CONTENT:
    To: ${customerEmail}
    Subject: Your WrestleBet Subscription Has Been Cancelled
    
    Hi ${customerName},
    
    We've confirmed the cancellation of your monthly WrestleBet subscription.
    
    Your subscription (${subscriptionId}) will remain active until the end of your current billing period.
    
    Thank you for your previous support of WrestleBet. You can always restart your subscription anytime.
    
    Best regards,
    The WrestleBet Team
  `);
}
