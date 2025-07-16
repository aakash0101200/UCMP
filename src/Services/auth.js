import axios from 'axios';
import API from './api'; // Import the base API configuration

// // Rregister 

// export function register(user) {
//     return API.post('/register', user);
// }



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
    return API.post('/register', user);
} 