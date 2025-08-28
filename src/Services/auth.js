import axios from 'axios';
import API from './api'; // Import the base API configuration
import { toast } from 'react-toastify';

//login
export async function login(collegeId, password, role) {
  try{const response = await API.post('/login', {
      collegeId,
      password,
      role: role.toUpperCase(),
      });
      console.log(response);

      if (response.data && response.data.token && response.data.profile) {
        const {token, profile} = response.data;
      
        localStorage.setItem("authToken", token);
        localStorage.setItem('role', profile.role.toLowerCase());

        localStorage.setItem('userName', profile.name);
        localStorage.setItem('userEmail', profile.email);
        localStorage.setItem('role', response.data.role);

        toast.success(`Login successful! 🎉 welcome ${profile.name}`);
        return profile.role.toLowerCase(); //role for frontend routing
      } else {
        toast.error(`Login failed: Invalid Response from server`);
        return null;
      }
    } catch (error) {
      if(error.response && error.response.data && error.response.data.message){
        toast.error(`Login failed: ${error.response.data.message}`);
      } else {
        toast.error('Login failed: Network or server error');
      }
      return null;
    }
}
export const logout = () => {
  localStorage.removeItem('authTocken');
  localStorage.removeItem('role');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail')
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

//