import API from './api';

export const getAttendanceSummary  = ()  => API.get('/attendance/my-summary');
export const getAttendanceHistory  = ()  => API.get('/attendance/my-history');
export const getActiveSession      = ()  => API.get('/attendance/active-session', { headers: { 'Cache-Control': 'no-cache' } });
export const markAttendance        = (data) => API.post('/attendance/mark', data);
