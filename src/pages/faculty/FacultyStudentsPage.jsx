import React, { useState } from 'react';
import FacultyAttendanceSession from '../../components/Attendance/FacultyAttendanceSession';
import FacultySessionHistory from '../../components/Attendance/FacultySessionHistory';
import { Play, History } from 'lucide-react';

export default function FacultyStudentsPage() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history'

  return (
    <div className="scroll-style space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Attendance Management</h2>
          <p className="text-sm text-neutral-400">Launch real-time check-ins and manage manual overrides</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'live'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" /> Live Session
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-neutral-400 hover:text-white'
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
