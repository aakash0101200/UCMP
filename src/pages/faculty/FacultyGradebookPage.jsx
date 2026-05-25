import React from 'react';
import AssignmentPublisher from '../../components/Announcements/AssignmentPublisher';

export default function FacultyGradebookPage() {
  return (
    <div className="-mt-6 -mx-6 min-h-[calc(100vh-64px)] bg-[#F9FBFC] dark:bg-[#0D1512] transition-colors duration-300 text-slate-800 dark:text-slate-100 overflow-y-auto w-[calc(100%+3rem)] p-6 space-y-6 pb-24 text-left">
      <div className="bg-white dark:bg-[#14221C] border border-emerald-150/40 dark:border-emerald-950/60 p-6 rounded-3xl shadow-sm">
        <span className="text-xs font-semibold text-emerald-650 dark:text-emerald-400 tracking-wider uppercase">
          Communications & Grading
        </span>
        <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mt-1">
          Grade Book & Announcements
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Publish notices, assignments, grading policies, and class announcements to your enrolled sections.
        </p>
      </div>

      <div className="mt-4">
        <AssignmentPublisher />
      </div>
    </div>
  );
}
