import API from './api';
import { withCache, clearCache } from '../utils/apiCache';

export const getAttendanceSummary  = (force = false)  => {
  const fetchFn = () => API.get('/attendance/my-summary');
  return force ? fetchFn() : withCache('attendance_summary', fetchFn, 30000); // 30s cache
};

export const getAttendanceHistory  = (force = false)  => {
  const fetchFn = () => API.get('/attendance/my-history');
  return force ? fetchFn() : withCache('attendance_history', fetchFn, 30000); // 30s cache
};

export const getActiveSession      = ()  => API.get('/attendance/active-session', { headers: { 'Cache-Control': 'no-cache' } });

export const markAttendance        = (data) => {
  clearCache();
  return API.post('/attendance/mark', data);
};

