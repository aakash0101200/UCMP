// Event utility functions for calendar operations

export const generateEventId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 16);
};

export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const isEventOverdue = (event) => {
  const now = new Date();
  const eventEnd = new Date(event.end);
  return eventEnd < now;
};

export const isEventUpcoming = (event, minutesAhead = 30) => {
  const now = new Date();
  const eventStart = new Date(event.start);
  const timeDiff = eventStart.getTime() - now.getTime();
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  return minutesDiff > 0 && minutesDiff <= minutesAhead;
};

export const getEventDuration = (event) => {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const durationMs = end.getTime() - start.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, totalMinutes: Math.floor(durationMs / (1000 * 60)) };
};

export const validateEvent = (event) => {
  const errors = [];
  
  if (!event.title || event.title.trim().length === 0) {
    errors.push('Event title is required');
  }
  
  if (!event.start) {
    errors.push('Start date and time is required');
  }
  
  if (!event.end) {
    errors.push('End date and time is required');
  }
  
  if (event.start && event.end) {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    if (startDate >= endDate) {
      errors.push('End time must be after start time');
    }
    
    if (startDate < new Date()) {
      errors.push('Event cannot be scheduled in the past');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const exportEventsToCSV = (events) => {
  const headers = ['Title', 'Start Date', 'End Date', 'Type', 'Description', 'Created By'];
  const csvContent = [
    headers.join(','),
    ...events.map(event => [
      event.title || event.text,
      new Date(event.start).toLocaleString(),
      new Date(event.end).toLocaleString(),
      event.type,
      event.description || '',
      event.createdBy || ''
    ].map(field => `"${field}"`).join(','))
  ].join('\n');
  
  return csvContent;
};