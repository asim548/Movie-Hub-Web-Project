import axios from "axios";
import { getAuthToken } from "../GetCookieValues";

const BACKEND_URL = "http://localhost:3213";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

export const getPersons = async (page = 1, limit = 50) => {
  const response = await axios.get(`${BACKEND_URL}/persons?page=${page}&limit=${limit}`, authConfig());
  return response.data?.data || [];
};

export const addPerson = async (payload) => {
  const response = await axios.post(`${BACKEND_URL}/persons`, payload, authConfig());
  return response.data?.data;
};

export const updatePerson = async (id, payload) => {
  const response = await axios.put(`${BACKEND_URL}/persons/${id}`, payload, authConfig());
  return response.data?.data;
};

export const deletePerson = async (id) => {
  const response = await axios.delete(`${BACKEND_URL}/persons/${id}`, authConfig());
  return response.data;
};
