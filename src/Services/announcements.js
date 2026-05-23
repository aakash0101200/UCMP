import API from './api';

export const getAnnouncements = () => API.get('/announcements');
export const getSectionAnnouncements = (sectionId) => API.get(`/announcements/section/${sectionId}`);
export const getStudentAnnouncements = (collegeId, sectionId) => API.get(`/announcements/student/${collegeId}/section/${sectionId}`);
export const createAnnouncement = (data) => API.post('/announcements/add', data);
export const deleteAnnouncement = (id) => API.delete(`/announcements/${id}`);
export const updateAnnouncement = (id, data) => API.put(`/announcements/${id}`, data);

export default API;