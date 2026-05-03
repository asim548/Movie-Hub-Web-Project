import axios from "axios";
import { API_BASE_URL } from "../../config/apiBase.js";
import { getAuthToken } from "../GetCookieValues";

const BACKEND_URL = API_BASE_URL;

export const processPayment = async (paymentData) => {
  const config = {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  };

  try {
    const response = await axios.post(`${BACKEND_URL}/subscriptions/process-payment`, paymentData, config);
    
    console.log(response)
    return response.data; 
  } catch (error) {
    throw new Error(error.response?.data || "Error processing payment");
  }
};


export const addSubscription = async (userData) => {
    const config = {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    };
  
    try {
      const response = await axios.post(`${BACKEND_URL}/plans`, userData, config);
      return response.data; // Returns the newly created user object
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.error || 'Error adding Subscription');
    }
  };
  export const getAllSubscription = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    };
  
    try {
      const userResponse = await axios.get(BACKEND_URL + "/plans", config);
      return userResponse.data.plans || [];
    } catch (error) {
      if (error.response?.status === 404) return [];
      throw new Error(error.response?.data?.message || error.response?.data?.error || 'Error fetching subscriptions');
    }
  };



  export const deleteSubscription = async (id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        
      },
     
    };

    console.log(id);
  
    try {
      const response = await axios.delete(`${BACKEND_URL}/plans/${id}`, config);
      return response.data; 
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.error || 'Error Deleting Subscription');
    }
  };


  export const updateSubscription = async (id, data) => {
    
    console.log(id)
    const config = {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      };

    try {
      const response = await axios.put(`${BACKEND_URL}/plans/${id}`, data, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.error || 'Error updating subscription');
    }
};

export const getAllSubscriptionForUsers = async (id) => {
  
  const config = {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  };

const response = await axios.get(`${BACKEND_URL}/subscriptions/${id}`, config);
console.log(response.data)
return response.data;
}