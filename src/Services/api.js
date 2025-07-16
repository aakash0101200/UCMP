import axios from 'axios';


//Base URL for the API
const API = axios.create({
  baseURL: 'http://localhost:8081/api/auth', //backend path for authentication
  headers: {
    'Content-Type': 'application/json',
  }
});

export default API;