import React, { useState } from 'react';
import FacultyAttendanceSession from '../../components/Attendance/FacultyAttendanceSession';
import FacultySessionHistory from '../../components/Attendance/FacultySessionHistory';
import { Play, History } from 'lucide-react';

export default function FacultyStudentsPage() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history'

  return (
    <div className="-mt-6 -mx-6 min-h-[calc(100vh-64px)] bg-[#F9FBFC] dark:bg-[#0D1512] transition-colors duration-300 text-slate-800 dark:text-slate-100 overflow-y-auto w-[calc(100%+3rem)] p-6 space-y-6 pb-24 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#14221C] border border-emerald-150/40 dark:border-emerald-950/60 p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-xs font-semibold text-emerald-650 dark:text-emerald-400 tracking-wider uppercase">
            Roster & Presence
          </span>
          <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mt-1">
            Attendance Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Launch real-time check-ins and manage manual overrides
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-150/50 dark:bg-[#0D1512]/60 p-1 rounded-2xl border border-slate-200 dark:border-emerald-950/60 w-fit gap-2 shadow-sm">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
              activeTab === 'live'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#0D1512]/50'
            }`}
          >
            <Play className="w-3.5 h-3.5" /> Live Session
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#0D1512]/50'
            }`}
          >
            <History className="w-3.5 h-3.5" /> History & Corrections
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'live' ? (
          <FacultyAttendanceSession />
        ) : (
          <FacultySessionHistory />
        )}
      </div>
    </div>
  );
}
