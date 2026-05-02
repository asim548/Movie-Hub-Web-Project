import axios from "axios";
import { getAuthToken, getLoggedInId, getUserRole } from "../GetCookieValues";

const BACKEND_URL = "http://localhost:3213";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

const getProfileCacheKey = () => {
  const userId = getLoggedInId();
  return userId ? `moviehub_profile_${userId}` : null;
};

export const getCachedProfile = () => {
  const cacheKey = getProfileCacheKey();
  if (!cacheKey) return null;
  try {
    const raw = localStorage.getItem(cacheKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const cacheProfile = (profile) => {
  const cacheKey = getProfileCacheKey();
  if (!cacheKey || !profile) return;
  const sanitized = {
    name: profile.name || "",
    email: profile.email || "",
    photo: profile.photo || "",
    themeMode: profile.themeMode || "dark",
  };
  localStorage.setItem(cacheKey, JSON.stringify(sanitized));
};

export const applyThemeMode = (themeMode = "dark") => {
  document.documentElement.setAttribute("data-theme", themeMode);
  localStorage.setItem("themeMode", themeMode);
};

export const loadThemeMode = () => {
  const localTheme = localStorage.getItem("themeMode");
  const themeMode = localTheme || "dark";
  applyThemeMode(themeMode);
  return themeMode;
};

export const getCurrentProfile = async () => {
  const role = getUserRole();
  const config = authConfig();

  try {
    if (role === "user") {
      const response = await axios.get(`${BACKEND_URL}/user/profile`, config);
      cacheProfile(response.data);
      return response.data;
    }

    const response = await axios.get(`${BACKEND_URL}/adminseller/profile`, config);
    cacheProfile(response.data.user);
    return response.data.user;
  } catch (error) {
    const cached = getCachedProfile();
    if (cached) return cached;
    throw error;
  }
};

export const updateCurrentProfile = async (profileData) => {
  const role = getUserRole();
  const id = getLoggedInId();
  const config = authConfig();
  const payload = { _id: id, ...profileData };

  try {
    if (role === "user") {
      const response = await axios.put(`${BACKEND_URL}/user/update`, payload, config);
      cacheProfile(response.data);
      return response.data;
    }

    const response = await axios.put(`${BACKEND_URL}/adminseller/update`, payload, config);
    cacheProfile(response.data);
    return response.data;
  } catch (error) {
    const apiMessage =
      error?.response?.data?.message ||
      (typeof error?.response?.data === "string" ? error.response.data : "");

    if (error?.response?.status === 413) {
      throw new Error("Image is too large. Please upload a smaller image.");
    }

    throw new Error(apiMessage || "Profile update failed.");
  }
};
