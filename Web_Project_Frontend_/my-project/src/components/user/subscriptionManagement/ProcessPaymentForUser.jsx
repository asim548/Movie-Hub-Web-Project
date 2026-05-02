import React from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function ProcessPaymentForUser() {
  const location = useLocation();
  const { subscription } = location.state || {};

  if (!subscription) {
    return <div className="text-white text-center mt-10 text-lg">No subscription selected!</div>;
  }

  if (subscription.price > 0 && !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="mh-page text-white px-6 py-10">
        <div className="mh-container">
          <div className="mh-surface max-w-xl mx-auto text-center space-y-3">
            <h1 className="text-2xl font-bold">Stripe not configured</h1>
            <p className="text-gray-300">
              Add `VITE_STRIPE_PUBLISHABLE_KEY` in the frontend environment to enable paid subscriptions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 to-black text-white p-8">
      <h1 className="text-3xl mb-8 font-semibold text-center">Complete Your Payment</h1>
      <div className="max-w-lg mx-auto p-6 bg-violet-800 rounded-lg shadow-lg">
        <h2 className="text-xl mb-4">Subscription: {subscription.name}</h2>
        <p className="mb-4">Price: <span className="font-bold">Rs {subscription.price}</span></p>
        <Elements stripe={stripePromise}>
          <CheckoutForm subscription={subscription} />
        </Elements>
      </div>
    </div>
  );
}

export default ProcessPaymentForUser;
