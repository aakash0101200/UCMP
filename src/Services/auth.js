import axios from 'axios';
import API from './api'; // Import the base API configuration


//login
export async function login(collegeId, password, role) {
  const response = await API.post('/login', {
    collegeId,
    password,
    role: role.toUpperCase(),
  });

  // Save token in localStorage
  if (response.data && response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response;
}

export function register(user) {
    const data = {
        collegeId: user.collegeId,
        password: user.password,
        name: user.name,
        email: user.email,
        role: user.role?.toUpperCase()
    };
    return API.post('/register', user);
} 