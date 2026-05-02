import React, { useState } from 'react';
import { addUser } from '../../../services/admin/UsersManagement';
import { useNavigate } from 'react-router-dom';

function AddUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const userData = { name, email, password };
      await addUser(userData);
      setSuccess('User added successfully!');
      setName('');
      setEmail('');
      setPassword('');
      nav('/admin/userManagement');
    } catch (err) {
      setError('Error adding user: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-900 to-black py-8">
      <div className="bg-black p-6 rounded-lg shadow-lg w-full max-w-md sm:w-11/12 md:w-9/12 lg:w-8/12">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-violet-200 text-center">Add New User</h2>
          <button
            type="button"
            onClick={() => nav('/admin/userManagement')}
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
            <label htmlFor="email" className="text-gray-200">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 mt-2 bg-violet-900 text-gray-200 border border-gray-600 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            Add User
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddUser;
