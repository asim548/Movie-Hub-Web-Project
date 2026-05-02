// services/WatchHistoryService.js
import axios from "axios";
import { getAuthToken } from "../GetCookieValues";

const BACKEND_URL = "http://localhost:3213";

export const getWatchHistory = async (userId, pageNo = 1) => {
    const response = await axios.get(`${BACKEND_URL}/watch-history/${userId}?page=${pageNo}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    return response.data;
};

export const addToWatchHistory = async (userId, movieId) => {
    const response = await axios.post(`${BACKEND_URL}/watch-history`, { userId, movieId }, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    return response.data;
};

export const deleteFromWatchHistory = async (userId, movieId) => {
    const response = await axios.delete(`${BACKEND_URL}/watch-history/${userId}/${movieId}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    return response.data;
};