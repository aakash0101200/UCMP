import axios from 'axios';


//Base URL for the API
const API = axios.create({
  baseURL: 'http://localhost:8081/api/announcements', //backend path for announcements
  headers: {
    'Content-Type': 'application/json',
  }
});

// // Define all API methods
// const announcementsAPI = {
//   getAll: () => API.get('/'),                     // GET all announcements
//   getById: (id) => API.get(`/${id}`),             // GET one by ID
//   create: (data) => API.post('/', data),          // POST new announcement
//   update: (id, data) => API.put(`/${id}`, data),  // PUT update
//   delete: (id) => API.delete(`/${id}`),           // DELETE announcement
// };

// export default announcementsAPI;

export default API;