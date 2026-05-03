import axios from "axios";
import { API_BASE_URL } from "../../config/apiBase.js";
import { getAuthToken, getLoggedInId } from "../GetCookieValues";

const BACKEND_URL = API_BASE_URL;
export const addSeller = async (userData) => {
    const config = {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    };
  
    try {
      const response = await axios.post(`${BACKEND_URL}/adminseller/register`, userData, config);
      return response.data; 
    } catch (error) {
      throw new Error(error.response?.data || 'Error adding user');
    }
  };

  export const getAllSeller = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    };

    try {
      const userResponse = await axios.get(BACKEND_URL + "/adminseller/sellers", config);
      return userResponse.data?.users || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch sellers");
    }
  };

  export const updateSeller = async (id, userData) => {
    const config = {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    };
  
    try {
      const response = await axios.put(`${BACKEND_URL}/adminseller/update`, { _id: id, ...userData }, config);
      return response.data; 
    } catch (error) {
      throw new Error(error.response?.data || 'Error updating user');
    }
  };

  export const deleteSeller = async (id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    };

    console.log(id);
  
    try {
      const response = await axios.delete(`${BACKEND_URL}/adminseller/delete/${id}`, config);
      return response.data; 
    } catch (error) {
      throw new Error(error.response?.data || 'Error updating user');
    }
  };

 export const getSellerDashboard = async() => {
    const config = {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    };

    console.log(getLoggedInId());

    try {
      const response = await axios.get(`${BACKEND_URL}/sellerDashboard/${getLoggedInId()}`, config);
      console.log(response.data);
      return response.data; 
    } catch (error) {
      throw new Error(error.response?.data || 'Error seller dashboard');
    }

  }