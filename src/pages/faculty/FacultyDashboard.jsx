import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../../Services/profile";
import { getResolvedFacultySchedule, getAcademicTerms } from "../../Services/timetable";
import { getAnnouncements } from "../../Services/announcements";
import API from "../../Services/api";
import FacultyAttendanceSession from "../../components/Attendance/FacultyAttendanceSession";
import QuickConnectPanel from "../../components/Announcements/QuickConnectPanel";
import FacultyOutbox from "../../components/Announcements/FacultyOutbox";
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  FileText,
  Bell,
  ChevronRight,
  Activity,
  Plus,
  Loader2,
  AlertCircle,
  X,
  MessageSquare,
  User
} from "lucide-react";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [sections, setSections] = useState([]);
  const [todayLectures, setTodayLectures] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('schedule'); // 'schedule' | 'attendance' | 'announcements'
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [messageSubTab, setMessageSubTab] = useState('compose'); // 'compose' | 'sent'

  useEffect(() => {
    async function loadFacultyDashboard() {
      setLoading(true);
      setError(null);
      try {
        const collegeId = localStorage.getItem("collegeId");
        if (!collegeId) {
          throw new Error("No user college ID found.");
        }

        // 1. Fetch Profile
        const profileRes = await getProfile(collegeId);
        const profileData = profileRes.data;
        setProfile(profileData);

        const facultyId = profileData.faculty?.facultyId;

        // 2. Fetch My Sections (Active Courses count)
        try {
          const sectionsRes = await API.get("/faculty/my-sections");
          setSections(sectionsRes.data || []);
        } catch (e) {
          console.error("Failed to load faculty sections:", e);
        }

        // 3. Fetch Today's Lectures
        if (facultyId) {
          try {
            const termsRes = await getAcademicTerms();
            const currentTerm = termsRes.data?.[0] || "SPRING_2026";
            const todayStr = new Date().toISOString().split("T")[0];
            const scheduleRes = await getResolvedFacultySchedule(facultyId, todayStr, currentTerm);
            setTodayLectures(scheduleRes.data || []);
          } catch (e) {
            console.error("Failed to load today's faculty schedule:", e);
          }
        }

        // 4. Fetch Announcements
        try {
          const annRes = await getAnnouncements();
          setAnnouncements(annRes.data || []);
        } catch (e) {
          console.error("Failed to load announcements:", e);
        }

        // 5. Poll active attendance session (if any)
        try {
          const activeSessionRes = await API.get("/attendance/active-session");
          if (activeSessionRes.data) {
            setActiveSession(activeSessionRes.data);
          }
        } catch (e) {
          console.error("Failed to check active attendance session:", e);
        }

      } catch (err) {
        console.error("Failed to load faculty dashboard:", err);
        setError("Could not load faculty workspace. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    }

    loadFacultyDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#0D1512] dark:text-slate-100">
        <Loader2 className="w-10 h-10 text-emerald-600 dark:text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Loading your faculty workspace...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 text-slate-800 dark:text-slate-100">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold">Failed to load Faculty Dashboard</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-slate-800 dark:text-slate-100 text-left">
      <style>{`
        .scroll-style::-webkit-scrollbar {
          display: none;
        }
        .scroll-style {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 1. Welcoming Header */}
      <section className="flex flex-col lg:flex-row gap-6 items-stretch justify-between bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 p-6 rounded-3xl shadow-sm" data-purpose="greeting">
        {/* Left Side: Greeting Info */}
        <div className="flex-grow flex flex-col justify-center text-left">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Faculty Workspace
          </span>
          <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mt-1 leading-tight">
            Welcome, <span className="font-normal text-slate-900 dark:text-white">{profile?.name ? profile.name.split(' ')[0] : "Professor"}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your teaching schedule, publish announcements, track attendance, and log course grade submissions.
          </p>
        </div>

        {/* Right Side: The Profile Card */}
        <div className="lg:w-80 shrink-0 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden text-foreground">
          {/* Avatar frame */}
          <div className="relative w-16 h-16 shrink-0 z-10">
            {profile?.profilePictureUrl ? (
              <img
                src={profile.profilePictureUrl}
                alt={profile?.name || 'User'}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-zinc-700 shadow-inner"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-slate-200 dark:border-zinc-700">
                <User className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>

          {/* User Meta */}
          <div className="flex-1 min-w-0 z-10 text-left">
            <h4 className="font-semibold text-sm truncate text-gray-900 dark:text-white leading-tight">
              {profile?.name}
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-mono mt-0.5">
              {profile?.collegeId}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 shadow-sm" title={profile?.faculty?.department || "Department"}>
                📚
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-850 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-zinc-750">
                {profile?.faculty?.department || "Faculty"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Courses */}
        <Link
          to="/faculty/courses"
          className="group block p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Active Courses
            </span>
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-500 opacity-80" />
          </div>
          <h2 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mt-3">
            {sections.length || "—"}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            Assigned course sections
          </p>
        </Link>

        {/* Today's Lectures */}
        <Link
          to="/faculty/schedule"
          className="group block p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Today's Lectures
            </span>
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-500 opacity-80" />
          </div>
          <h2 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mt-3">
            {todayLectures.length}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            Scheduled lecture slots
          </p>
        </Link>

        {/* Pending Grading */}
        <Link
          to="/faculty/gradebook"
          className="group block p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Pending Grading
            </span>
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-500 opacity-80" />
          </div>
          <h2 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mt-3">
            3
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            Submissions needing review
          </p>
        </Link>

        {/* Students Assigned */}
        <Link
          to="/faculty/students"
          className="group block p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Students Assigned
            </span>
            <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-500 opacity-80" />
          </div>
          <h2 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight mt-3">
            120
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            Across enrolled batches
          </p>
        </Link>
      </div>

      {/* 3. Horizontal Segmented Tab Selector */}
      <div className="flex bg-white/80 dark:bg-[#14221C]/80 p-1 rounded-2xl border border-emerald-200/40 dark:border-emerald-950/60 w-fit gap-2 shadow-sm">
        <button
          onClick={() => setDashboardTab('schedule')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${dashboardTab === 'schedule'
            ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#0D1512]/50'
            }`}
        >
          Daily Schedule
        </button>
        <button
          onClick={() => setDashboardTab('attendance')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${dashboardTab === 'attendance'
            ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#0D1512]/50'
            }`}
        >
          Attendance Controller
        </button>
        <button
          onClick={() => setDashboardTab('announcements')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${dashboardTab === 'announcements'
            ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#0D1512]/50'
            }`}
        >
          Announcements
        </button>
        <button
          onClick={() => setDashboardTab('messages')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-200 ${dashboardTab === 'messages'
            ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#0D1512]/50'
            }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Quick Message
        </button>
      </div>

      {/* 4. Tab Panels */}
      <div>
        {/* Schedule Tab Content */}
        {dashboardTab === 'schedule' && (
          <div className="p-6 bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                Lectures Today
              </h3>
              <Link to="/faculty/schedule" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center">
                Full Timetable <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scroll-style">
              {todayLectures.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">
                  No lectures scheduled for today.
                </p>
              ) : (
                todayLectures.map((lec, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-[#0D1512]/40 border border-slate-200/60 dark:border-emerald-950/60 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        {lec.subjectName}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#0D1512]/80 px-2 py-0.5 rounded-full font-semibold">
                        {lec.roomName || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lec.startTime?.substring(0, 5)} - {lec.endTime?.substring(0, 5)}</span>
                      <span className="mx-1">•</span>
                      <span>Section: {lec.sectionName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Attendance Tab Content */}
        {dashboardTab === 'attendance' && (
          <div className="p-6 bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-emerald-655 dark:text-emerald-400" />
                Attendance Session
              </h3>
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center"
              >
                Configure <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="flex flex-col justify-center items-center py-6 text-center space-y-4">
              {activeSession ? (
                <div className="w-full max-w-md space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Active check-in session
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-[#0D1512]/40 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                      Section ID: {activeSession.sectionId}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Latitude: {activeSession.latitude} / Longitude: {activeSession.longitude}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAttendanceModal(true)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    View Checked-In Students
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed">
                    No active check-in running. Create a dynamic verification session to log student attendance.
                  </p>
                  <button
                    onClick={() => setShowAttendanceModal(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Start New Session
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements Tab Content */}
        {dashboardTab === 'announcements' && (
          <div className="p-6 bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-emerald-655 dark:text-emerald-400" />
                Notices
              </h3>
              <Link to="/faculty/gradebook" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center">
                New Notice <Plus className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scroll-style">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">
                  No active notices in the system.
                </p>
              ) : (
                announcements.slice(0, 5).map((ann, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-[#0D1512]/40 border border-slate-200/65 dark:border-emerald-950/60 rounded-xl space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">
                        {ann.title}
                      </span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {ann.type || "Global"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages Tab Content */}
        {dashboardTab === 'messages' && (
          <div className="space-y-4">
            {/* Secondary Sub-tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800/60 pb-1.5 gap-4">
              <button
                onClick={() => setMessageSubTab('compose')}
                className={`text-xs font-bold pb-2 transition-all border-b-2 relative ${messageSubTab === 'compose'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
              >
                Compose Message
              </button>
              <button
                onClick={() => setMessageSubTab('sent')}
                className={`text-xs font-bold pb-2 transition-all border-b-2 relative flex items-center gap-1.5 ${messageSubTab === 'sent'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
              >
                Sent & Replies
                {announcements.filter(a => a.type === 'REPLY' && !a.isCompleted && !a.completed).length > 0 && (
                  <span className="px-1.5 py-0.5 bg-emerald-500 text-white dark:bg-emerald-600 text-[9px] rounded-full font-bold">
                    {announcements.filter(a => a.type === 'REPLY' && !a.isCompleted && !a.completed).length}
                  </span>
                )}
              </button>
            </div>

            {messageSubTab === 'compose' ? (
              <QuickConnectPanel sections={sections} profile={profile} />
            ) : (
              <FacultyOutbox
                sections={sections}
                profile={profile}
                onRepliesChanged={async () => {
                  try {
                    const annRes = await getAnnouncements();
                    setAnnouncements(annRes.data || []);
                  } catch (e) {
                    console.error("Failed to reload announcements:", e);
                  }
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* 5. Quick Actions / Navigation Links */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Quick Link Operations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/faculty/courses"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1512]/40 border border-slate-200 dark:border-emerald-950/60 hover:border-emerald-500/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Course Dashboard</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Manage course syllabus & terms</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            to="/faculty/students"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1512]/40 border border-slate-200 dark:border-emerald-950/60 hover:border-emerald-500/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Attendance Sessions</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">TOTP validation & Student check-in</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            to="/faculty/gradebook"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1512]/40 border border-slate-200 dark:border-emerald-950/60 hover:border-emerald-500/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Grade Book Publisher</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Grade releases & announcements</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Attendance Controller Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-5xl bg-[#F9FBFC] dark:bg-[#0D1512] border border-emerald-100/50 dark:border-emerald-950/60 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setShowAttendanceModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <FacultyAttendanceSession />
          </div>
        </div>
      )}
    </div>
  );
}

