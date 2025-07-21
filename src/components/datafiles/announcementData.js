// announcementData.js

const initialAnnouncements = [
    {
      id: 1,
      title: 'Hackathon Registration Open',
      description: 'Register for the inter-college hackathon by next Friday.',
      time: '10:00 AM, Jul 25',
      location: 'Auditorium',
      author: 'Admin',
      type: 'event',
      isCompleted: false,
    },
    {
      id: 2,
      title: 'Final Project Submission',
      description: 'Submit your final semester project with documentation.',
      time: '11:59 PM, Jul 30',
      author: 'Prof. Verma',
      type: 'deadline',
      isCompleted: true,
    },
    {
      id: 3,
      title: 'Website Maintenance Update',
      description: 'The student portal will be under maintenance this weekend.',
      time: '6:00 PM, Jul 27',
      author: 'IT Cell',
      type: 'update',
      isCompleted: false,
    },
  ];
  
  export default initialAnnouncements;
  