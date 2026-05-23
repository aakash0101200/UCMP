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
import { Zap, Loader2 } from 'lucide-react';
import { getAnnouncements, getSectionAnnouncements, getStudentAnnouncements } from '../../Services/announcements';

const getSafeReadNotificationIds = () => {
  try {
    const stored = localStorage.getItem('readNotificationIds');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Ensure the data inside is actually an array before returning it
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse readNotificationIds from localStorage:", error);
    // Clear the corrupted data so it doesn't break future sessions
    localStorage.removeItem('readNotificationIds');
    return [];
  }
};

export default function DashboardLayout({ children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [activeRole, setActiveRoleState] = useState(getActiveRole());
  const [activeSession, setActiveSession] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const sectionId = localStorage.getItem('sectionId');

  // Fetch initial announcements/notifications history
  const fetchAnnouncements = useCallback(async () => {
    try {
      let res;
      if (activeRole?.toLowerCase() === 'student') {
        const studentSecId = profile?.student?.sectionId || localStorage.getItem('sectionId');
        const collegeId = profile?.collegeId || localStorage.getItem('collegeId');
        if (studentSecId && collegeId) {
          res = await getStudentAnnouncements(collegeId, studentSecId);
        } else if (studentSecId) {
          res = await getSectionAnnouncements(studentSecId);
        } else {
          res = await getAnnouncements();
        }
      } else {
        res = await getAnnouncements();
      }

      if (res && res.data) {
        const readIds = getSafeReadNotificationIds();
        const mapped = res.data.map(item => {
          const id = item.id || item.announcementId;
          return {
            ...item,
            isRead: readIds.includes(id)
          };
        });
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    }
  }, [activeRole, profile]);

  useEffect(() => {
    if (profile && activeRole) {
      fetchAnnouncements();
    }
  }, [profile, activeRole, fetchAnnouncements]);

  // Subscribe to real-time global notifications
  useWebSocket('/topic/notifications/global', (newNotif) => {
    console.log('Received global notification:', newNotif);
    const id = newNotif.id || newNotif.announcementId;
    const readIds = getSafeReadNotificationIds();
    setNotifications(prev => {
      if (prev.some(x => (x.id || x.announcementId) === id)) return prev;
      return [{ ...newNotif, isRead: readIds.includes(id) }, ...prev];
    });
    toast.info(`Announcement: ${newNotif.title}`);
  });

  // Dynamic configuration for student topic strings
  const studentSecId = profile?.student?.sectionId || localStorage.getItem('sectionId');
  const sectionNotificationTopic = (activeRole?.toLowerCase() === 'student' && studentSecId) 
    ? `/topic/notifications/section/${studentSecId}` 
    : null;

  const collegeId = profile?.collegeId || localStorage.getItem('collegeId');
  const studentNotificationTopic = (activeRole?.toLowerCase() === 'student' && collegeId)
    ? `/topic/notifications/student/${collegeId}`
    : null;

  // Subscribe to real-time section notifications (students only)
  useWebSocket(sectionNotificationTopic, (newNotif) => {
    console.log('Received section notification:', newNotif);
    const id = newNotif.id || newNotif.announcementId;
    const readIds = getSafeReadNotificationIds();
    setNotifications(prev => {
      if (prev.some(x => (x.id || x.announcementId) === id)) return prev;
      return [{ ...newNotif, isRead: readIds.includes(id) }, ...prev];
    });
    
    if (newNotif.type === 'TIMETABLE') {
      toast.error(`Class Cancellation Alert: ${newNotif.title}`);
    } else if (newNotif.type === 'ATTENDANCE_SESSION') {
      toast.success(`Attendance Session Started: ${newNotif.title}`);
    } else if (newNotif.type === 'SCHEDULE') {
      toast.info(`Schedule Update: ${newNotif.title}`);
    } else if (newNotif.type === 'SCHEDULE_OVERRIDE') {
      toast.warning(`⚡ Schedule Override: ${newNotif.title}`);
    } else {
      toast.info(`New Section Alert: ${newNotif.title}`);
    }
  });

  // Subscribe to real-time user-specific notifications
  useWebSocket(studentNotificationTopic, (newNotif) => {
    console.log('Received student-specific notification:', newNotif);
    const id = newNotif.id || newNotif.announcementId;
    const readIds = getSafeReadNotificationIds();
    setNotifications(prev => {
      if (prev.some(x => (x.id || x.announcementId) === id)) return prev;
      return [{ ...newNotif, isRead: readIds.includes(id) }, ...prev];
    });
    if (newNotif.type === 'ATTENDANCE_WARNING') {
      toast.error(`Attendance Warning: ${newNotif.title}`);
    } else {
      toast.info(`Personal Alert: ${newNotif.title}`);
    }
  });

  const handleMarkRead = useCallback((id) => {
    const readIds = getSafeReadNotificationIds();
    if (!readIds.includes(id)) {
      const updatedReadIds = [...readIds, id];
      localStorage.setItem('readNotificationIds', JSON.stringify(updatedReadIds));
    }
    setNotifications(prev =>
      prev.map(n => ((n.id || n.announcementId) === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    const readIds = getSafeReadNotificationIds();
    const readSet = new Set(readIds);

    notifications.forEach(n => {
      const id = n.id || n.announcementId;
      readSet.add(id);
    });

    const updatedReadIds = Array.from(readSet);
    localStorage.setItem('readNotificationIds', JSON.stringify(updatedReadIds));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, [notifications]);

  // Subscribe to real-time attendance session channels
  const wsTopic = (activeRole?.toLowerCase() === 'student' && sectionId) ? `/topic/session/${sectionId}` : null;

  useWebSocket(wsTopic, (event) => {
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
  });

  // Subscribe to real-time class cancellations
  const wsCancellationTopic = (activeRole?.toLowerCase() === 'student' && sectionId) ? `/topic/cancellation/${sectionId}` : null;

  useWebSocket(wsCancellationTopic, (event) => {
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
  });

  // Poll for already-active sessions on layout mount
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
  
  // Fetch full core profile
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

  // Handle active dashboard cross-role boundary security redirect paths
  useEffect(() => {
    if (activeRole) {
      const pathRole = location.pathname.split('/')[1];
      if (pathRole && pathRole !== activeRole.toLowerCase()) {
        navigate(`/${activeRole.toLowerCase()}`);
        toast.info(`Redirecting to ${activeRole.toLowerCase()} dashboard.`);
      }
    }
  }, [activeRole, location.pathname, navigate]);

  const handleRoleSwitch = (newRole) => {
    setActiveRole(newRole);
    setActiveRoleState(newRole);
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-indigo-600 dark:text-[#6366F1] animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse mt-4">
            Loading academic profile...
          </p>
        </div>
      </div>
    );
  }
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background transition-colors duration-300">
        <AppSidebar
          userName={profile.name}
          userRole={activeRole?.toLowerCase()}
          onLogout={onLogout}
        />

        <SidebarInset className="flex-1 transition-colors duration-300">
          {profile.collegeId?.toUpperCase().startsWith("DEMO_") && (
            <div className="bg-indigo-600 dark:bg-indigo-900 text-white px-4 py-2 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md z-50">
              <Zap className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Running in Demo Mode (Read-Only) — Database modifications and writes are disabled.</span>
            </div>
          )}
          <DashboardNavBar 
            profile={profile}
            onLogout={onLogout}
            onRoleSwitch={handleRoleSwitch}
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />

          <main className="flex-1 space-y-4 p-6 bg-sidebar/70 transition-colors duration-300">
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