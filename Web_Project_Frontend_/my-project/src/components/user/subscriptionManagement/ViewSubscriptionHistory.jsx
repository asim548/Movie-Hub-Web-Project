import React, { useEffect, useState } from 'react';
import { getAllSubscriptionForUsers } from '../../../services/subscription/SubscriptionManagement';
import { getLoggedInId } from '../../../services/GetCookieValues';

function ViewSubscriptionHistory() {
    const [subscriptionHistory, setSubscriptionHistory] = useState([]);

    useEffect(() => {
        const fetchSubscriptionHistory = async () => {
            try {
                const subHistory = await getAllSubscriptionForUsers(getLoggedInId());
                setSubscriptionHistory(subHistory);
            } catch (error) {
                console.error('Error fetching subscription history:', error);
            }
        };

        fetchSubscriptionHistory();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-900 to-black text-white py-10 px-4 md:px-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-8 text-center">
                Subscription History
            </h1>

            {subscriptionHistory.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="table-auto w-full bg-gradient-to-b from-violet-800 to-black text-white rounded-lg shadow-lg">
                        <thead>
                            <tr className="bg-gradient-to-r from-violet-800 to-black text-gray-100">
                                <th className="border border-gray-300 p-2">
                                    Plan Name
                                </th>
                                <th className="border border-gray-300 p-2">
                                    Start Date
                                </th>
                                <th className="border border-gray-300 p-2">
                                    End Date
                                </th>
                                <th className="border border-gray-300 p-2">
                                    Status
                                </th>
                                <th className="border border-gray-300 p-2">
                                    Payment ID
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionHistory.map((subscription, index) => (
                                <tr
                                    key={index}
                                    className={`border-t ${
                                        subscription.status === 'Active'
                                            ? 'bg-violet-600'
                                            : 'bg-gray-800'
                                    }`}
                                >
                                    <td className="border border-gray-300 p-2 text-center">
                                        {subscription.planId.name || 'N/A'}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center">
                                        {new Date(subscription.startDate).toLocaleDateString()}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center">
                                        {new Date(subscription.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                subscription.status === 'Active'
                                                    ? 'bg-green-400 text-black'
                                                    : 'bg-red-400 text-black'
                                            }`}
                                        >
                                            {subscription.status}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center">
                                        {subscription.paymentId || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-300 text-center mt-8">
                    No subscription history available.
                </p>
            )}
        </div>
    );
}

export default ViewSubscriptionHistory;
