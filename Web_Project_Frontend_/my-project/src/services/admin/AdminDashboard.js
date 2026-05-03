import axios from "axios";
import { API_BASE_URL } from "../../config/apiBase.js";
import { getAuthToken } from "../GetCookieValues";

const BACKEND_URL = API_BASE_URL;


export const getAdminDashboard = async() => {
    const config = {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      };
    
      try {
        const response = await axios.get(`${BACKEND_URL}/adminDashboard`, config);
        console.log(response.data);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data || 'Error getting Dashboard');
      }
}