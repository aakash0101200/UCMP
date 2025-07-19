import { useState, useEffect } from 'react';

export const useRole = () => {
  const [userRole, setUserRole] = useState('student'); // Default to student
  const [studentId, setStudentId] = useState('STU001');

  // In a real app, this would come from authentication
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') || 'student';
    const savedId = localStorage.getItem('studentId') || 'STU001';
    setUserRole(savedRole);
    setStudentId(savedId);
  }, []);

  const switchRole = (newRole, newId) => {
    setUserRole(newRole);
    setStudentId(newId);
    localStorage.setItem('userRole', newRole);
    localStorage.setItem('studentId', newId);
  };

  return { userRole, studentId, switchRole };
};
