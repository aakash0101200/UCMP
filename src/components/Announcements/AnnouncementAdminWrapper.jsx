import React, { useEffect, useState } from 'react';

import API from '../../Services/announcements.jsx'

import AnnouncementAdmin from './AnnouncementAdmin';

const AnnouncementAdminWrapper = ()  => {
  const [announcements , setAnnouncements] =useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


 // Function to fetch all announcements from the backend
  const fetchAnnouncements = async () => {
    try {
      const response = await API.getAll('/');
      setAnnouncements(response.data); // Update state with data from API
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      alert("Could not load announcements. Please check the connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load announcements on first render
  useEffect(() => {
    fetchAnnouncements();
  }, []); // The empty array [] ensures this runs only once on mount

  if(isLoading) {return <div>Loading announcements...</div>;}
  if(error) {return <div style={{color: 'red'}}>{error}</div>;}
  
  

  return (
    <AnnouncementAdmin announcements ={announcements} onAnnouncementsChange = {setAnnouncements} />
  );

}
  export default AnnouncementAdminWrapper;