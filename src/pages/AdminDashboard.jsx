import  { React, useEffect, useState } from 'react';
import initialAnnouncements from '../components/datafiles/announcementData';
import AnnouncementAdmin from '../components/Announcements/AnnouncementAdmin';
import API from '.././Services/announcements.js'


const AdminDashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async() => {
      try {
        const response = await API.get('/');
        setAnnouncements(response.data);
        setError(null);

      } catch (err) {
        console.error('Failed to load announcements:', err);
        setError('Unable to load announcements. Please try again later');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if(loading) {
    return <div>Loading announcements...</div>
  }

  if (error){
    return <div style= {{ color: 'red'}}></div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AnnouncementAdmin
        announcements={announcements}
        onAnnouncementsChange={setAnnouncements}
      />
    
    </div>
  );
};

export default AdminDashboard;