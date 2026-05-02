import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSubscription } from '../../../services/subscription/SubscriptionManagement';

function UserSubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const navigator = useNavigate();

  useEffect(() => {
    const getAllSubscriptions = async () => {
      const fetchedSubscription = await getAllSubscription();
      setSubscriptions(fetchedSubscription);
    };

    getAllSubscriptions();
  }, []);

  const navigateToCheckout = (subscription) => {
    navigator('/user/addSubscription', { state: { subscription } });
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="mh-container py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-cyan-200">
              Subscriptions
            </h1>
            <p className="text-slate-500 text-sm mt-1">Pick a plan and start streaming.</p>
          </div>
          <button
            type="button"
            onClick={() => navigator('/user/subscriptionHistory')}
            className="mh-btn-secondary px-5 py-2.5 rounded-xl shrink-0"
          >
            View history
          </button>
        </div>

        <div className="mh-table overflow-x-auto rounded-2xl">
          <table className="min-w-full">
            <thead className="mh-thead">
              <tr>
                <th className="mh-th">Name</th>
                <th className="mh-th">Price</th>
                <th className="mh-th">Duration</th>
                <th className="mh-th">Description</th>
                <th className="mh-th text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription._id} className="mh-tr bg-black/10">
                  <td className="mh-td">{subscription.name}</td>
                  <td className="mh-td">{subscription.price}</td>
                  <td className="mh-td">{subscription.duration}</td>
                  <td className="mh-td max-w-xs truncate" title={subscription.description}>{subscription.description}</td>
                  <td className="mh-td text-center">
                    <button
                      type="button"
                      onClick={() => navigateToCheckout(subscription)}
                      className="mh-btn-primary px-4 py-2 rounded-lg text-sm"
                    >
                      {Number(subscription.price) > 0 ? 'Subscribe' : 'Activate free'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserSubscriptionManagement;
