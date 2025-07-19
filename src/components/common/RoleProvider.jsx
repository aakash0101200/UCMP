import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('student'); // Default to student
  const [studentId, setStudentId] = useState('STU001');
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@college.edu',
    branch: 'CSE',
    section: 'A',
    semester: '6'
  });

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') || 'student';
    const savedId = localStorage.getItem('studentId') || 'STU001';
    const savedUserInfo = localStorage.getItem('userInfo');
    
    setUserRole(savedRole);
    setStudentId(savedId);
    
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('studentId', studentId);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, [userRole, studentId, userInfo]);

  const switchRole = (newRole, newId, newUserInfo = {}) => {
    setUserRole(newRole);
    setStudentId(newId);
    setUserInfo({ ...userInfo, ...newUserInfo });
  };

  const logout = () => {
    setUserRole('guest');
    setStudentId('');
    setUserInfo({});
    localStorage.removeItem('userRole');
    localStorage.removeItem('studentId');
    localStorage.removeItem('userInfo');
  };

  const hasPermission = (permission) => {
    const rolePermissions = {
      admin: ['create_any_event', 'edit_any_event', 'delete_any_event', 'assign_to_students', 'manage_users'],
      faculty: ['create_course_events', 'edit_course_events', 'assign_to_course_students', 'view_student_events'],
      student: ['create_personal_events', 'edit_personal_events', 'view_assigned_events']
    };
    
    return rolePermissions[userRole]?.includes(permission) || false;
  };

  const value = {
    userRole,
    studentId,
    userInfo,
    switchRole,
    logout,
    hasPermission
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};