import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { processPayment } from '../../../services/subscription/SubscriptionManagement';
import { getLoggedInId } from '../../../services/GetCookieValues';

function CheckoutForm({ subscription }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        let stripeToken = null;
        if (Number(subscription.price) > 0) {
            if (!stripe || !elements) return;
            const cardElement = elements.getElement(CardElement);
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                console.error(error.message);
                return;
            }
            stripeToken = paymentMethod.id;
        }

        const paymentData = {
            stripeEmail: "user@example.com",
            stripeToken,
            amount: subscription.price,
            productName:subscription.name,
            subscriptionPlanId: subscription._id,
            userId: getLoggedInId()
        };

        const paymentResponse = await processPayment(paymentData);
        console.log(paymentResponse)
        if(paymentResponse == null)
          alert("Payment failed, Already subscribed!");
        if (paymentResponse.status === 'succeeded') {
            document.cookie = 'isSubscribed=true; path=/; SameSite=Lax';
            alert('Payment Successful!');
        } else {
            console.error('Payment failed:', paymentResponse);
        }
    } catch (error) {
        console.error('Payment processing error:', error.message);
        alert("Payment failed, Already subscribed! or Internal Server error has occurred")
    }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Number(subscription.price) > 0 ? (
        <div className="bg-gray-100 rounded-lg p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-lg p-4 text-emerald-200">
          This is a free student plan. No card details required.
        </div>
      )}
      <button
        type="submit"
        disabled={Number(subscription.price) > 0 && !stripe}
        className="w-full bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg transition duration-200 font-semibold"
      >
        {Number(subscription.price) > 0 ? `Pay Rs ${subscription.price}` : "Activate Free Plan"}
      </button>
    </form>
  );
}

export default CheckoutForm;
