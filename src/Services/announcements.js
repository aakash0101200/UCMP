import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8081/api/announcements', //backend path for announcements
  headers: {
    'Content-Type': 'application/json',
  }
});

export const getAnnouncements = () => API.get('/');
export const getSectionAnnouncements = (sectionId) => API.get(`/section/${sectionId}`);
export const getStudentAnnouncements = (collegeId, sectionId) => API.get(`/student/${collegeId}/section/${sectionId}`);
export const createAnnouncement = (data) => API.post('/add', data);
export const deleteAnnouncement = (id) => API.delete(`/${id}`);
export const updateAnnouncement = (id, data) => API.put(`/${id}`, data);

export default API;