import API from './api'

//get
export const getProfile = (collegeId) => {
    // Corrected to use the authenticated API instance
    return API.get(`/profile?collegeId=${collegeId}`); 
};

//update
export const updateProfile =(collegeId, profileData) => {
    return API.put(`/profile?collegeId=${collegeId}`, profileData);
};