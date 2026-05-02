import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSubscription } from '../../../services/subscription/SubscriptionManagement';

function AddSubscription() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [description, setDescription] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const nav = useNavigate();
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
  
        if (!name || !price || !duration || !description) {
            setError('Please fill out all fields.');
            return;
        }

        if (Number(price) < 0 || Number(duration) <= 0) {
            setError('Price cannot be negative and duration must be greater than 0.');
            return;
        }
  
        try {
            const subscriptionData = { name, price: Number(price), duration: Number(duration), description };
            await addSubscription(subscriptionData);
            setSuccess('Subscription added successfully!');
            setName('');
            setPrice('');
            setDuration('');
            setDescription('');
            nav('/admin/subscriptionManagement');
        } catch (err) {
            setError('Error adding subscription: ' + err.message);
        }
    };
  
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-900 to-black py-8">
            <div className="bg-black p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-violet-200 text-center">Add Subscription</h2>
                    <button
                        type="button"
                        onClick={() => nav('/admin/subscriptionManagement')}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                        Back
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && <div className="text-red-500">{error}</div>}
                    {success && <div className="text-green-500">{success}</div>}

                    <div>
                        <label htmlFor="name" className="text-gray-200">Name</label>
                        <input
                            type="text"
                            id="name"
                            className="w-full px-4 py-2 mt-2 bg-violet-900 text-gray-200 border border-gray-600 rounded-lg"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="price" className="text-gray-200">Price</label>
                        <input
                            type="number"
                            id="price"
                            className="w-full px-4 py-2 mt-2 bg-violet-900 text-gray-200 border border-gray-600 rounded-lg"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="duration" className="text-gray-200">Duration</label>
                        <input
                            type="number"
                            id="duration"
                            className="w-full px-4 py-2 mt-2 bg-violet-900 text-gray-200 border border-gray-600 rounded-lg"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="text-gray-200">Description</label>
                        <input
                            type="text"
                            id="description"
                            className="w-full px-4 py-2 mt-2 bg-violet-900 text-gray-200 border border-gray-600 rounded-lg"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg mt-4 transition duration-200"
                    >
                        Add Subscription
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddSubscription;
