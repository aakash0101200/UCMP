import API from './api'

//get
export const getProfile = (collegeId) => {
    // Corrected to use the authenticated API instance
    return API.get(`/profile?collegeId=${collegeId}`); 
};

//update
export const updateProfile = (profileData) => {
    return API.put('/profile/update', profileData);
};

//change password
export const changePassword = (oldPassword, newPassword) => {
    return API.put('/profile/change-password', { oldPassword, newPassword });
};