import React from 'react';
import { BookOpen } from 'lucide-react';

export default function FacultyCoursesPage() {
  return (
    <div className="scroll-style space-y-4">
      <h2 className="text-2xl font-bold">My Courses</h2>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Course management coming soon.</p>
      </div>
    </div>
  );
}
