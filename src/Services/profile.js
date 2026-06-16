import API from './api';
import { withCache, clearCache } from '../utils/apiCache';

//get
export const getProfile = (collegeId, force = false) => {
    const fetchFn = () => API.get(`/profile?collegeId=${collegeId}`);
    return force ? fetchFn() : withCache(`profile_${collegeId}`, fetchFn, 300000); // 5 minutes cache
};

//update
export const updateProfile = (profileData) => {
    clearCache();
    return API.put('/profile/update', profileData);
};

//change password
export const changePassword = (oldPassword, newPassword) => {
    clearCache();
    return API.put('/profile/change-password', { oldPassword, newPassword });
};
