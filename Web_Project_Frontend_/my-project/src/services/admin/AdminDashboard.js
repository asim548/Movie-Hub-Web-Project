import axios from "axios";
import { getAuthToken } from "../GetCookieValues";

const BACKEND_URL = "http://localhost:3213";


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