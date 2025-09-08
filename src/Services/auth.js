import API from './api';
import { toast } from 'react-toastify';

export async function login(collegeId, password) {
  try {
    const response = await API.post('/login', { collegeId, password });

    if (response.data?.token && response.data?.profile) {
      const { token, profile } = response.data;

      // Store minimal info
      localStorage.setItem("token", token);
      localStorage.setItem("collegeId", profile.collegeId);
      localStorage.setItem("userName", profile.name || "");
      localStorage.setItem("userEmail", profile.email || "");

      // Check roles
      if (profile.roles?.length > 0) {
        if (profile.roles.length === 1) {
          const role = profile.roles[0].toLowerCase();
          localStorage.setItem("role", role);
          toast.success(`Login successful! 🎉 Welcome ${profile.name}`);
          return role; // single role
        } else {
          return { multiple: true, roles: profile.roles }; // multiple roles
        }
      } else {
        toast.info("Login successful, but no role assigned.");
        return null;
      }
    } else {
      toast.error(`Login failed: Invalid response from server`);
      return null;
    }
  } catch (error) {
    console.error("Login error:", error);
    const backendMessage = error.response?.data?.message || error.message;
    toast.error(`Login failed: ${backendMessage}`);
    return null;
  }
}

export const logout = () => localStorage.clear();

export function register(user) {
  const data = {
    collegeId: user.collegeId,
    password: user.password,
    name: user.name,
    email: user.email,
    role: user.role?.toUpperCase(),
  };
  return API.post('/register', data);
}
