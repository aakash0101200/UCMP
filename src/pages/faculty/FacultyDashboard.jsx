// src/pages/FacultyDashboard.jsx
import React from 'react';
import DashboardLayout from "../../components/layout/DashboardLayout";
import AssignmentPublisher from '../../components/Announcements/AssignmentPublisher';

export default function FacultyDashboard() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Faculty Dashboard</h2>
      {/* Your faculty-specific content */}
      <AssignmentPublisher/>
    </>
  );
}
