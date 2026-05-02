import React, { useState, useEffect } from 'react';
import { updateUser } from '../../../services/admin/UsersManagement';
import { useLocation, useNavigate } from 'react-router-dom';

function UserUpdate() {
  const location = useLocation();
  const userId = location.state.id || {}; // Safely access id
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [genre, setGenre] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    // You can add a fetch function here to prepopulate the form with the current user data
    console.log(location);
    console.log(userId);
    // Example: Fetch user data by userId and set it to state
    // fetchUserData(userId).then(data => {
    //   setName(data.name);
    //   setGenre(data.userPreferences.genre);
    // });
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !password || genre.length === 0) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const userData = { name, password, userPreferences: { genre } };
      await updateUser(userId, userData);
      setSuccess('User updated successfully!');
      setName('');
      setPassword('');
      setGenre([]);
      nav('/admin/userManagement');
    } catch (err) {
      setError('Error updating user: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-900 to-black py-8">
      <div className="bg-black p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-violet-200 text-center">Update User</h2>
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

          <div>
            <label htmlFor="genre" className="text-gray-200">Genre</label>
            <select
              id="genre"
              multiple
              className="w-full px-4 py-2 mt-2 bg-violet-900 text-gray-200 border border-gray-600 rounded-lg"
              value={genre}
              onChange={(e) => setGenre(Array.from(e.target.selectedOptions, option => option.value))}
            >
              <option value="Action">Action</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg mt-4 transition duration-200"
          >
            Update User
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserUpdate;
