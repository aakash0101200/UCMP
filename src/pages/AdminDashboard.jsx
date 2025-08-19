import  { React, useEffect, useState } from 'react';
import initialAnnouncements from '../components/Announcements/datafiles/announcementData';
import AnnouncementAdmin from '../components/Announcements/AnnouncementAdmin';
import AssignmentPublisher from "../components/Announcements/AssignmentPublisher";
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
    <>
    <div 
    className="p-6 max-w-4xl mx-auto border-t-4 border-t-red-500 border-r-4 border-r-blue-500 border-b-4 border-b-green-500 border-l-4 border-l-yellow-500"
    >
       <AnnouncementAdmin
        announcements={announcements}
        onAnnouncementsChange={setAnnouncements}
      />
    
    </div>
    <AssignmentPublisher />
    </>
  );
};

export default AdminDashboard;