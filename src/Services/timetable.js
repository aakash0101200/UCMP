import API from './api';

// ─── Timetable Queries ──────────────────────────────────
export const getSectionSchedule = (sectionId, term) =>
  API.get(`/timetable/section/${sectionId}`, { params: { term } });

export const getFacultySchedule = (facultyId, term) =>
  API.get(`/timetable/faculty/${facultyId}`, { params: { term } });

export const getRoomSchedule = (roomId, term) =>
  API.get(`/timetable/room/${roomId}`, { params: { term } });

// ─── Timetable CRUD (Admin) ─────────────────────────────
export const createTimetableEntry = (data) =>
  API.post('/timetable/entry', data);

export const updateTimetableEntry = (id, data) =>
  API.put(`/timetable/entry/${id}`, data);

export const deleteTimetableEntry = (id) =>
  API.delete(`/timetable/entry/${id}`);

export const validateTimetableEntry = (data) =>
  API.post('/timetable/validate', data);

// ─── Subject Assignments (Admin) ────────────────────────
export const createAssignment = (data) =>
  API.post('/timetable/assignment', data);

export const getAssignments = (term) =>
  API.get('/timetable/assignment', { params: { term } });

export const deleteAssignment = (id) =>
  API.delete(`/timetable/assignment/${id}`);

// ─── Rooms ──────────────────────────────────────────────
export const getAllRooms = () => API.get('/rooms');
export const getAvailableRooms = () => API.get('/rooms/available');

// ─── Subjects ───────────────────────────────────────────
export const getAllSubjects = () => API.get('/subjects');

// ─── Sections & Faculties ────────────────────────────────
export const getAllSections = () => API.get('/sections');
export const getAllFaculties = () => API.get('/faculty');

// ─── Class Cancellations ─────────────────────────────────
export const cancelClass = (entryId, data) =>
  API.post(`/timetable/entries/${entryId}/cancel`, data);

