import axios from "axios";
import { getAuthToken } from "../GetCookieValues";

const BACKEND_URL = "http://localhost:3213";

// Add User Service
export const addUser = async (userData) => {
  const config = {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  };

  try {
    const response = await axios.post(`${BACKEND_URL}/user/register`, userData, config);
    return response.data; // Returns the newly created user object
  } catch (error) {
    throw new Error(error.response?.data || 'Error adding user');
  }
};

// Fetch all users
export const getAllUsers = async () => {
  const config = {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  };

  try {
    const userResponse = await axios.get(BACKEND_URL + "/user/all", config);
    return userResponse.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

// Delete user by ID
export const deleteUser = async (id) => {
  const config = {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  };

  await axios.delete(BACKEND_URL + `/user/delete/${id}`, config);
};

export const updateUser = async (id, userData) => {
    const config = {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    };
  
    try {
      const response = await axios.put(`${BACKEND_URL}/user/update`, { _id: id, ...userData }, config);
      return response.data; 
    } catch (error) {
      throw new Error(error.response?.data || 'Error updating user');
    }
  };