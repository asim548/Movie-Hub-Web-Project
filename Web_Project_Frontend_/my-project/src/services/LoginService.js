import axios from "axios";
import { API_BASE_URL } from "../config/apiBase.js";

const BACKEND_URL = API_BASE_URL;
const cookieBase = 'path=/; SameSite=Lax';

const persistLogin = ({ token, id, role, isSubscribed }) => {
  document.cookie = `authToken=${token}; ${cookieBase}`;
  document.cookie = `userRole=${role}; ${cookieBase}`;
  document.cookie = `userId=${id}; ${cookieBase}`;
  document.cookie = `isSubscribed=${Boolean(isSubscribed)}; ${cookieBase}`;
};

export const loginUserSellerAdmin = async ({ email, password }) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/login/userSellerAdmin`, { email, password });
    const { token, id, role, isSubscribed } = response.data;

    persistLogin({ token, id, role, isSubscribed });

    return { success: true, data: { token, id, role, isSubscribed } };
  } catch (error) {
    const server = error.response?.data;
    const msg =
      (typeof server?.message === "string" && server.message) ||
      (typeof server?.error === "string" && server.error) ||
      error.message ||
      "Login failed";
    console.error("Login failed:", server || error.message);
    return { success: false, message: msg };
  }
};

export const loginWithGoogle = async (credential) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/google`, { token: credential });
    const { token, id, role, isSubscribed } = response.data;
    persistLogin({ token, id, role, isSubscribed });
    return { success: true, data: response.data };
  } catch (error) {
    const server = error.response?.data;
    const msg =
      (typeof server?.detail === "string" && server.detail) ||
      (typeof server?.message === "string" && server.message) ||
      (typeof server?.error === "string" && server.error) ||
      error.message ||
      "Request failed";
    console.error("Google login failed:", server || error.message);
    return { success: false, message: msg };
  }
};