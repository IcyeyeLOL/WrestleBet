'use client';

import StripeTestComponent from '../components/StripeTestComponent';
import Link from 'next/link';

export default function StripeTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Stripe Integration Test Page
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Test Stripe Integration</h2>
            <StripeTestComponent />
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-600">
            <h2 className="text-xl font-semibold text-white mb-4">Setup Instructions</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="p-3 bg-slate-700 rounded">
                <h3 className="text-yellow-400 font-semibold mb-1">1. Get Stripe Keys</h3>
                <p>Visit <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="text-blue-400 underline">Stripe Dashboard</a></p>
                <p>Copy your publishable and secret keys</p>
              </div>
              
              <div className="p-3 bg-slate-700 rounded">
                <h3 className="text-yellow-400 font-semibold mb-1">2. Update Environment</h3>
                <p>Add keys to your .env.local file:</p>
                <code className="text-xs text-green-400 block mt-1">
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
                </code>
              </div>
              
              <div className="p-3 bg-slate-700 rounded">
                <h3 className="text-yellow-400 font-semibold mb-1">3. Test Card Numbers</h3>
                <p><strong>Success:</strong> 4242 4242 4242 4242</p>
                <p><strong>Decline:</strong> 4000 0000 0000 0002</p>
                <p><strong>CVC:</strong> Any 3 digits</p>
                <p><strong>Date:</strong> Any future date</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Back to App
          </Link>
        </div>
      </div>
    </div>
  );
}
