import axios from 'axios';


//Base URL for the API
const API = axios.create({
  baseURL: 'http://localhost:8081/api/auth', //backend path for authentication
  headers: {
    'Content-Type': 'application/json',
  }
});

//Automatically attach token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;