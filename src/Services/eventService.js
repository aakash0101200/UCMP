// src/services/eventService.js

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8081/api', // Update if needed
});

export const getEvents = async (view, date, course) => {
  const response = await API.get(`/events`, {
    params: {
      view,
      date,
      course,
    },
  });
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await API.post('/events', eventData);
  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const response = await API.put(`/events/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await API.delete(`/events/${id}`);
  return response.data;
};
