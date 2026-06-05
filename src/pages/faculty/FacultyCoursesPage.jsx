import React from 'react';
import { BookOpen } from 'lucide-react';

export default function FacultyCoursesPage() {
  return (
    <div className="-mt-6 -mx-6 min-h-[calc(100vh-64px)] bg-[#F9FBFC] dark:bg-[#0D1512] transition-colors duration-300 text-slate-800 dark:text-slate-100 overflow-y-auto w-[calc(100%+3rem)] p-6 space-y-6 pb-24 text-left">
      <div className="bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 p-6 rounded-3xl shadow-sm">
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
          Curriculum
        </span>
        <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mt-1">
          My Courses
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your course syllabi, assignments, and term materials.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl shadow-sm">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-full mb-4">
          <BookOpen className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Course Management</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
          Interactive curriculum, lesson planners, and assignment distribution modules are coming soon.
        </p>
      </div>
    </div>
  );
}
