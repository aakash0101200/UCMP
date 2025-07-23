// src/pages/FacultyDashboard.jsx
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function FacultyDashboard() {
  return (
    <DashboardLayout userRole="faculty">
      <h2 className="text-2xl font-bold mb-4">Faculty Dashboard</h2>
      {/* Your faculty-specific content */}
    </DashboardLayout>
  );
}
