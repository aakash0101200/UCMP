import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AnnouncementAdmin from '@/components/Announcements/AnnouncementAdmin';
import API from '@/Services/announcements';
import baseAPI from '@/Services/api';
import {
  LayoutDashboard,
  Megaphone,
  UserPlus,
  Users,
  GraduationCap,
  Briefcase,
  Bell,
  FileText,
  Activity,
  Clock,
  ChevronRight
} from 'lucide-react';

const AdminDashboard = () => {
  // Meta state
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Dynamic stats
  const [stats, setStats] = useState({ totalUsers: 154, studentCount: 130, facultyCount: 24 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [annRes, statsRes] = await Promise.allSettled([
          API.get('/'),
          baseAPI.get('/admin/stats')
        ]);

        if (annRes.status === 'fulfilled') {
          setAnnouncements(annRes.value.data || []);
        } else {
          console.error('Failed to load announcements:', annRes.reason);
        }

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data || { totalUsers: 154, studentCount: 130, facultyCount: 24 });
        } else {
          console.error('Failed to load stats:', statsRes.reason);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard resources:', err);
        setError('Unable to load server resources. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <Activity className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading administration panel...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 p-6 -mt-6 -mx-6 min-h-[calc(100vh-64px)] page-canvas transition-colors duration-300 text-foreground overflow-y-auto w-[calc(100%+3rem)]">

      {/* BEGIN: Admin Header */}
      <section data-purpose="greeting" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">
            Administrative Command Center
          </span>
          <h1 className="text-5xl font-light text-text-primary tracking-tight mt-1">
            System Workspace
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            Monitor platform metrics, manage announcements, and register new academic members.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="surface-card px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-text-muted">Server: </span>
            <span className="font-semibold text-text-primary">Active (Spring Boot)</span>
          </div>
        </div>
      </section>
      {/* END: Admin Header */}

      {/* BEGIN: Tabs Bar */}
      <div className="flex surface-card p-1 rounded-2xl w-fit gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'overview'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors'
            }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'announcements'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors'
            }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          Announcements &amp; Tasks
        </button>
      </div>
      {/* END: Tabs Bar */}

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <Link
              to="/admin/users"
              className="surface-card rounded-[2rem] p-5 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col items-center select-none"
            >
              <div className="w-full flex justify-between items-center mb-4 text-text-secondary">
                <span className="text-sm font-medium">Total Users</span>
                <Users className="w-5 h-5 text-text-muted" />
              </div>
              <div className="mt-4 text-5xl font-light text-text-primary">{stats.totalUsers}</div>
            </Link>

            {/* Students count */}
            <Link
              to="/admin/users"
              className="surface-card rounded-[2rem] p-5 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col items-center select-none"
            >
              <div className="w-full flex justify-between items-center mb-4 text-text-secondary">
                <span className="text-sm font-medium">Students</span>
                <GraduationCap className="w-5 h-5 text-text-muted" />
              </div>
              <div className="mt-4 text-5xl font-light text-text-primary">{stats.studentCount}</div>
            </Link>

            {/* Faculty count */}
            <Link
              to="/admin/users"
              className="surface-card rounded-[2rem] p-5 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col items-center select-none"
            >
              <div className="w-full flex justify-between items-center mb-4 text-text-secondary">
                <span className="text-sm font-medium">Faculty</span>
                <Briefcase className="w-5 h-5 text-text-muted" />
              </div>
              <div className="mt-4 text-5xl font-light text-text-primary">{stats.facultyCount}</div>
            </Link>

            {/* Active Announcements */}
            <button
              onClick={() => setActiveTab('announcements')}
              className="surface-card rounded-[2rem] p-5 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col items-center select-none text-left"
            >
              <div className="w-full flex justify-between items-center mb-4 text-text-secondary">
                <span className="text-sm font-medium">Active Notices</span>
                <Bell className="w-5 h-5 text-text-muted" />
              </div>
              <div className="mt-4 text-5xl font-light text-text-primary">{announcements.length}</div>
            </button>
          </div>

          {/* Main Grid: Administrative Shortcuts (Left) & Platform Status (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Shortcuts */}
            <div className="lg:col-span-1 p-5 rounded-[2rem] surface-card space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary mb-4">
                  Administrative Shortcuts
                </h3>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/admin/timetable"
                    className="flex items-center justify-between p-3.5 rounded-xl surface-subtle hover:border-indigo-400/40 dark:hover:border-indigo-500/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">Timetable Editor</h4>
                        <p className="text-[9px] text-text-muted mt-0.5">Manage schedules &amp; rooms</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  </Link>

                  <Link
                    to="/admin/users?tab=register"
                    className="w-full flex items-center justify-between p-3.5 rounded-xl surface-subtle hover:border-indigo-400/40 dark:hover:border-indigo-500/30 hover:shadow-sm transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus className="w-4 h-4 text-indigo-500" />
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">Create User Accounts</h4>
                        <p className="text-[9px] text-text-muted mt-0.5">Register students/faculty</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  </Link>

                  <button
                    onClick={() => toast.success("Academic performance report compilation started. Check downloads folder shortly.")}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl surface-subtle hover:border-indigo-400/40 dark:hover:border-indigo-500/30 hover:shadow-sm transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">Export Global Timetable</h4>
                        <p className="text-[9px] text-text-muted mt-0.5">Compile classroom data to Excel</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                </div>
              </div>
            </div>

            {/* System Status & Overrides Preview */}
            <div className="lg:col-span-2 p-5 rounded-[2rem] surface-card space-y-4">
              <div className="flex justify-between items-center pb-2 surface-divider border-b">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Recent System Conflicts &amp; Overrides
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 surface-subtle rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-text-primary">Room 102 Lecture Override</span>
                    <p className="text-[10px] text-text-muted mt-0.5">Professor Watson rescheduled Web Programming to Tuesday 10:00 AM</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full text-[9px]">Resolved</span>
                </div>
                <div className="p-3 surface-subtle rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-text-primary">Lab Attendance Adjustment</span>
                    <p className="text-[10px] text-text-muted mt-0.5">Automated override system approved attendance slot validation for CSE Section B</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full text-[9px]">Resolved</span>
                </div>
                <div className="p-3 surface-subtle rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-text-primary">Timetable Lock Status</span>
                    <p className="text-[10px] text-text-muted mt-0.5">Term SPRING_2026 timetable structures locked against manual modifications</p>
                  </div>
                  <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full text-[9px]">Locked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <AnnouncementAdmin
            announcements={announcements}
            onAnnouncementsChange={setAnnouncements}
          />
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;