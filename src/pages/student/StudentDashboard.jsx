import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../../Services/profile";
import { getAttendanceSummary } from "../../Services/attendance";
import { getResolvedSectionSchedule, getAcademicTerms } from "../../Services/timetable";
import { getStudentAnnouncements, getAnnouncements } from "../../Services/announcements";
// import BottomNavBar from "../../components/navigation/BottomNavBar";
import {
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Award,
  FileText,
  Bell,
  ChevronRight,
  User,
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";

import { getCacheSync } from "../../utils/apiCache";

const getGreetingName = (name) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const titles = ["dr.", "dr", "mr.", "mr", "mrs.", "mrs", "ms.", "ms", "prof.", "prof"];
  if (parts.length > 1 && titles.includes(parts[0].toLowerCase())) {
    return `${parts[0]} ${parts[1]}`;
  }
  return parts[0];
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(() => {
    const collegeId = localStorage.getItem("collegeId");
    return getCacheSync(`profile_${collegeId}`)?.data || null;
  });
  const [attendance, setAttendance] = useState(() => {
    return getCacheSync('attendance_summary')?.data || [];
  });
  const [classes, setClasses] = useState(() => {
    const sectionId = localStorage.getItem("sectionId");
    if (!sectionId) return [];
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const currentTerm = "SPRING_2026";
    return getCacheSync(`resolved_schedule_${sectionId}_${todayStr}_${currentTerm}`)?.data || [];
  });
  const [announcements, setAnnouncements] = useState(() => {
    const collegeId = localStorage.getItem("collegeId");
    const sectionId = localStorage.getItem("sectionId");
    if (sectionId && collegeId) {
      return getCacheSync(`announcements_student_${collegeId}_${sectionId}`)?.data || [];
    }
    return getCacheSync('announcements_global')?.data || [];
  });

  const [loading, setLoading] = useState(() => {
    const collegeId = localStorage.getItem("collegeId");
    return !getCacheSync(`profile_${collegeId}`);
  });
  const [error, setError] = useState(null);

  // Mock assignments matching the actual list on AssignmentPage.jsx
  const mockAssignments = [
    { id: "1", title: "Database Design Project", subject: "Database Systems", dueDate: "2026-05-15", priority: "high" },
    { id: "2", title: "React Component Library", subject: "Web Development", dueDate: "2026-05-20", priority: "medium" },
    { id: "3", title: "ML Algorithm Implementation", subject: "AI & ML", dueDate: "2026-05-18", priority: "high" }
  ];

  useEffect(() => {
    async function loadDashboardData() {
      const collegeId = localStorage.getItem("collegeId");
      const hasProfile = !!getCacheSync(`profile_${collegeId}`);
      if (!hasProfile) {
        setLoading(true);
      }
      setError(null);
      try {
        if (!collegeId) {
          throw new Error("No user college ID found.");
        }

        const sectionId = localStorage.getItem("sectionId");

        // Parallelize all network requests
        const profilePromise = getProfile(collegeId);
        const attPromise = getAttendanceSummary();
        
        const schedulePromise = sectionId ? (async () => {
          const termsRes = await getAcademicTerms();
          const currentTerm = termsRes.data?.[0] || "SPRING_2026";
          const d = new Date();
          const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return getResolvedSectionSchedule(sectionId, todayStr, currentTerm);
        })() : Promise.resolve({ data: [] });

        const annPromise = sectionId 
          ? getStudentAnnouncements(collegeId, sectionId) 
          : getAnnouncements();

        const [profileRes, attRes, scheduleRes, annRes] = await Promise.all([
          profilePromise,
          attPromise.catch(e => { console.error("Attendance summary error:", e); return { data: [] }; }),
          schedulePromise.catch(e => { console.error("Schedule error:", e); return { data: [] }; }),
          annPromise.catch(e => { console.error("Announcements error:", e); return { data: [] }; })
        ]);

        setProfile(profileRes.data);
        setAttendance(attRes.data || []);
        setClasses(scheduleRes.data || []);
        setAnnouncements(annRes.data || []);

        if (profileRes.data?.student?.sectionId) {
          localStorage.setItem("sectionId", profileRes.data.student.sectionId);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Could not load workspace. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-[#6366F1] animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading your student workspace...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold">Failed to load Dashboard</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">{error}</p>
      </div>
    );
  }


  // Calculate overall attendance average
  const activeAttendance = attendance.filter(curr => curr.totalClasses > 0);
  const overallAttendance = activeAttendance.length
    ? activeAttendance.reduce((acc, curr) => acc + (curr.attended / curr.totalClasses) * 100, 0) / activeAttendance.length
    : 0;

  const attendanceVal = overallAttendance || 0;

  return (
    <div className="space-y-8 pb-12 text-foreground text-left">

      {/* Dynamic breathing and focus animation styling */}
      <style>{`
        @keyframes pulse-ring-1 {
          0% { transform: scale(0.95); opacity: 0.15; }
          50% { transform: scale(1.08); opacity: 0.35; }
          100% { transform: scale(0.95); opacity: 0.15; }
        }
        @keyframes pulse-ring-2 {
          0% { transform: scale(0.95); opacity: 0.25; }
          50% { transform: scale(1.12); opacity: 0.45; }
          100% { transform: scale(0.95); opacity: 0.25; }
        }
        @keyframes pulse-ring-3 {
          0% { transform: scale(0.95); opacity: 0.35; }
          50% { transform: scale(1.16); opacity: 0.55; }
          100% { transform: scale(0.95); opacity: 0.35; }
        }
        @keyframes pulse-core {
          0% { transform: scale(1); box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 4px 25px rgba(59, 130, 246, 0.6); }
          100% { transform: scale(1); box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); }
        }
        .animate-ring-1 {
          animation: pulse-ring-1 4s ease-in-out infinite;
        }
        .animate-ring-2 {
          animation: pulse-ring-2 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .animate-ring-3 {
          animation: pulse-ring-3 4s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-core {
          animation: pulse-core 4s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* BEGIN: Greeting & Profile Card Section */}
      <section className="flex flex-col lg:flex-row gap-6 items-stretch justify-between" data-purpose="greeting">

        {/* Left Side: Greeting Info */}
        <div className="flex-1 flex flex-col justify-center text-left">
          <h1 className="text-5xl font-light text-gray-900 dark:text-white tracking-tight leading-tight">
            Hello, <span className="font-normal text-gray-900 dark:text-white">{profile?.name ? getGreetingName(profile.name) : "Student"}</span>
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2 text-lg">
            Access your academic summary, schedules, and active classroom sessions.
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
              <span className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 shadow-sm">
                🎓
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* BEGIN: Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="stats-grid">
        {/* Attendance Card */}
        <Link
          to="/student/attendance"
          className="bg-white dark:bg-zinc-900/90 rounded-[2.5rem] p-5 shadow-sm border border-slate-200/50 dark:border-zinc-800/40 flex flex-col items-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
        >
          <div className="w-full flex justify-between items-center mb-4 text-gray-700 dark:text-zinc-300">
            <span className="text-sm font-medium">Attendance %</span>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                className="stroke-gray-100 dark:stroke-zinc-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                className="stroke-blue-500"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - attendanceVal / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-semibold text-gray-900 dark:text-white">
              {attendanceVal.toFixed(1)}%
            </span>
          </div>
        </Link>

        {/* Active Courses Card */}
        <Link
          to="/student/courses"
          className="bg-white dark:bg-zinc-900/90 rounded-[2.5rem] p-5 shadow-sm border border-slate-200/50 dark:border-zinc-800/40 flex flex-col items-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
        >
          <div className="w-full flex justify-between items-center mb-4 text-gray-700 dark:text-zinc-300">
            <span className="text-sm font-medium">Active Courses</span>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-4 text-5xl font-light text-gray-900 dark:text-white">
            {attendance.length || "0"}
          </div>
        </Link>

        {/* Pending Tasks Card */}
        <Link
          to="/student/assignment"
          className="bg-white dark:bg-zinc-900/90 rounded-[2.5rem] p-5 shadow-sm border border-slate-200/50 dark:border-zinc-800/40 flex flex-col items-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
        >
          <div className="w-full flex justify-between items-center mb-4 text-gray-700 dark:text-zinc-300">
            <span className="text-sm font-medium">Pending Tasks</span>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-4 text-5xl font-light text-gray-900 dark:text-white">
            {mockAssignments.length}
          </div>
        </Link>

        {/* GPA Card */}
        <div className="bg-white dark:bg-zinc-900/90 rounded-[2.5rem] p-5 shadow-sm border border-slate-200/50 dark:border-zinc-800/40 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4 text-gray-700 dark:text-zinc-300">
            <span className="text-sm font-medium">GPA</span>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-4 text-5xl font-light text-gray-900 dark:text-white">3.8</div>
        </div>
      </section>
      {/* END: Stats Grid */}

      {/* BEGIN: Daily Focus Card */}
      <section className="bg-white dark:bg-zinc-900/90 rounded-[3rem] p-10 shadow-sm border border-slate-200/50 dark:border-zinc-800/40 flex flex-col items-center justify-center space-y-6" data-purpose="daily-focus">
        <div className="relative w-[120px] h-[120px] flex items-center justify-center">
          <div className="absolute w-[120px] h-[120px] border border-blue-500/20 rounded-full animate-ring-1"></div>
          <div className="absolute w-[100px] h-[100px] border border-blue-500/30 rounded-full animate-ring-2"></div>
          <div className="absolute w-[80px] h-[80px] border border-blue-500/40 rounded-full animate-ring-3"></div>
          <div className="w-[60px] h-[60px] bg-blue-500 rounded-full z-10 animate-core shadow-[0_4px_15px_rgba(59,130,246,0.4)]"></div>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-medium text-gray-900 dark:text-white">Daily Focus</h3>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Breathe to center your study.</p>
        </div>
      </section>
      {/* END: Daily Focus Card */}

      {/* BEGIN: Schedule Section */}
      <section className="space-y-4" data-purpose="schedule">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-white px-1">Today's Schedule</h2>
        <div className="space-y-3">
          {classes.length === 0 ? (
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-[2rem] p-8 text-center text-gray-500 dark:text-zinc-400 shadow-sm border border-slate-200/50 dark:border-zinc-800/40">
              No classes scheduled for today.
            </div>
          ) : (
            classes.map((cls, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-[2rem] p-4 flex items-center gap-4 shadow-sm border border-slate-200/50 dark:border-zinc-800/40 hover:shadow-md hover:scale-[1.005] transition-all duration-200">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{cls.subjectName}</h4>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    {cls.startTime?.substring(0, 5)} - {cls.endTime?.substring(0, 5)} {cls.roomName ? `• Room ${cls.roomName}` : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      {/* END: Schedule Section */}

      {/* BEGIN: Recent Notices */}
      <section className="space-y-4" data-purpose="notices">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-white px-1">Recent Notices</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {announcements.length === 0 ? (
            <div className="min-w-[200px] bg-white dark:bg-zinc-900/90 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-zinc-800/40 flex items-center justify-center text-center text-gray-500 dark:text-zinc-400">
              No recent notices.
            </div>
          ) : (
            announcements.map((ann, idx) => (
              <div key={idx} className="min-w-[220px] max-w-[260px] bg-white dark:bg-zinc-900/90 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 dark:border-zinc-800/40 flex flex-col justify-between hover:shadow-md transition-all duration-200">
                <p className="text-gray-800 dark:text-zinc-200 font-medium leading-snug line-clamp-2">
                  {ann.title}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-2 line-clamp-3">
                  {ann.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
      {/* END: Recent Notices */}

      {/* <BottomNavBar /> */}
    </div>
  );
}
