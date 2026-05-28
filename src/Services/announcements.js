import API from './api';

const announcementsAPI = {
  get: (url, config) => {
    const cleanUrl = url === '/' ? '' : url;
    const path = cleanUrl.startsWith('/') ? `/announcements${cleanUrl}` : `/announcements/${cleanUrl}`;
    return API.get(path, config);
  },
  post: (url, data, config) => {
    const path = url.startsWith('/') ? `/announcements${url}` : `/announcements/${url}`;
    return API.post(path, data, config);
  },
  put: (url, data, config) => {
    const path = url.startsWith('/') ? `/announcements${url}` : `/announcements/${url}`;
    return API.put(path, data, config);
  },
  delete: (url, config) => {
    const path = url.startsWith('/') ? `/announcements${url}` : `/announcements/${url}`;
    return API.delete(path, config);
  },
  getAll: (url, config) => {
    const cleanUrl = url === '/' ? '' : url;
    const path = cleanUrl.startsWith('/') ? `/announcements${cleanUrl}` : `/announcements/${cleanUrl}`;
    return API.get(path, config);
  }
};

export const getAnnouncements = () => announcementsAPI.get('/');
export const getSectionAnnouncements = (sectionId) => announcementsAPI.get(`/section/${sectionId}`);
export const getStudentAnnouncements = (collegeId, sectionId) => announcementsAPI.get(`/student/${collegeId}/section/${sectionId}`);
export const createAnnouncement = (data) => announcementsAPI.post('/add', data);
export const deleteAnnouncement = (id) => announcementsAPI.delete(`/${id}`);
export const updateAnnouncement = (id, data) => announcementsAPI.put(`/${id}`, data);

// ─── Quick-Connect Messaging ─────────────────────────────────────────────────
export const sendFacultyMessage = (data) => announcementsAPI.post('/message', data);
export const acknowledgeMessage = (id) => API.patch(`/announcements/${id}/ack`);
export const replyToMessage = (id, reply) => API.patch(`/announcements/${id}/reply`, { reply });
export const getStudentsInSection = (sectionId) => API.get(`/sections/${sectionId}/students`);

export default announcementsAPI;