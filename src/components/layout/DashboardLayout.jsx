import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppSidebar } from '../navigation/AppSidebar';
import DashboardNavBar from '../navigation/DashboardNavBar';
import { getProfile } from "../../Services/profile.js";
import { getActiveRole, setActiveRole } from "../../Services/auth.js";
import { toast } from 'react-toastify';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getActiveSession } from '../../Services/attendance';
import { Zap } from 'lucide-react';

export default function DashboardLayout({children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [activeRole, setActiveRoleState] = useState(getActiveRole());
  const [activeSession, setActiveSession] = useState(null);

  // Subscribe to real-time session start/end notifications
  const sectionId = localStorage.getItem('sectionId');
  const wsTopic = (activeRole?.toLowerCase() === 'student' && sectionId) ? `/topic/session/${sectionId}` : null;

  useWebSocket(
    wsTopic,
    useCallback((event) => {
      console.log('Layout received session event via WebSocket:', event);
      if (event.sessionId) {
        if (event.startTime) {
          setActiveSession({
            id: event.sessionId,
            subjectName: event.subjectName,
            subjectCode: event.subjectCode
          });
          toast.info(`Attendance session started: ${event.subjectName}`);
        } else {
          setActiveSession(null);
          toast.warn('Attendance session has ended.');
        }
      }
    }, [])
  );

  // Subscribe to real-time class cancellations
  const wsCancellationTopic = (activeRole?.toLowerCase() === 'student' && sectionId) ? `/topic/cancellation/${sectionId}` : null;

  useWebSocket(
    wsCancellationTopic,
    useCallback((event) => {
      console.log('Layout received class cancellation event via WebSocket:', event);
      toast.error(
        <div className="text-left">
          <span className="font-bold text-red-400 block mb-1">⚠️ Class Cancelled!</span>
          <p className="text-xs text-white">
            <strong>{event.subjectName}</strong> ({event.subjectCode}) on {event.cancellationDate} at {event.timeSlot} is cancelled.
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 italic">Reason: "{event.reason}"</p>
        </div>,
        { autoClose: 10000 }
      );
    }, [])
  );

  // Poll for already-active session on load/role change
  useEffect(() => {
    if (activeRole?.toLowerCase() === 'student') {
      getActiveSession()
        .then(r => {
          if (r.data) {
            setActiveSession({
              id: r.data.id,
              subjectName: r.data.subjectName,
              subjectCode: r.data.subjectCode
            });
          } else {
            setActiveSession(null);
          }
        })
        .catch(() => setActiveSession(null));
    } else {
      setActiveSession(null);
    }
  }, [activeRole]);
  
  // This useEffect fetches the full profile when the component mounts or the active role changes.
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const collegeId = localStorage.getItem('collegeId');
        if (!collegeId) {
          throw new Error("College ID not found in local storage.");
        }
        const response = await getProfile(collegeId);
        setProfile(response.data);
        if (response.data.student && response.data.student.sectionId) {
          localStorage.setItem('sectionId', response.data.student.sectionId);
        } else {
          localStorage.removeItem('sectionId');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        onLogout();
      }
    };
    
    if (activeRole) {
      fetchUserProfile();
    } else {
      navigate('/login');
    }
  }, [activeRole, navigate, onLogout]);

  // This useEffect ensures the user is on the correct dashboard route for their active role.
  useEffect(() => {
    if (activeRole) {
      const pathRole = location.pathname.split('/')[1];
      if (pathRole && pathRole !== activeRole.toLowerCase()) {
        navigate(`/${activeRole.toLowerCase()}`);
        toast.info(`Redirecting to ${activeRole.toLowerCase()} dashboard.`);
      }
    }
  }, [activeRole, location.pathname, navigate]);

  // Handler for role switching, which updates both local state and persistent storage.
  const handleRoleSwitch = (newRole) => {
    setActiveRole(newRole);
    setActiveRoleState(newRole);
  };

  // Do not render the content until the profile is loaded to prevent errors.
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading user profile...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          userName={profile.name}
          userRole={activeRole?.toLowerCase()}
          onLogout={onLogout}
        />

        <SidebarInset className="flex-1">
          <DashboardNavBar 
            profile={profile}
            onLogout={onLogout}
            onRoleSwitch={handleRoleSwitch}
            notificationCount={3}
          />

          <main className="flex-1 space-y-4 p-6 bg-sidebar/70">
            {activeSession && (
              <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg backdrop-blur-sm animate-pulse text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                  <Zap className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-white">Active Attendance Session</span>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      Class {activeSession.subjectCode ? `[${activeSession.subjectCode}] ${activeSession.subjectName}` : activeSession.subjectName} is currently marking attendance.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/student/attendance')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-lg shadow-indigo-500/20"
                >
                  Verify Attendance
                </button>
              </div>
            )}
            {children}
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}