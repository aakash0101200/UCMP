import API from './api';

/**
 * Fetches the master list of all academic batches.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getAllBatches = () => API.get('/batches');

/**
 * Fetches all registered users for administrative tracking.
 */
export const getAllUsers = () => API.get('/admin/users');

/**
 * Resets a user's password to role-based default.
 */
export const resetUserPassword = (collegeId) => API.put(`/admin/users/${collegeId}/reset-password`);

/**
 * Reassigns a student to a section.
 */
export const updateStudentSection = (collegeId, sectionId) => API.put(`/admin/users/${collegeId}/student-section`, { sectionId });

/**
 * Reassigns faculty member's section list.
 */
export const updateFacultySections = (collegeId, sectionIds) => API.put(`/admin/users/${collegeId}/faculty-sections`, { sectionIds });

/**
 * Deletes a user by college ID.
 */
export const deleteUser = (collegeId) => API.delete(`/admin/users/${collegeId}`);

/**
 * Lazy loading mindmap endpoints
 */
export const getDepartments = () => API.get('/admin/users/departments');
export const getDepartmentSections = (deptName) => API.get(`/admin/users/departments/${encodeURIComponent(deptName)}/sections`);
export const getDepartmentFaculty = (deptName, page = 0, size = 30) => API.get(`/admin/users/departments/${encodeURIComponent(deptName)}/faculty?page=${page}&size=${size}`);
export const getSectionStudents = (sectionId, page = 0, size = 30) => API.get(`/admin/users/sections/${sectionId}/students?page=${page}&size=${size}`);
