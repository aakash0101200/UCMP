import React from 'react';
import AssignmentPublisher from '../../components/Announcements/AssignmentPublisher';

export default function FacultyGradebookPage() {
  return (
    <div className="scroll-style space-y-4">
      <h2 className="text-2xl font-bold">Grade Book & Announcements</h2>
      <AssignmentPublisher />
    </div>
  );
}
