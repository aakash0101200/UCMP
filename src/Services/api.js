import axios from 'axios';

// Base URL for the API
const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


/**
 * Manually sets the authorization header for the API instance.
 * @param {string | null} token The JWT token to set, or null to remove it.
 */
export const setAuthHeader = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

// Automatically attach token if available on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;