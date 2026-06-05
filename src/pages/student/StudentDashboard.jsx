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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock assignments matching the actual list on AssignmentPage.jsx
  const mockAssignments = [
    { id: "1", title: "Database Design Project", subject: "Database Systems", dueDate: "2026-05-15", priority: "high" },
    { id: "2", title: "React Component Library", subject: "Web Development", dueDate: "2026-05-20", priority: "medium" },
    { id: "3", title: "ML Algorithm Implementation", subject: "AI & ML", dueDate: "2026-05-18", priority: "high" }
  ];

  useEffect(() => {
    async function loadDashboardData() {
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

        const sectionId = profileData.student?.sectionId;

        // 2. Fetch Attendance Summary
        try {
          const attRes = await getAttendanceSummary();
          setAttendance(attRes.data || []);
        } catch (e) {
          console.error("Failed to load attendance summary:", e);
        }

        // 3. Fetch Today's Classes Schedule
        if (sectionId) {
          try {
            const termsRes = await getAcademicTerms();
            const currentTerm = termsRes.data?.[0] || "SPRING_2026";
            const d = new Date();
            const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const scheduleRes = await getResolvedSectionSchedule(sectionId, todayStr, currentTerm);
            setClasses(scheduleRes.data || []);
          } catch (e) {
            console.error("Failed to load today's classes schedule:", e);
          }
        }

        // 4. Fetch Announcements
        try {
          let annRes;
          if (sectionId) {
            annRes = await getStudentAnnouncements(collegeId, sectionId);
          } else {
            annRes = await getAnnouncements();
          }
          setAnnouncements(annRes.data || []);
        } catch (e) {
          console.error("Failed to load announcements:", e);
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
  const overallAttendance = attendance.length
    ? attendance.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / attendance.length
    : 0;

  const attendanceVal = overallAttendance || 0;

  return (
    <div className="space-y-8 pb-24 p-6 -mt-6 -mx-6 -mb-6 w-[calc(100%+3rem)] min-h-[calc(100vh-64px)] bg-gradient-to-tr from-[#E0F2FE] via-[#F1F5F9] to-[#FCE7F3] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-300 text-foreground overflow-y-auto text-left">

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

      {/* BEGIN: Greeting Section */}
      <section data-purpose="greeting">
        <h1 className="text-5xl font-light text-gray-900 dark:text-white tracking-tight">
          Hello, {profile?.name ? profile.name.split(' ')[0] : "Student"}
        </h1>
        <p className="text-gray-600 dark:text-zinc-400 mt-2 text-lg">
          Access your academic and personal summary.
        </p>
      </section>
      {/* END: Greeting Section */}

      {/* BEGIN: Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="stats-grid">
        {/* Attendance Card */}
        <Link
          to="/student/attendance"
          className="bg-white dark:bg-zinc-900/90 rounded-[2.5rem] p-5 shadow-sm border border-white/20 dark:border-zinc-800/40 flex flex-col items-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
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
          className="bg-white dark:bg-zinc-900/90 rounded-[2.5rem] p-5 shadow-sm border border-white/20 dark:border-zinc-800/40 flex flex-col items-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
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
          className="bg-white dark:bg-zinc-900/90 rounded-[2.5rem] p-5 shadow-sm border border-white/20 dark:border-zinc-800/40 flex flex-col items-center hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
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
        <div className="bg-white dark:bg-zinc-900/90 rounded-[2.5rem] p-5 shadow-sm border border-white/20 dark:border-zinc-800/40 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4 text-gray-700 dark:text-zinc-300">
            <span className="text-sm font-medium">GPA</span>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-4 text-5xl font-light text-gray-900 dark:text-white">3.8</div>
        </div>
      </section>
      {/* END: Stats Grid */}

      {/* BEGIN: Daily Focus Card */}
      <section className="bg-white dark:bg-zinc-900/90 rounded-[3rem] p-10 shadow-sm border border-white/20 dark:border-zinc-800/40 flex flex-col items-center justify-center space-y-6" data-purpose="daily-focus">
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
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-[2rem] p-8 text-center text-gray-500 dark:text-zinc-400 shadow-sm border border-white/20 dark:border-zinc-800/40">
              No classes scheduled for today.
            </div>
          ) : (
            classes.map((cls, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-[2rem] p-4 flex items-center gap-4 shadow-sm border border-white/20 dark:border-zinc-800/40 hover:shadow-md hover:scale-[1.005] transition-all duration-200">
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
            <div className="min-w-[200px] bg-white dark:bg-zinc-900/90 rounded-[2rem] p-6 shadow-sm border border-white/20 dark:border-zinc-800/40 flex items-center justify-center text-center text-gray-500 dark:text-zinc-400">
              No recent notices.
            </div>
          ) : (
            announcements.map((ann, idx) => (
              <div key={idx} className="min-w-[220px] max-w-[260px] bg-white dark:bg-zinc-900/90 rounded-[2rem] p-6 shadow-sm border border-white/20 dark:border-zinc-800/40 flex flex-col justify-between hover:shadow-md transition-all duration-200">
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
