import axios from "axios";
import { API_BASE_URL } from "../../config/apiBase.js";
import { getAuthToken } from "../GetCookieValues";

const BACKEND_URL = API_BASE_URL;

export const getTop10MoviesForUserDashboard = async () => {
  const config = {
      headers: {
          Authorization: `Bearer ${getAuthToken()}`,
      },
  };

  try {
      const moviesResponse = await axios.get(BACKEND_URL + "/movies", config);
      console.log(moviesResponse.data.movies);

      return moviesResponse.data.movies; // Use the direct movie data with `movieCoverPhoto` as a URL
  } catch (error) {
      console.error("Error fetching top movies:", error);
      return [];
  }
};
