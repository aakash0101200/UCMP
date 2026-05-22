import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../../Services/profile";
import { getAttendanceSummary } from "../../Services/attendance";
import { getResolvedSectionSchedule, getAcademicTerms } from "../../Services/timetable";
import { getStudentAnnouncements, getAnnouncements } from "../../Services/announcements";
import Calendar from "../Calendar";
import BottomNavBar from "../../components/navigation/BottomNavBar";
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

  return (
    <div className="scroll-style space-y-6 pb-20">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 border border-border/50 p-6 rounded-2xl">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-[#6366F1] tracking-wider uppercase">
            Workspace Hub
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Hello, {profile?.name || "Student"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access your academic summary, check schedule timetables, and monitor real-time class metrics.
          </p>
        </div>

        {/* Profile Badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-background border border-border/60 px-3.5 py-1.5 rounded-xl font-medium shadow-sm">
            <span className="text-muted-foreground">ID: </span>
            <span className="font-semibold text-foreground">{profile?.collegeId}</span>
          </div>
          <div className="bg-background border border-border/60 px-3.5 py-1.5 rounded-xl font-medium shadow-sm">
            <span className="text-muted-foreground">Year: </span>
            <span className="font-semibold text-foreground">{profile?.student?.year || "3"}</span>
          </div>
          <div className="bg-background border border-border/60 px-3.5 py-1.5 rounded-xl font-medium shadow-sm">
            <span className="text-muted-foreground">Dept: </span>
            <span className="font-semibold text-foreground">{profile?.student?.batchName || "Computer Science"}</span>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Attendance Card */}
        <Link 
          to="/student/attendance"
          className="group block p-5 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/40 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-[#6366F1] transition-colors">
              Attendance %
            </span>
            <CheckCircle2 className="w-5 h-5 text-indigo-500 dark:text-[#6366F1] opacity-80" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">
            {overallAttendance.toFixed(1)}%
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Average across {attendance.length} courses
          </p>
        </Link>

        {/* Active Courses Card */}
        <Link 
          to="/student/courses"
          className="group block p-5 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/40 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-[#6366F1] transition-colors">
              Active Courses
            </span>
            <BookOpen className="w-5 h-5 text-indigo-500 dark:text-[#6366F1] opacity-80" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">
            {attendance.length || "—"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Enrolled this term
          </p>
        </Link>

        {/* Pending Assignments Card */}
        <Link 
          to="/student/assignment"
          className="group block p-5 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/40 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-[#6366F1] transition-colors">
              Pending Assignments
            </span>
            <FileText className="w-5 h-5 text-indigo-500 dark:text-[#6366F1] opacity-80" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">
            {mockAssignments.length}
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Tasks needing completion
          </p>
        </Link>

        {/* GPA & Credits Card */}
        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Credits / GPA
            </span>
            <Award className="w-5 h-5 text-indigo-500 dark:text-[#6366F1] opacity-80" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">
            9.2 / 24
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Academic standing
          </p>
        </div>
      </div>

      {/* 3. Core Previews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Classes Preview */}
        <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              Today's Schedule
            </h3>
            <Link to="/student/schedule" className="text-xs text-indigo-600 dark:text-[#6366F1] hover:underline font-semibold flex items-center">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {classes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No classes scheduled for today.
              </p>
            ) : (
              classes.map((cls, idx) => (
                <div key={idx} className="p-3 bg-background/50 border border-border/45 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-foreground">
                      {cls.subjectName}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                      {cls.roomName || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{cls.startTime?.substring(0, 5)} - {cls.endTime?.substring(0, 5)}</span>
                    <span className="mx-1">•</span>
                    <span className="truncate">{cls.facultyName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              Recent Notices
            </h3>
            <Link to="/student/updates" className="text-xs text-indigo-600 dark:text-[#6366F1] hover:underline font-semibold flex items-center">
              Inbox <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {announcements.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No recent announcements.
              </p>
            ) : (
              announcements.slice(0, 3).map((ann, idx) => (
                <div key={idx} className="p-3 bg-background/50 border border-border/45 rounded-xl space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-foreground line-clamp-1">
                      {ann.title}
                    </span>
                    <span className="text-[9px] text-indigo-500 font-semibold whitespace-nowrap bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      {ann.type || "Global"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {/* <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Deadlines
            </h3>
            <Link to="/student/assignment" className="text-xs text-indigo-600 dark:text-[#6366F1] hover:underline font-semibold flex items-center">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {mockAssignments.map((ass) => (
              <div key={ass.id} className="p-3 bg-background/50 border border-border/45 rounded-xl flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">{ass.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{ass.subject}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                    ass.priority === "high" 
                      ? "bg-rose-500/15 text-rose-500 border-rose-500/20" 
                      : "bg-amber-500/15 text-amber-500 border-amber-500/20"
                  }`}>
                    {ass.priority}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {ass.dueDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div> */}

      </div>

      {/* 4. Previews Below The Fold */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Attendance Summary Preview */}
        {/* <div className="lg:col-span-1 p-5 rounded-2xl bg-card border border-border/50 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <h3 className="font-bold text-sm text-card-foreground">
              Course Attendance Breakdown
            </h3>
            <Link to="/student/attendance" className="text-xs text-indigo-600 dark:text-[#6366F1] hover:underline font-semibold">
              More Details
            </Link>
          </div>

          <div className="space-y-3">
            {attendance.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No attendance details available.
              </p>
            ) : (
              attendance.slice(0, 4).map((att, idx) => {
                const pct = att.percentage || 0;
                const statusColor = pct >= 75 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500";
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                      <span className="text-foreground font-semibold">{att.subjectCode}</span>
                      <span>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${statusColor}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div> */}

        {/* Calendar Widget */}
        <div className="lg:col-span-1 p-4 rounded-2xl bg-card border border-border/50 flex justify-center items-start">
          <div className="w-full max-w-[300px]">
            <Calendar />
          </div>
        </div>

      </div>

      <BottomNavBar />
    </div>
  );
}
