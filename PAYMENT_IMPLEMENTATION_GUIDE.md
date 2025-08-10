# Complete Payment System Implementation Guide

## Current Status
✅ **Working**: Mock UI, virtual currency system, transaction history  
❌ **Missing**: Real payment processing, persistent storage, withdrawal system

## Step-by-Step Implementation

### 1. Install Required Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

### 2. Stripe Account Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Dashboard
3. Add the keys to your .env.local file:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Database Schema (PostgreSQL/Supabase)
```sql
-- Payment methods table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  stripe_payment_method_id TEXT NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  cardholder_name TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'purchase', 'withdrawal', 'bet', 'win'
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  wc_amount INTEGER, -- WrestleCoins amount
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User balances table
CREATE TABLE user_balances (
  user_id TEXT PRIMARY KEY,
  wc_balance INTEGER DEFAULT 1000,
  cash_balance DECIMAL(10,2) DEFAULT 0.00,
  total_deposited DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Required API Routes

#### /api/payments/create-intent
- Creates Stripe payment intent for purchasing WC
- Input: packageId, userId
- Output: clientSecret for frontend payment

#### /api/payments/webhook
- Handles Stripe webhooks for successful payments
- Updates user balance when payment succeeds
- Creates transaction records

#### /api/payments/methods
- GET: List user's payment methods
- POST: Add new payment method
- DELETE: Remove payment method

#### /api/payments/withdraw
- Process withdrawal requests
- Convert WC to cash (if allowed)
- Handle payout to user's bank/card

### 5. Frontend Components Created
- ✅ `EnhancedPaymentMethods.jsx` - Complete payment method management
- ✅ `lib/stripe-config.js` - Stripe configuration
- ✅ Payment API routes

### 6. Integration Steps

1. **Update AccountPage to use EnhancedPaymentMethods**:
```jsx
import EnhancedPaymentMethods from './EnhancedPaymentMethods';

// In the payment tab:
{activeTab === 'payment' && <EnhancedPaymentMethods />}
```

2. **Update PurchaseWCModal with real Stripe integration**:
Replace the mock purchase function with actual Stripe payment processing.

3. **Connect to your database**:
Update the API routes to save/load data from your database instead of using mock data.

### 7. Security Considerations

1. **PCI Compliance**: Use Stripe Elements (already implemented)
2. **Webhook Verification**: Verify Stripe webhook signatures
3. **User Authentication**: Ensure only authenticated users can access payment methods
4. **Rate Limiting**: Add rate limiting to payment endpoints
5. **Audit Logs**: Log all payment-related activities

### 8. Testing

1. **Stripe Test Mode**: Use test keys for development
2. **Test Cards**: Use Stripe's test card numbers
   - Success: 4242 4242 4242 4242
   - Decline: 4000 0000 0000 0002
3. **Webhook Testing**: Use Stripe CLI for webhook testing

### 9. Production Deployment

1. Switch to live Stripe keys
2. Set up webhook endpoints in Stripe Dashboard
3. Enable real payment methods
4. Add SSL certificate
5. Configure proper error handling

### 10. Additional Features to Consider

1. **Subscription Plans**: For premium features
2. **Refund System**: Handle refund requests
3. **Multi-currency**: Support different currencies
4. **Withdrawal Limits**: Set daily/monthly withdrawal limits
5. **KYC/AML**: Know Your Customer compliance for larger amounts

## Current Files Status
- ✅ Mock payment UI working
- ✅ Virtual currency system functional  
- ✅ Stripe integration code ready
- ⏳ Need to install dependencies and configure Stripe
- ⏳ Need to set up database tables
- ⏳ Need to connect API routes to database

## Next Steps
1. Run `npm install` to add payment dependencies
2. Set up Stripe account and get API keys
3. Configure environment variables
4. Set up database tables
5. Test payment flow in development
6. Deploy with webhook endpoints
