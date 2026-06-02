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

export const setClassroomLink = (assignmentId, link) =>
  API.patch(`/timetable/assignment/${assignmentId}/classroom-link`, { link });

export const getMyFacultyAssignments = (term) =>
  API.get('/timetable/assignment/my', { params: { term } });

export const getAssignmentsForSection = (sectionId, term) =>
  API.get(`/timetable/assignment/section/${sectionId}`, { params: { term } });

// ─── Rooms ──────────────────────────────────────────────
export const getAllRooms = () => API.get('/rooms');
export const getAvailableRooms = () => API.get('/rooms/available');
export const createRoom = (data) => API.post('/rooms', data);
export const updateRoom = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);

// ─── Subjects ───────────────────────────────────────────
export const getAllSubjects = () => API.get('/subjects');

// ─── Sections & Faculties ────────────────────────────────
export const getAllSections = () => API.get('/sections');
export const getAllFaculties = () => API.get('/faculty');

// ─── Class Cancellations ─────────────────────────────────
export const cancelClass = (entryId, data) =>
  API.post(`/timetable/entries/${entryId}/cancel`, data);

// ─── AOCS Overrides & Resolved Schedules ──────────────────
export const getResolvedSectionSchedule = (sectionId, date, term) =>
  API.get(`/timetable/section/${sectionId}/resolved`, { params: { date, term } });

export const getResolvedFacultySchedule = (facultyId, date, term) =>
  API.get(`/timetable/faculty/${facultyId}/resolved`, { params: { date, term } });

export const getFacultyAvailability = (date, startTime, endTime, subjectId, term) =>
  API.get('/timetable/availability', { params: { date, startTime, endTime, subjectId, term } });

export const createOverride = (data) =>
  API.post('/timetable/override', data);

export const cancelOverride = (id) =>
  API.delete(`/timetable/override/${id}`);

export const getAocsMetrics = (term) =>
  API.get('/timetable/metrics', { params: { term } });

export const getAcademicTerms = () =>
  API.get('/timetable/terms');


