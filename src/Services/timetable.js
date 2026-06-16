import API from './api';
import { withCache, clearCache } from '../utils/apiCache';

// ─── Timetable Queries ──────────────────────────────────
export const getSectionSchedule = (sectionId, term, force = false) => {
  const fetchFn = () => API.get(`/timetable/section/${sectionId}`, { params: { term } });
  return force ? fetchFn() : withCache(`section_schedule_${sectionId}_${term}`, fetchFn, 60000); // 1 min cache
};

export const getFacultySchedule = (facultyId, term, force = false) => {
  const fetchFn = () => API.get(`/timetable/faculty/${facultyId}`, { params: { term } });
  return force ? fetchFn() : withCache(`faculty_schedule_${facultyId}_${term}`, fetchFn, 60000); // 1 min cache
};

export const getRoomSchedule = (roomId, term, force = false) => {
  const fetchFn = () => API.get(`/timetable/room/${roomId}`, { params: { term } });
  return force ? fetchFn() : withCache(`room_schedule_${roomId}_${term}`, fetchFn, 60000); // 1 min cache
};

// ─── Timetable CRUD (Admin) ─────────────────────────────
export const createTimetableEntry = (data) => {
  clearCache();
  return API.post('/timetable/entry', data);
};

export const updateTimetableEntry = (id, data) => {
  clearCache();
  return API.put(`/timetable/entry/${id}`, data);
};

export const deleteTimetableEntry = (id) => {
  clearCache();
  return API.delete(`/timetable/entry/${id}`);
};

export const validateTimetableEntry = (data) =>
  API.post('/timetable/validate', data);

// ─── Subject Assignments (Admin) ────────────────────────
export const createAssignment = (data) => {
  clearCache();
  return API.post('/timetable/assignment', data);
};

export const getAssignments = (term, force = false) => {
  const fetchFn = () => API.get('/timetable/assignment', { params: { term } });
  return force ? fetchFn() : withCache(`assignments_${term}`, fetchFn, 60000);
};

export const deleteAssignment = (id) => {
  clearCache();
  return API.delete(`/timetable/assignment/${id}`);
};

export const setClassroomLink = (assignmentId, link) => {
  clearCache();
  return API.patch(`/timetable/assignment/${assignmentId}/classroom-link`, { link });
};

export const getMyFacultyAssignments = (term, force = false) => {
  const fetchFn = () => API.get('/timetable/assignment/my', { params: { term } });
  return force ? fetchFn() : withCache(`faculty_assignments_${term}`, fetchFn, 60000);
};

export const getAssignmentsForSection = (sectionId, term, force = false) => {
  const fetchFn = () => API.get(`/timetable/assignment/section/${sectionId}`, { params: { term } });
  return force ? fetchFn() : withCache(`assignments_section_${sectionId}_${term}`, fetchFn, 60000); // 1 min cache
};

// ─── Rooms ──────────────────────────────────────────────
export const getAllRooms = () => API.get('/rooms');
export const getAvailableRooms = () => API.get('/rooms/available');
export const createRoom = (data) => {
  clearCache();
  return API.post('/rooms', data);
};
export const updateRoom = (id, data) => {
  clearCache();
  return API.put(`/rooms/${id}`, data);
};
export const deleteRoom = (id) => {
  clearCache();
  return API.delete(`/rooms/${id}`);
};

// ─── Subjects ───────────────────────────────────────────
export const getAllSubjects = () => API.get('/subjects');

// ─── Sections & Faculties ────────────────────────────────
export const getAllSections = () => API.get('/sections');
export const getAllFaculties = () => API.get('/faculty');

// ─── Class Cancellations ─────────────────────────────────
export const cancelClass = (entryId, data) => {
  clearCache();
  return API.post(`/timetable/entries/${entryId}/cancel`, data);
};

// ─── AOCS Overrides & Resolved Schedules ──────────────────
export const getResolvedSectionSchedule = (sectionId, date, term, force = false) => {
  const fetchFn = () => API.get(`/timetable/section/${sectionId}/resolved`, { params: { date, term } });
  return force ? fetchFn() : withCache(`resolved_schedule_${sectionId}_${date}_${term}`, fetchFn, 60000); // 1 min cache
};

export const getResolvedFacultySchedule = (facultyId, date, term, force = false) => {
  const fetchFn = () => API.get(`/timetable/faculty/${facultyId}/resolved`, { params: { date, term } });
  return force ? fetchFn() : withCache(`resolved_faculty_${facultyId}_${date}_${term}`, fetchFn, 60000); // 1 min cache
};

export const getFacultyAvailability = (date, startTime, endTime, subjectId, term) =>
  API.get('/timetable/availability', { params: { date, startTime, endTime, subjectId, term } });

export const createOverride = (data) => {
  clearCache();
  return API.post('/timetable/override', data);
};

export const cancelOverride = (id) => {
  clearCache();
  return API.delete(`/timetable/override/${id}`);
};

export const getAocsMetrics = (term, force = false) => {
  const fetchFn = () => API.get('/timetable/metrics', { params: { term } });
  return force ? fetchFn() : withCache(`aocs_metrics_${term}`, fetchFn, 60000);
};

export const getAcademicTerms = (force = false) => {
  const fetchFn = () => API.get('/timetable/terms');
  return force ? fetchFn() : withCache('academic_terms', fetchFn, 3600000); // 1 hour cache
};



