import React, { useEffect, useState } from "react";
import { deleteUser, getAllUsers } from "../../../services/admin/UsersManagement";
import { useNavigate } from "react-router-dom";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const navigator = useNavigate();

  useEffect(() => {
    const getAllUsersForAdmin = async () => {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    };

    getAllUsersForAdmin();
  }, []);

  const addUserForAdmin = () => {
    navigator('/admin/user/add');
  };

  const deleteUserForAdmin = async (id) => {
    await deleteUser(id);
    // Refresh the user list after deletion
    setUsers(users.filter(user => user._id !== id));
  };

  const updateUserForAdmin = (id) => {
    navigator('/admin/user/update', { state: { id } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 to-black text-white p-8">
      <button
        onClick={addUserForAdmin}
        className="bg-violet-700 hover:bg-violet-600 text-white p-2 rounded-lg transition duration-200 mb-4 sm:mb-8"
      >
        Add User
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full mt-2 border border-gray-300">
          <thead>
            <tr className="bg-gradient-to-r from-violet-800 to-black text-gray-100">
              <th className="border border-gray-300 p-2 bg-black">Name</th>
              <th className="border border-gray-300 p-2 bg-black">Email</th>
              <th className="border border-gray-300 p-2 bg-black">Favorite Genre</th>
              <th className="border border-gray-300 p-2 bg-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-gray-300">
                <td className="border border-gray-300 p-2 text-center">{user.name}</td>
                <td className="border border-gray-300 p-2 text-center">{user.email}</td>
                <td className="border border-gray-300 p-2 text-center">
                  {user.userPreferences?.favoriteGenre?.length ? user.userPreferences.favoriteGenre.join(", ") : 'N/A'}
                </td>
                <td className="border border-gray-300 p-2 flex justify-evenly">
                  <button
                    onClick={() => updateUserForAdmin(user._id)}
                    className="bg-violet-700 hover:bg-violet-600 text-white px-2 py-1 rounded-lg transition duration-200 mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => deleteUserForAdmin(user._id)}
                    className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg transition duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
