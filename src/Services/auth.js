import axios from 'axios';
import API from './api'; // Import the base API configuration


//login
export function login(collegeId, password, role) {

    //Backend expects an object with id, password, and role
    return API.post('/login',{
        collegeId,
        password,
        role: role.toUpperCase() // Ensure role is uppercase}
    });
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