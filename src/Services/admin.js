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
