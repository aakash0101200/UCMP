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
