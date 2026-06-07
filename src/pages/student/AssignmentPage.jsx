import React, { useState, useEffect } from "react";
import { getProfile } from "../../Services/profile";
import { getAttendanceSummary } from "../../Services/attendance";
import { getAssignmentsForSection, getAcademicTerms } from "../../Services/timetable";
import {
  Compass,
  Calendar,
  CheckSquare,
  HardDrive,
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  User,
  GraduationCap,
  Sparkles
} from "lucide-react";

export default function AssignmentPage() {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [launchingId, setLaunchingId] = useState(null);

  useEffect(() => {
    async function loadLaunchpadData() {
      setLoading(true);
      setError(null);
      try {
        const collegeId = localStorage.getItem("collegeId");
        if (!collegeId) {
          throw new Error("No user college ID found. Please log in again.");
        }

        // 1. Fetch Profile to get Section
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

        // 3. Fetch Assignments for this Section
        if (sectionId) {
          try {
            const termsRes = await getAcademicTerms();
            const currentTerm = termsRes.data?.[0] || "SPRING_2026";
            const assignRes = await getAssignmentsForSection(sectionId, currentTerm);
            setAssignments(assignRes.data || []);
          } catch (e) {
            console.error("Failed to load assignments:", e);
          }
        }
      } catch (err) {
        console.error("Failed to load launchpad data:", err);
        setError(err.message || "Failed to load academic launchpad.");
      } finally {
        setLoading(false);
      }
    }

    loadLaunchpadData();
  }, []);

  // Returns the Google URL with path.
  const getGoogleUrl = (baseUrl, path = "") => {
    return `${baseUrl}${path}`;
  };

  // Triggers the premium launcher micro-interaction (0.5s pause with spinner)
  const handleLaunch = (id, url) => {
    if (!url) return;
    setLaunchingId(id);
    setTimeout(() => {
      window.open(url, "_blank");
      setLaunchingId(null);
    }, 500);
  };

  // Helper to find attendance percentage for a subject code
  const getSubjectAttendance = (subjectCode) => {
    if (!subjectCode) return null;
    const match = attendance.find(
      (a) => a.subjectCode?.toLowerCase() === subjectCode.toLowerCase()
    );
    return match ? match.percentage : null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <Loader2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Opening your academic launchpad...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold">Launchpad Unavailable</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 p-6 -mt-6 -mx-6 -mb-6 w-[calc(100%+3rem)] min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#E0F2FE] via-[#F1F5F9] to-[#FCE7F3] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-300 text-foreground overflow-y-auto text-left">

      {/* Visual Enhancers */}
      <style>{`
        .glass-hud-btn {
          @apply relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }
        .dark .glass-hud-btn {
          background: rgba(39, 39, 42, 0.45);
          border: 1px solid rgba(63, 63, 70, 0.4);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .glass-hud-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
          background: rgba(255, 255, 255, 0.7);
        }
        .dark .glass-hud-btn:hover {
          background: rgba(39, 39, 42, 0.7);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }
        .dark .glass-card {
          background: rgba(24, 24, 27, 0.6);
          border: 1px solid rgba(63, 63, 70, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .launch-btn-pulse {
          position: relative;
          overflow: hidden;
        }
        .launch-btn-pulse::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
        }
        .launch-btn-pulse:hover::after {
          transform: translateX(100%);
          transition: transform 0.6s ease;
        }
      `}</style>

      {/* Header Info */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} /> Smart Academic Hub
          </span>
          <h1 className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">
            Academic Launcher
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
            Access Google Classroom workspaces and universal tools connected directly to your enrolled courses.
          </p>
        </div>
      </section>

      {/* Global HUD Top Bar */}
      <section className="bg-white/30 dark:bg-zinc-900/30 p-4 rounded-3xl backdrop-blur-md border border-white/20 dark:border-zinc-800/30">
        <h2 className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3 ml-2">
          Universal Workspaces
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleLaunch("google-classroom-home", getGoogleUrl("https://classroom.google.com"))}
            className="glass-hud-btn text-gray-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Compass className="w-4 h-4 text-emerald-500" />
            Classroom Home
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={() => handleLaunch("google-to-do", getGoogleUrl("https://classroom.google.com", "/to-do"))}
            className="glass-hud-btn text-gray-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <CheckSquare className="w-4 h-4 text-blue-500" />
            Global To-Do List
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={() => handleLaunch("google-drive", "https://drive.google.com")}
            className="glass-hud-btn text-gray-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-500"
          >
            <HardDrive className="w-4 h-4 text-amber-500" />
            Google Drive
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={() => handleLaunch("google-calendar", "https://calendar.google.com")}
            className="glass-hud-btn text-gray-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <Calendar className="w-4 h-4 text-rose-500" />
            Google Calendar
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </button>
        </div>
      </section>

      {/* Main Grid (Subject Cards) */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">
          Connected Course Classrooms
        </h2>

        {assignments.length === 0 ? (
          <div className="glass-card rounded-[2rem] p-12 text-center flex flex-col items-center justify-center">
            <GraduationCap className="w-12 h-12 text-gray-300 dark:text-zinc-600 mb-3 animate-pulse" />
            <h3 className="text-base font-semibold text-gray-700 dark:text-zinc-300">No Connected Courses</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 max-w-xs">
              No classroom assignments are configured for your section in this term yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((card) => {
              const attVal = getSubjectAttendance(card.subjectCode);
              const hasLink = !!card.googleClassroomLink;

              // Color determination for attendance badge
              let badgeColor = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400";
              let badgeLabel = "No Attendance";
              if (attVal !== null) {
                if (attVal >= 75) {
                  badgeColor = "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20";
                  badgeLabel = `${attVal.toFixed(0)}% • Safe`;
                } else if (attVal >= 60) {
                  badgeColor = "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/20";
                  badgeLabel = `${attVal.toFixed(0)}% • Low`;
                } else {
                  badgeColor = "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/20";
                  badgeLabel = `${attVal.toFixed(0)}% • Critical`;
                }
              }

              const isLaunching = launchingId === card.id;

              return (
                <div
                  key={card.id}
                  className="glass-card rounded-[2.5rem] p-6 flex flex-col justify-between hover:scale-[1.01] hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
                >
                  {/* Glowing hover light */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500 pointer-events-none" />

                  <div className="space-y-4">
                    {/* Top badging */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                        {card.subjectCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                    </div>

                    {/* Class/Subject Title */}
                    <div>
                      <h3 className="font-medium text-lg text-gray-800 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                        {card.subjectName}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1.5 mt-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        Taught by: {card.facultyName || "Faculty Instructor"}
                      </p>
                    </div>
                  </div>

                  {/* Launch button area */}
                  <div className="mt-8">
                    {hasLink ? (
                      <button
                        onClick={() => handleLaunch(card.id, getGoogleUrl(card.googleClassroomLink))}
                        disabled={isLaunching}
                        className={`w-full py-3.5 px-4 rounded-[1.5rem] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 border launch-btn-pulse transition-all duration-300 ${isLaunching
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 scale-95"
                          : "bg-emerald-600 dark:bg-emerald-500 text-white border-transparent hover:translate-y-[-2px] hover:shadow-md active:scale-95"
                          }`}
                      >
                        {isLaunching ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                            Connecting Workspace...
                          </>
                        ) : (
                          <>
                            Open Classroom
                            <ExternalLink className="w-4 h-4 opacity-80" />
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="w-full py-3.5 px-4 rounded-[1.5rem] border border-gray-200/20 dark:border-zinc-800/40 bg-gray-100/50 dark:bg-zinc-900/40 text-center select-none">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                          Link not configured
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                          Ask faculty to connect their classroom.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}