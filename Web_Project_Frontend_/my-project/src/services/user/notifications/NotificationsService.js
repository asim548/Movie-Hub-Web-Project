import axios from "axios";
import { getAuthToken, getLoggedInId } from "../../GetCookieValues";

const BACKEND_URL = "http://localhost:3213";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

export const getMyNotifications = async (page = 1, limit = 20) => {
  const userId = getLoggedInId();
  const response = await axios.get(`${BACKEND_URL}/notifications/${userId}?page=${page}&limit=${limit}`, authConfig());
  return response.data?.notifications || [];
};

export const getNotificationRecipients = async () => {
  const response = await axios.get(`${BACKEND_URL}/notifications/recipients/all`, authConfig());
  return response.data?.recipients || [];
};

export const deleteNotificationById = async (notificationId) => {
  const response = await axios.delete(`${BACKEND_URL}/notifications/${notificationId}`, authConfig());
  return response.data;
};

export const sendNotificationToUser = async ({ title, userId, body }) => {
  const response = await axios.post(`${BACKEND_URL}/notifications/add`, { title, userId, body }, authConfig());
  return response.data;
};
