import API from './api';
import { withCache, clearCache } from '../utils/apiCache';

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

export const getAnnouncements = (force = false) => {
  const fetchFn = () => announcementsAPI.get('/');
  return force ? fetchFn() : withCache('announcements_global', fetchFn, 30000); // 30s cache
};

export const getSectionAnnouncements = (sectionId, force = false) => {
  const fetchFn = () => announcementsAPI.get(`/section/${sectionId}`);
  return force ? fetchFn() : withCache(`announcements_section_${sectionId}`, fetchFn, 30000); // 30s cache
};

export const getStudentAnnouncements = (collegeId, sectionId, force = false) => {
  const fetchFn = () => announcementsAPI.get(`/student/${collegeId}/section/${sectionId}`);
  return force ? fetchFn() : withCache(`announcements_student_${collegeId}_${sectionId}`, fetchFn, 30000); // 30s cache
};

export const createAnnouncement = (data) => {
  clearCache();
  return announcementsAPI.post('/add', data);
};

export const deleteAnnouncement = (id) => {
  clearCache();
  return announcementsAPI.delete(`/${id}`);
};

export const updateAnnouncement = (id, data) => {
  clearCache();
  return announcementsAPI.put(`/${id}`, data);
};

// ─── Quick-Connect Messaging ─────────────────────────────────────────────────
export const sendFacultyMessage = (data) => {
  clearCache();
  return announcementsAPI.post('/message', data);
};

export const acknowledgeMessage = (id) => {
  clearCache();
  return API.patch(`/announcements/${id}/ack`);
};

export const replyToMessage = (id, reply) => {
  clearCache();
  return API.patch(`/announcements/${id}/reply`, { reply });
};

export const getStudentsInSection = (sectionId) => API.get(`/sections/${sectionId}/students`);

export default announcementsAPI;