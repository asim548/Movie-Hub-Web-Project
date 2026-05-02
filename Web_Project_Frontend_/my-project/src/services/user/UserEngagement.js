import axios from "axios";
import { getAuthToken } from "../GetCookieValues";

const BACKEND_URL = "http://localhost:3213";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

export const getUserProfile = async () => {
  const response = await axios.get(`${BACKEND_URL}/user/profile`, authConfig());
  return response.data;
};

export const getUserWishlist = async (userId) => {
  const response = await axios.get(`${BACKEND_URL}/user/wishlist/${userId}`, authConfig());
  return response.data || [];
};

export const addMovieToWishlist = async (movieId) => {
  const profile = await getUserProfile();
  const current = Array.isArray(profile.moviesWishlist) ? profile.moviesWishlist : [];
  const ids = current.map((m) => (typeof m === "string" ? m : m._id));
  if (!ids.includes(movieId)) ids.push(movieId);
  const response = await axios.put(
    `${BACKEND_URL}/user/update`,
    { _id: profile._id, moviesWishlist: ids },
    authConfig()
  );
  return response.data;
};

export const removeMovieFromWishlist = async (movieId) => {
  const profile = await getUserProfile();
  const current = Array.isArray(profile.moviesWishlist) ? profile.moviesWishlist : [];
  const ids = current
    .map((m) => (typeof m === "string" ? m : m._id))
    .filter((id) => id !== movieId);
  const response = await axios.put(
    `${BACKEND_URL}/user/update`,
    { _id: profile._id, moviesWishlist: ids },
    authConfig()
  );
  return response.data;
};

export const createMovieReview = async ({ userId, movieId, rating, content }) => {
  const response = await axios.post(
    `${BACKEND_URL}/reviews`,
    { user: userId, movie: movieId, rating: Number(rating), content },
    authConfig()
  );
  return response.data;
};

export const getMovieReviews = async (movieId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/reviews/movie/${movieId}`, authConfig());
    return response.data?.reviews || [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const getReviewPieGraph = async (movieId) => {
  const response = await axios.get(`${BACKEND_URL}/reviews/pie-graph/${movieId}`, {
    ...authConfig(),
    responseType: 'arraybuffer',
  });
  const blob = new Blob([response.data], { type: 'image/png' });
  return URL.createObjectURL(blob);
};

export const getReviewBarGraph = async (movieId) => {
  const response = await axios.get(`${BACKEND_URL}/reviews/bar-graph/${movieId}`, {
    ...authConfig(),
    responseType: 'arraybuffer',
  });
  const blob = new Blob([response.data], { type: 'image/png' });
  return URL.createObjectURL(blob);
};
