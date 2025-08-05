import API from './api';

export async function fetchMonthlyEvents(year, month) {
  try {
    const response = await API.get('/events/monthly', {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly events:", error);
    throw error;
  }
}
