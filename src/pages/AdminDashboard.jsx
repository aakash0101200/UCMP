import  { React, useState } from 'react';
import initialAnnouncements from '../components/datafiles/announcementData';
import AnnouncementAdmin from '../components/Announcements/AnnouncementAdmin';

const AdminDashboard = () => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

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