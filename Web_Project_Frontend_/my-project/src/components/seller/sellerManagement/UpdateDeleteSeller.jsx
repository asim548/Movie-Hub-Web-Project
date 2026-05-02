import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoggedInId } from '../../../services/GetCookieValues';
import { updateSeller } from '../../../services/seller/SellerManagement';

function UpdateDeleteSeller() {
    const id = getLoggedInId(); 

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !password) {
            setError('Please fill out all fields.');
            return;
        }

        try {
            const updateData = { name, password };
            await updateSeller(id, updateData);
            setSuccess('Seller updated successfully!');
            setName('');
            setPassword('');
            nav('/admin/sellerManagement');
        } catch (err) {
            setError('Error updating seller: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-900 to-black py-8">
            <div className="bg-black p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl">
                <h2 className="text-2xl font-bold text-violet-200 text-center">Update Seller</h2>
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
                        <label htmlFor="password" className="text-gray-200">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-2 mt-2 bg-violet-900 text-gray-200 border border-gray-600 rounded-lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg mt-4 transition duration-200"
                    >
                        Update Seller
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UpdateDeleteSeller;
