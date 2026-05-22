import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../../Services/profile";
import { getResolvedFacultySchedule, getAcademicTerms } from "../../Services/timetable";
import { getAnnouncements } from "../../Services/announcements";
import API from "../../Services/api";
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
  AlertCircle
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-[#6366F1] animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading your faculty workspace...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold">Failed to load Faculty Dashboard</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="scroll-style space-y-6 pb-20">
      
      {/* 1. Welcoming Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 border border-border/50 p-6 rounded-2xl">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-[#6366F1] tracking-wider uppercase">
            Faculty Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Welcome, {profile?.name || "Professor"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your teaching schedule, publish announcements, track attendance, and log course grade submissions.
          </p>
        </div>

        {/* Profile Badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-background border border-border/60 px-3.5 py-1.5 rounded-xl font-medium shadow-sm">
            <span className="text-muted-foreground">ID: </span>
            <span className="font-semibold text-foreground">{profile?.collegeId}</span>
          </div>
          <div className="bg-background border border-border/60 px-3.5 py-1.5 rounded-xl font-medium shadow-sm">
            <span className="text-muted-foreground">Dept: </span>
            <span className="font-semibold text-foreground">{profile?.faculty?.department || "N/A"}</span>
          </div>
          <div className="bg-background border border-border/60 px-3.5 py-1.5 rounded-xl font-medium shadow-sm">
            <span className="text-muted-foreground">Designation: </span>
            <span className="font-semibold text-foreground">{profile?.faculty?.designation || "Faculty"}</span>
          </div>
        </div>
      </div>

      {/* 2. Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Courses */}
        <Link 
          to="/faculty/courses" 
          className="group block p-5 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/40 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-[#6366F1] transition-colors">
              Active Courses
            </span>
            <BookOpen className="w-5 h-5 text-indigo-500 dark:text-[#6366F1] opacity-80" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">
            {sections.length || "—"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Assigned course sections
          </p>
        </Link>

        {/* Today's Lectures */}
        <Link 
          to="/faculty/schedule" 
          className="group block p-5 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/40 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-[#6366F1] transition-colors">
              Today's Lectures
            </span>
            <Calendar className="w-5 h-5 text-indigo-500 dark:text-[#6366F1] opacity-80" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">
            {todayLectures.length}
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Scheduled lecture slots
          </p>
        </Link>

        {/* Pending Grading */}
        <Link 
          to="/faculty/gradebook" 
          className="group block p-5 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/40 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-[#6366F1] transition-colors">
              Pending Grading
            </span>
            <FileText className="w-5 h-5 text-indigo-500 dark:text-[#6366F1] opacity-80" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">
            3
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Submissions needing review
          </p>
        </Link>

        {/* Students Assigned */}
        <Link 
          to="/faculty/students" 
          className="group block p-5 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/40 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-[#6366F1] transition-colors">
              Students Assigned
            </span>
            <GraduationCap className="w-5 h-5 text-indigo-500 dark:text-[#6366F1] opacity-80" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">
            120
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Across enrolled batches
          </p>
        </Link>

      </div>

      {/* 3. Below Metrics Row Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Schedule Preview */}
        <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Lectures Today
            </h3>
            <Link to="/faculty/schedule" className="text-xs text-indigo-600 dark:text-[#6366F1] hover:underline font-semibold flex items-center">
              Full Timetable <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {todayLectures.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No lectures scheduled for today.
              </p>
            ) : (
              todayLectures.map((lec, idx) => (
                <div key={idx} className="p-3 bg-background/50 border border-border/45 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-foreground">
                      {lec.subjectName}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                      {lec.roomName || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
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

        {/* Attendance Session Preview */}
        <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Attendance Session
            </h3>
            <Link to="/faculty/students" className="text-xs text-indigo-600 dark:text-[#6366F1] hover:underline font-semibold flex items-center">
              Configure <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col justify-center items-center py-6 text-center space-y-4">
            {activeSession ? (
              <div className="w-full space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-semibold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active check-in session
                </div>
                <div className="p-3 bg-background/50 border border-border/40 rounded-xl text-left">
                  <p className="text-xs font-semibold text-foreground truncate">
                    Section ID: {activeSession.sectionId}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Latitude: {activeSession.latitude} / Longitude: {activeSession.longitude}
                  </p>
                </div>
                <button 
                  onClick={() => navigate("/faculty/students")}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
                >
                  View Checked-In Students
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                  No active TOTP check-in running. Create a dynamic verification session to log student attendance.
                </p>
                <button 
                  onClick={() => navigate("/faculty/students")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
                >
                  Start New Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notices & Announcements */}
        <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              Notices
            </h3>
            <Link to="/faculty/gradebook" className="text-xs text-indigo-600 dark:text-[#6366F1] hover:underline font-semibold flex items-center">
              New Notice <Plus className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {announcements.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No active notices in the system.
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

      </div>

      {/* 4. Quick Actions / Navigation Links */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-4">
        <h3 className="font-bold text-sm text-card-foreground">
          Quick Link Operations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/faculty/courses"
            className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/60 hover:border-indigo-500/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Course Dashboard</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Manage course syllabus & terms</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link
            to="/faculty/students"
            className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/60 hover:border-indigo-500/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Attendance Sessions</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">TOTP validation & Student check-in</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link
            to="/faculty/gradebook"
            className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/60 hover:border-indigo-500/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Grade Book Publisher</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Grade releases & announcements</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </div>

    </div>
  );
}
