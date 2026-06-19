import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
  useColorScheme,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Device from 'expo-device';

// Utility helper to resolve or generate a unique device ID
const resolveDeviceId = async (): Promise<string> => {
  let devId = await AsyncStorage.getItem('deviceId');
  if (!devId) {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const model = Device.modelName ? Device.modelName.replace(/\s+/g, '') : 'UnknownDevice';
    devId = `${model}_${Device.osBuildId || randomSuffix}`;
    await AsyncStorage.setItem('deviceId', devId);
  }
  return devId;
};

// Types
import {
  ActiveSession,
  Section,
  Subject,
  RosterRecord,
  TimetableSlot,
  SubjectAttendance,
  Assignment,
  Announcement
} from '../types';

// Layout Elements
import DashboardHeader from '../components/layout/DashboardHeader';
import SidebarDrawer from '../components/layout/SidebarDrawer';
import BottomNavBar from '../components/layout/BottomNavBar';

// Shared Views
import LoginView from '../components/shared/LoginView';
import ScheduleView from '../components/shared/ScheduleView';

// Student Views
import StudentDashboardView from '../components/student/StudentDashboardView';
import StudentAttendanceView from '../components/student/StudentAttendanceView';
import StudentAssignmentsView from '../components/student/StudentAssignmentsView';

// Faculty Views
import FacultyLaunchView from '../components/faculty/FacultyLaunchView';
import FacultySectionsView from '../components/faculty/FacultySectionsView';

// Services
import API from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

export default function App() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [activeRole, setActiveRole] = useState<'STUDENT' | 'FACULTY' | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sidebar Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerTranslateX = useRef(new Animated.Value(-280)).current;

  // Login Form States
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Shared Data States
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<TimetableSlot[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [activeDay, setActiveDay] = useState<string>('MONDAY');

  // Announcements Notices
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  // Student Profile Data
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [studentAttendanceSummary, setStudentAttendanceSummary] = useState<SubjectAttendance[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>([]);
  const [subjectsExpanded, setSubjectsExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  // Student Attendance Form States
  const [passcode, setPasscode] = useState('');
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);
  const otpInputRef = useRef<any>(null);

  // Faculty Specific States
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [duration, setDuration] = useState(40);
  const [radius, setRadius] = useState(50);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [facultyRoster, setFacultyRoster] = useState<RosterRecord[]>([]);
  const [rotatingCode, setRotatingCode] = useState('');
  
  const durationOptions = [30, 40, 50, 60, 90, 120];
  const radiusOptions = [10, 20, 50, 100, 200, 500];

  // Selection Modals for Faculty
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [radiusModalVisible, setRadiusModalVisible] = useState(false);

  // Info Banners
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');

  const codePollInterval = useRef<any>(null);
  const rosterPollInterval = useRef<any>(null);

  // Monitor Auth on boot
  useEffect(() => {
    checkAuthState();
    return () => {
      clearFacultyTimers();
    };
  }, []);

  // Handle Faculty Live Polls
  useEffect(() => {
    if (isAuthenticated && activeRole === 'FACULTY' && activeSession) {
      startFacultyPolling(activeSession.id);
    } else {
      clearFacultyTimers();
    }
  }, [activeSession, activeRole, isAuthenticated]);

  // Load schedule when tab changes or section/facultyId loads
  useEffect(() => {
    if (isAuthenticated) {
      if (activeRole === 'STUDENT' && sectionId && activeTab === 'schedule') {
        loadStudentSchedule(sectionId);
      } else if (activeRole === 'FACULTY' && facultyId && activeTab === 'schedule') {
        loadFacultySchedule(facultyId);
      }
    }
  }, [activeTab, sectionId, facultyId, isAuthenticated]);

  const toggleDrawer = (open: boolean) => {
    setIsDrawerOpen(open);
    Animated.timing(drawerTranslateX, {
      toValue: open ? 0 : -280,
      duration: 250,
      useNativeDriver: true
    }).start();
  };

  const startFacultyPolling = (sessionId: number) => {
    clearFacultyTimers();
    fetchFacultySessionCode(sessionId);
    fetchFacultyRoster(sessionId);

    codePollInterval.current = setInterval(() => {
      fetchFacultySessionCode(sessionId);
    }, 15000);

    rosterPollInterval.current = setInterval(() => {
      fetchFacultyRoster(sessionId);
    }, 10000);
  };

  const clearFacultyTimers = () => {
    if (codePollInterval.current) clearInterval(codePollInterval.current);
    if (rosterPollInterval.current) clearInterval(rosterPollInterval.current);
  };

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedName = await AsyncStorage.getItem('userName');
      const storedCollegeId = await AsyncStorage.getItem('collegeId');
      const storedRole = await AsyncStorage.getItem('activeRole') as 'STUDENT' | 'FACULTY' | null;
      const storedRoles = await AsyncStorage.getItem('availableRoles');

      if (storedToken) {
        setToken(storedToken);
        setUserName(storedName || 'User');
        setCollegeId(storedCollegeId || '');
        setActiveRole(storedRole);
        setIsAuthenticated(true);
        setActiveTab(storedRole === 'FACULTY' ? 'launch' : 'dashboard');
        
        if (storedRoles) {
          setAvailableRoles(JSON.parse(storedRoles));
        }

        fetchActiveSession(storedRole);
        loadUserProfile(storedCollegeId || '', storedRole);
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    }
  };

  const loadUserProfile = async (cId: string, role: 'STUDENT' | 'FACULTY' | null) => {
    try {
      const resp = await API.get(`/profile?collegeId=${cId}`);
      const prof = resp.data;
      
      const rolesList = prof.roles || (role ? [role] : ['STUDENT']);
      setAvailableRoles(rolesList);
      await AsyncStorage.setItem('availableRoles', JSON.stringify(rolesList));

      if (role === 'STUDENT' && prof.student) {
        const sId = prof.student.sectionId;
        setSectionId(sId);
        loadStudentAttendanceData();
        loadStudentAssignments(sId);
        loadAnnouncements(cId, sId, 'STUDENT');
      } else if (role === 'FACULTY' && prof.faculty) {
        setFacultyId(prof.faculty.facultyId);
        fetchFacultyMetadata();
        loadAnnouncements(cId, 0, 'FACULTY');
      }
    } catch (e: any) {
      console.warn('Failed to fetch detailed profile:', e.message);
    }
  };

  const loadAnnouncements = async (cId: string, sId: number, role: 'STUDENT' | 'FACULTY') => {
    setIsLoadingAnnouncements(true);
    try {
      let annResp;
      if (role === 'STUDENT') {
        annResp = await API.get(`/announcements/student/${cId}/section/${sId}`);
      } else {
        annResp = await API.get('/announcements/');
      }
      setAnnouncements(annResp.data || []);
    } catch (err: any) {
      console.warn('Failed to load announcements:', err.message);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  const loadStudentAttendanceData = async () => {
    try {
      const summaryResp = await API.get('/attendance/my-summary');
      setStudentAttendanceSummary(summaryResp.data || []);
      
      const historyResp = await API.get('/attendance/my-history');
      setAttendanceLogs(historyResp.data || []);
    } catch (e: any) {
      console.warn('Failed to load student attendance:', e.message);
    }
  };

  const loadStudentAssignments = async (sId: number) => {
    try {
      const assignmentsResp = await API.get(`/timetable/assignment/section/${sId}?term=2026-27-ODD`);
      const list = assignmentsResp.data || [];
      const formatted = list.map((a: any, index: number) => ({
        id: a.id?.toString() || index.toString(),
        title: a.googleClassroomLink ? "Review classroom assignment" : "Weekly problem sheet",
        subjectName: a.subjectName || "Subject Class",
        dueDate: "2026-06-30",
        priority: index % 2 === 0 ? 'high' : 'medium'
      }));
      setAssignmentsList(formatted);
    } catch (e) {
      console.warn('Failed to load assignments');
    }
  };

  const loadStudentSchedule = async (sId: number) => {
    setIsLoadingSchedule(true);
    try {
      const res = await API.get(`/timetable/section/${sId}?term=2026-27-ODD`);
      setWeeklySchedule(res.data || []);
    } catch (e) {
      console.warn('Failed to load weekly schedule');
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const loadFacultySchedule = async (fId: number) => {
    setIsLoadingSchedule(true);
    try {
      const res = await API.get(`/timetable/faculty/${fId}?term=2026-27-ODD`);
      setWeeklySchedule(res.data || []);
    } catch (e) {
      console.warn('Failed to load faculty schedule');
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const handleLogin = async () => {
    if (!loginId || !password) {
      Alert.alert('Missing Fields', 'Please enter both College ID and Password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const deviceId = await resolveDeviceId();
      const response = await API.post('/auth/login', {
        collegeId: loginId,
        password: password,
        deviceId: deviceId
      });

      if (response.data && response.data.token) {
        const { token: jwtToken, profile } = response.data;
        const role: 'STUDENT' | 'FACULTY' = profile.roles.includes('FACULTY') ? 'FACULTY' : 'STUDENT';
        const rolesList = profile.roles || [role];

        await AsyncStorage.setItem('token', jwtToken);
        await AsyncStorage.setItem('collegeId', profile.collegeId);
        await AsyncStorage.setItem('userName', profile.name || '');
        await AsyncStorage.setItem('activeRole', role);
        await AsyncStorage.setItem('availableRoles', JSON.stringify(rolesList));
        
        setToken(jwtToken);
        setUserName(profile.name || 'User');
        setCollegeId(profile.collegeId);
        setActiveRole(role);
        setAvailableRoles(rolesList);
        setIsAuthenticated(true);
        setActiveTab(role === 'FACULTY' ? 'launch' : 'dashboard');
        
        setLoginId('');
        setPassword('');
        
        fetchActiveSession(role);
        loadUserProfile(profile.collegeId, role);
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Login failed';
      Alert.alert('Authentication Failed', errMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await API.post('/auth/logout');
            } catch (e: any) {
              console.warn('Backend logout failed:', e?.message);
            }
            clearFacultyTimers();
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('collegeId');
            await AsyncStorage.removeItem('userName');
            await AsyncStorage.removeItem('activeRole');
            await AsyncStorage.removeItem('availableRoles');
            setIsAuthenticated(false);
            setToken(null);
            setActiveRole(null);
            setAvailableRoles([]);
            setActiveSession(null);
            setStatusMessage(null);
            setPasscode('');
            setRotatingCode('');
            setFacultyRoster([]);
            setSelectedSection(null);
            setSelectedSubject(null);
            setStudentAttendanceSummary([]);
            setWeeklySchedule([]);
            setAnnouncements([]);
          }
        }
      ]
    );
  };

  const handleRoleSwitch = async (newRole: 'STUDENT' | 'FACULTY') => {
    await AsyncStorage.setItem('activeRole', newRole);
    setActiveRole(newRole);
    setActiveTab(newRole === 'FACULTY' ? 'launch' : 'dashboard');
    fetchActiveSession(newRole);
    loadUserProfile(collegeId, newRole);
  };

  const fetchActiveSession = async (roleOverride?: 'STUDENT' | 'FACULTY' | null) => {
    setIsLoadingSession(true);
    setStatusMessage(null);
    try {
      const response = await API.get('/attendance/active-session');
      if (response.status === 200 && response.data) {
        setActiveSession(response.data);
      } else {
        setActiveSession(null);
      }
    } catch (err: any) {
      console.warn('Failed to retrieve active session:', err?.message);
      setActiveSession(null);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const fetchFacultyMetadata = async () => {
    try {
      const sectionsResp = await API.get('/faculty/my-sections');
      setSections(sectionsResp.data || []);
      
      const assignmentsResp = await API.get('/timetable/assignment/my?term=2026-27-ODD');
      const assignments = assignmentsResp.data || [];
      const mappedSubjects = assignments.map((a: any) => ({
        id: a.subjectId,
        subjectCode: a.subjectCode,
        subjectName: a.subjectName,
        sectionId: a.sectionId
      }));
      setSubjects(mappedSubjects);
    } catch (e: any) {
      console.error('Failed to load faculty metadata:', e.message);
    }
  };

  const fetchFacultySessionCode = async (sessionId: number) => {
    try {
      const codeResp = await API.get(`/attendance/session/${sessionId}/code`);
      setRotatingCode(codeResp.data);
    } catch (e: any) {
      console.warn('Failed to load rotating code:', e.message);
    }
  };

  const fetchFacultyRoster = async (sessionId: number) => {
    try {
      const rosterResp = await API.get(`/attendance/session/${sessionId}/records`);
      setFacultyRoster(rosterResp.data || []);
    } catch (e: any) {
      console.warn('Failed to load roster records:', e.message);
    }
  };

  const startFacultySession = async () => {
    if (!selectedSection) {
      Alert.alert('Selection Required', 'Please select a Section.');
      return;
    }
    if (!selectedSubject) {
      Alert.alert('Selection Required', 'Please select a Subject.');
      return;
    }

    setIsStartingSession(true);
    showStatus('Registering teacher coordinates...', 'info');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showStatus('Location permission is required to lock session presence.', 'error');
        setIsStartingSession(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;

      const startResp = await API.post('/attendance/start', {
        sectionId: selectedSection.id,
        subjectId: selectedSubject.id,
        durationInMinutes: duration,
        radiusInMeters: radius,
        latitude,
        longitude
      });

      if (startResp.data && startResp.data.id) {
        await fetchActiveSession();
        showStatus('Class session started successfully!', 'success');
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'Failed to start session';
      showStatus(msg, 'error');
    } finally {
      setIsStartingSession(false);
    }
  };

  const endFacultySession = async () => {
    if (!activeSession) return;
    Alert.alert(
      'End Class Session',
      'Are you sure you want to end this attendance session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await API.post(`/attendance/session/${activeSession.id}/end`);
              clearFacultyTimers();
              setActiveSession(null);
              setRotatingCode('');
              setFacultyRoster([]);
              showStatus('Session ended by instructor.', 'info');
            } catch (e: any) {
              Alert.alert('Error', 'Failed to end session.');
            }
          }
        }
      ]
    );
  };



  const submitAttendance = async () => {
    if (!activeSession) {
      showStatus('No active lecture found for your section.', 'error');
      return;
    }
    if (passcode.length !== 6) {
      showStatus('Please enter the 6-digit TOTP code shown on the screen.', 'error');
      return;
    }

    setIsSubmittingAttendance(true);
    showStatus('Verifying location and passcode...', 'info');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showStatus('Location permission is required to verify class attendance.', 'error');
        setIsSubmittingAttendance(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude, accuracy } = location.coords;
      const deviceId = await resolveDeviceId();

      await API.post('/attendance/mark', {
        sessionId: activeSession.id,
        code: passcode,
        latitude,
        longitude,
        accuracy,
        deviceFingerprint: deviceId
      });

      showStatus('Attendance marked successfully! 🎉', 'success');
      setPasscode('');
      loadStudentAttendanceData();
    } catch (err: any) {
      const errorMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : (err.response?.data?.message || err.message || 'Verification failed');
      showStatus(errorMsg, 'error');
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  const computeOverallAttendance = () => {
    if (studentAttendanceSummary.length === 0) return 0;
    let totalClasses = 0;
    let attended = 0;
    studentAttendanceSummary.forEach(s => {
      totalClasses += s.totalClasses;
      attended += s.attended;
    });
    return totalClasses > 0 ? (attended / totalClasses) * 100 : 0;
  };

  const getStatusColor = (pct: number) => {
    if (pct >= 75) return { ring: '#10B981', text: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'SAFE' };
    if (pct >= 60) return { ring: '#F59E0B', text: '#D97706', bg: 'rgba(245,158,11,0.1)', label: 'WARNING' };
    return { ring: '#EF4444', text: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'CRITICAL' };
  };

  const showStatus = (msg: string, type: 'info' | 'success' | 'error') => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage(null);
    }, 6000);
  };

  // Filtered lists
  const filteredSchedule = weeklySchedule.filter(slot => slot.day.toUpperCase() === activeDay.toUpperCase());
  const filteredSubjects = subjects.filter(sub => selectedSection ? sub.sectionId === selectedSection.id : false);

  // Dynamic values based on active role
  const isFaculty = activeRole === 'FACULTY';
  const activeColor = isFaculty ? '#10B981' : '#6366F1';
  const activeSoftColor = isDark 
    ? (isFaculty ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)')
    : (isFaculty ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)');

  const dynamicStyles = isDark 
    ? (isFaculty ? stylesDarkFaculty : stylesDarkStudent)
    : (isFaculty ? stylesLightFaculty : stylesLightStudent);

  // Sidebar navigation routes config
  const studentMenu = [
    { title: 'Dashboard', tab: 'dashboard', icon: 'home' },
    { title: 'Attendance', tab: 'attendance', icon: 'check-circle' },
    { title: 'Schedule', tab: 'schedule', icon: 'calendar' },
    { title: 'Tasks', tab: 'assignments', icon: 'file-text' }
  ];

  const facultyMenu = [
    { title: 'Launch Session', tab: 'launch', icon: 'rss' },
    { title: 'Schedule', tab: 'schedule', icon: 'calendar' },
    { title: 'Assigned Classes', tab: 'sections', icon: 'users' }
  ];

  const menuItems = isFaculty ? facultyMenu : studentMenu;

  if (!isAuthenticated) {
    return (
      <LoginView 
        loginId={loginId}
        setLoginId={setLoginId}
        password={password}
        setPassword={setPassword}
        isLoggingIn={isLoggingIn}
        activeColor={activeColor}
        isDark={isDark}
        dynamicStyles={dynamicStyles}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Unified top Navbar */}
      <DashboardHeader 
        activeRole={activeRole}
        userName={userName}
        availableRoles={availableRoles}
        activeColor={activeColor}
        isDark={isDark}
        announcementsLength={announcements.length}
        onMenuPress={() => toggleDrawer(true)}
        onRoleSwitch={handleRoleSwitch}
        onNotificationsPress={() => setActiveTab(isFaculty ? 'launch' : 'dashboard')}
      />

      {/* Main content viewport */}
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        
        {/* Active lecture warning banner */}
        {activeSession && !isFaculty && (
          <TouchableOpacity 
            style={[styles.activeSessionAlert, { borderColor: `${activeColor}50` }]}
            onPress={() => setActiveTab('attendance')}
          >
            <View style={styles.alertLeftInfo}>
              <View style={[styles.alertPulseDot, { backgroundColor: activeColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Active Attendance Session Live</Text>
                <Text style={styles.alertSubtitle} numberOfLines={1}>
                  {activeSession.subjectCode} - {activeSession.subjectName} (Verify Attendance Now)
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Tab View Routers */}
        {!isFaculty && activeTab === 'dashboard' && (
          <StudentDashboardView 
            userName={userName}
            collegeId={collegeId}
            studentAttendanceSummary={studentAttendanceSummary}
            weeklyScheduleLength={weeklySchedule.filter(s => s.day === 'MONDAY').length}
            assignmentsList={assignmentsList}
            announcements={announcements}
            isLoadingAnnouncements={isLoadingAnnouncements}
            activeColor={activeColor}
            activeSoftColor={activeSoftColor}
            isDark={isDark}
            dynamicStyles={dynamicStyles}
            setActiveTab={setActiveTab}
            computeOverallAttendance={computeOverallAttendance}
            getStatusColor={getStatusColor}
          />
        )}

        {!isFaculty && activeTab === 'attendance' && (
          <StudentAttendanceView 
            activeSession={activeSession}
            isLoadingSession={isLoadingSession}
            passcode={passcode}
            setPasscode={setPasscode}
            isSubmittingAttendance={isSubmittingAttendance}
            subjectsExpanded={subjectsExpanded}
            setSubjectsExpanded={setSubjectsExpanded}
            historyExpanded={historyExpanded}
            setHistoryExpanded={setHistoryExpanded}
            studentAttendanceSummary={studentAttendanceSummary}
            attendanceLogs={attendanceLogs}
            activeColor={activeColor}
            isDark={isDark}
            dynamicStyles={dynamicStyles}
            otpInputRef={otpInputRef}
            fetchActiveSession={fetchActiveSession}
            submitAttendance={submitAttendance}
            getStatusColor={getStatusColor}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView 
            isLoadingSchedule={isLoadingSchedule}
            filteredSchedule={filteredSchedule}
            activeDay={activeDay}
            activeRole={activeRole}
            activeColor={activeColor}
            activeSoftColor={activeSoftColor}
            isDark={isDark}
            dynamicStyles={dynamicStyles}
            setActiveDay={setActiveDay}
          />
        )}

        {!isFaculty && activeTab === 'assignments' && (
          <StudentAssignmentsView 
            assignmentsList={assignmentsList}
            activeColor={activeColor}
            dynamicStyles={dynamicStyles}
          />
        )}

        {isFaculty && activeTab === 'launch' && (
          <FacultyLaunchView 
            activeSession={activeSession}
            selectedSection={selectedSection}
            selectedSubject={selectedSubject}
            duration={duration}
            radius={radius}
            isStartingSession={isStartingSession}
            facultyRoster={facultyRoster}
            rotatingCode={rotatingCode}
            isDark={isDark}
            activeColor={activeColor}
            dynamicStyles={dynamicStyles}
            setSectionModalVisible={setSectionModalVisible}
            setSubjectModalVisible={setSubjectModalVisible}
            setDurationModalVisible={setDurationModalVisible}
            setRadiusModalVisible={setRadiusModalVisible}
            startFacultySession={startFacultySession}
            endFacultySession={endFacultySession}
          />
        )}

        {isFaculty && activeTab === 'sections' && (
          <FacultySectionsView 
            sections={sections}
            subjects={subjects}
            activeColor={activeColor}
            dynamicStyles={dynamicStyles}
          />
        )}

        {statusMessage && (
          <View style={[
            styles.statusContainer,
            statusType === 'success' && styles.statusSuccess,
            statusType === 'error' && styles.statusError,
            statusType === 'info' && styles.statusInfo
          ]}>
            <Text style={[
              styles.statusText,
              statusType === 'success' && { color: '#10B981' },
              statusType === 'error' && { color: '#F43F5E' },
              statusType === 'info' && { color: '#6366F1' }
            ]}>
              {statusMessage}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom navbar */}
      <BottomNavBar 
        menuItems={menuItems}
        activeTab={activeTab}
        activeColor={activeColor}
        isDark={isDark}
        onTabPress={setActiveTab}
      />

      {/* Sliding menu sidebar drawer */}
      <SidebarDrawer 
        isDrawerOpen={isDrawerOpen}
        drawerTranslateX={drawerTranslateX}
        userName={userName}
        collegeId={collegeId}
        activeRole={activeRole}
        availableRoles={availableRoles}
        menuItems={menuItems}
        activeTab={activeTab}
        activeColor={activeColor}
        activeSoftColor={activeSoftColor}
        isDark={isDark}
        toggleDrawer={toggleDrawer}
        onTabPress={setActiveTab}
        onRoleSwitch={handleRoleSwitch}
        onLogout={handleLogout}
      />

      {/* Selection sheet modals */}
      
      {/* SECTION MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sectionModalVisible}
        onRequestClose={() => setSectionModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, dynamicStyles.modalCard]}>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Choose Section</Text>
            <FlatList
              data={sections}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, dynamicStyles.modalItem]}
                  onPress={() => {
                    setSelectedSection(item);
                    setSelectedSubject(null);
                    setSectionModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, dynamicStyles.modalItemText]}>{item.sectionName}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>No sections mapped to your faculty account.</Text>
              }
            />
            <TouchableOpacity
              style={[styles.modalCloseButton, dynamicStyles.modalCloseButton]}
              onPress={() => setSectionModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUBJECT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={subjectModalVisible}
        onRequestClose={() => setSubjectModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, dynamicStyles.modalCard]}>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Choose Subject</Text>
            <FlatList
              data={filteredSubjects}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, dynamicStyles.modalItem]}
                  onPress={() => {
                    setSelectedSubject(item);
                    setSubjectModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, dynamicStyles.modalItemText]}>
                    {item.subjectCode} - {item.subjectName}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>No assignments found for this section.</Text>
              }
            />
            <TouchableOpacity
              style={[styles.modalCloseButton, dynamicStyles.modalCloseButton]}
              onPress={() => setSubjectModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DURATION MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={durationModalVisible}
        onRequestClose={() => setDurationModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, dynamicStyles.modalCard]}>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Select Session Duration</Text>
            <FlatList
              data={durationOptions}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, dynamicStyles.modalItem]}
                  onPress={() => {
                    setDuration(item);
                    setDurationModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, dynamicStyles.modalItemText]}>{item} Minutes</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.modalCloseButton, dynamicStyles.modalCloseButton]}
              onPress={() => setDurationModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* RADIUS MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={radiusModalVisible}
        onRequestClose={() => setRadiusModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, dynamicStyles.modalCard]}>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Select Attendance Range</Text>
            <FlatList
              data={radiusOptions}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, dynamicStyles.modalItem]}
                  onPress={() => {
                    setRadius(item);
                    setRadiusModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, dynamicStyles.modalItemText]}>{item} Meters</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.modalCloseButton, dynamicStyles.modalCloseButton]}
              onPress={() => setRadiusModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// THEMES & STYLING DEFINITIONS
// ─────────────────────────────────────────────────────────────

const stylesLightStudent = StyleSheet.create({
  container: { backgroundColor: '#F8FAFC' },
  appSubtitle: { color: '#64748B' },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardTitle: { color: '#0F172A' },
  cardInfo: { color: '#64748B' },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  dropdownLabel: { color: '#475569' },
  dropdownButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  dropdownButtonText: { color: '#0F172A' },
  dashboardHeader: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  studentName: { color: '#0F172A' },
  sessionStatusTitle: { color: '#0F172A' },
  subjectName: { color: '#334155' },
  sectionBadge: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    borderColor: '#E2E8F0',
  },
  instruction: { color: '#475569' },
  emptySessionText: { color: '#475569' },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  modalTitle: { color: '#0F172A' },
  modalItem: { borderBottomColor: '#F1F5F9' },
  modalItemText: { color: '#334155' },
  modalCloseButton: { backgroundColor: '#F1F5F9' },
  progressTrack: { backgroundColor: '#E2E8F0' },
  drawerContainer: { backgroundColor: '#FFFFFF' },
  drawerLinkLabel: { color: '#334155' }
});

const stylesLightFaculty = StyleSheet.create({
  container: { backgroundColor: '#F9FBFC' },
  appSubtitle: { color: '#52525B' },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardTitle: { color: '#09090B' },
  cardInfo: { color: '#52525B' },
  input: {
    backgroundColor: '#F9FBFC',
    borderColor: '#E2E8F0',
    color: '#09090B',
  },
  dropdownLabel: { color: '#475569' },
  dropdownButton: {
    backgroundColor: '#F9FBFC',
    borderColor: '#E2E8F0',
  },
  dropdownButtonText: { color: '#09090B' },
  dashboardHeader: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  studentName: { color: '#09090B' },
  sessionStatusTitle: { color: '#09090B' },
  subjectName: { color: '#334155' },
  sectionBadge: {
    backgroundColor: '#F0FDF4',
    color: '#166534',
    borderColor: '#DCFCE7',
  },
  instruction: { color: '#52525B' },
  emptySessionText: { color: '#52525B' },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  modalTitle: { color: '#09090B' },
  modalItem: { borderBottomColor: '#F1F5F9' },
  modalItemText: { color: '#334155' },
  modalCloseButton: { backgroundColor: '#F1F5F9' },
  progressTrack: { backgroundColor: '#E2E8F0' },
  drawerContainer: { backgroundColor: '#FFFFFF' },
  drawerLinkLabel: { color: '#334155' }
});

const stylesDarkStudent = StyleSheet.create({
  container: { backgroundColor: '#09090B' },
  appSubtitle: { color: '#A1A1AA' },
  card: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  cardTitle: { color: '#FAFAFA' },
  cardInfo: { color: '#A1A1AA' },
  input: {
    backgroundColor: '#09090B',
    borderColor: '#27272A',
    color: '#FAFAFA',
  },
  dropdownLabel: { color: '#A1A1AA' },
  dropdownButton: {
    backgroundColor: '#09090B',
    borderColor: '#27272A',
  },
  dropdownButtonText: { color: '#FAFAFA' },
  dashboardHeader: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  studentName: { color: '#FAFAFA' },
  sessionStatusTitle: { color: '#FAFAFA' },
  subjectName: { color: '#E4E4E7' },
  sectionBadge: {
    backgroundColor: '#09090B',
    color: '#A1A1AA',
    borderColor: '#27272A',
  },
  instruction: { color: '#A1A1AA' },
  emptySessionText: { color: '#A1A1AA' },
  refreshButton: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  modalCard: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  modalTitle: { color: '#FAFAFA' },
  modalItem: { borderBottomColor: '#27272A' },
  modalItemText: { color: '#E4E4E7' },
  modalCloseButton: { backgroundColor: '#09090B' },
  progressTrack: { backgroundColor: '#27272A' },
  drawerContainer: { backgroundColor: '#18181B' },
  drawerLinkLabel: { color: '#E4E4E7' }
});

const stylesDarkFaculty = StyleSheet.create({
  container: { backgroundColor: '#0D1512' },
  appSubtitle: { color: '#A1A1AA' },
  card: {
    backgroundColor: '#121E19',
    borderColor: '#1B2D26',
  },
  cardTitle: { color: '#FAFAFA' },
  cardInfo: { color: '#A1A1AA' },
  input: {
    backgroundColor: '#0D1512',
    borderColor: '#1B2D26',
    color: '#FAFAFA',
  },
  dropdownLabel: { color: '#A1A1AA' },
  dropdownButton: {
    backgroundColor: '#0D1512',
    borderColor: '#1B2D26',
  },
  dropdownButtonText: { color: '#FAFAFA' },
  dashboardHeader: {
    backgroundColor: '#121E19',
    borderColor: '#1B2D26',
  },
  studentName: { color: '#FAFAFA' },
  sessionStatusTitle: { color: '#FAFAFA' },
  subjectName: { color: '#E4E4E7' },
  sectionBadge: {
    backgroundColor: '#0D1512',
    color: '#10B981',
    borderColor: '#1B2D26',
  },
  instruction: { color: '#A1A1AA' },
  emptySessionText: { color: '#A1A1AA' },
  refreshButton: {
    backgroundColor: '#121E19',
    borderColor: '#1B2D26',
  },
  modalCard: {
    backgroundColor: '#121E19',
    borderColor: '#1B2D26',
  },
  modalTitle: { color: '#FAFAFA' },
  modalItem: { borderBottomColor: '#1B2D26' },
  modalItemText: { color: '#E4E4E7' },
  modalCloseButton: { backgroundColor: '#0D1512' },
  progressTrack: { backgroundColor: '#1B2D26' },
  drawerContainer: { backgroundColor: '#121E19' },
  drawerLinkLabel: { color: '#E4E4E7' }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dashboardContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statusContainer: {
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusError: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  statusInfo: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    justifyContent: 'flex-end', 
  },
  modalCard: {
    borderRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '60%',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 15,
  },
  modalEmptyText: {
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 30,
  },
  modalCloseButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
  
  // Active session alerts
  activeSessionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    marginBottom: 20,
  },
  alertLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#6366F1',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  alertSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
