import API, { setAuthHeader } from './api';
import { toast } from 'react-toastify';

export async function login(collegeId, password) {
  try {
    const response = await API.post('/auth/login', { collegeId, password });

    if (response.data?.token && response.data?.profile) {
      const { token, profile } = response.data;
      const allRoles = profile.roles || [];
      const defaultRole = allRoles[0] || null;

      // Store all user-related data in localStorage for easy access
      localStorage.setItem("token", token);
      localStorage.setItem("collegeId", profile.collegeId);
      localStorage.setItem("userName", profile.name || "");
      localStorage.setItem("userEmail", profile.email || "");
      localStorage.setItem("allRoles", JSON.stringify(allRoles));
      localStorage.setItem("activeRole", defaultRole);

      setAuthHeader(token);

      if (defaultRole) {
        toast.success(`Login successful! 🎉 Welcome ${profile.name}`);
        return defaultRole;
      } else {
        toast.info("Login successful, but no role assigned.");
        return null;
      }
    } else {
      toast.error(`Login failed: Invalid response from server`);
      return null;
    }
  }catch (error) {
  console.error("Login error:", error); // full object
  console.error("Login error message:", error.message); // readable string
  console.error("Login error response:", error.response?.data); // backend payload

  const backendMessage = error.response?.data?.message || error.message || "Unknown error";
  toast.error(`Login failed: ${backendMessage}`);
  return null;
}
}

// Fixed logout function to selectively clear localStorage items
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("collegeId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("allRoles");
  localStorage.removeItem("activeRole");
  
  setAuthHeader(null);
  toast.info("Logged out successfully.");
};

export const getActiveRole = () => {
  return localStorage.getItem("activeRole");
};

export const getAllRoles = () => {
  const roles = localStorage.getItem("allRoles");
  return roles ? JSON.parse(roles) : [];
};

export const setActiveRole = (role) => {
  localStorage.setItem("activeRole", role);
};

export function register(user) {
  const data = {
    collegeId: user.collegeId,
    password: user.password,
    name: user.name,
    email: user.email,
    roles: user.roles?user.roles.map(r => r.toUpperCase()):[],
  };
  try{
    return API.post('/auth/register', data);
  } catch(error) {
    console.error(error.response?.data);
  }
}