import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import initialAnnouncements from '@/components/Announcements/datafiles/announcementData';
import AnnouncementAdmin from '@/components/Announcements/AnnouncementAdmin';
import AssignmentPublisher from '@/components/Announcements/AssignmentPublisher.jsx';
import API from '@/Services/announcements';
import { register } from '../../Services/auth';
import { 
  LayoutDashboard, 
  Megaphone, 
  UserPlus, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Bell, 
  FileText, 
  Settings, 
  Activity, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  ChevronRight, 
  Plus, 
  HelpCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // User creation form state
  const [userForm, setUserForm] = useState({
    name: '',
    collegeId: '',
    email: '',
    password: '',
    role: 'STUDENT',
    rollNumber: '',
    year: '1',
    branch: '',
    department: '',
    designation: ''
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async() => {
      try {
        const response = await API.get('/');
        setAnnouncements(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to load announcements:', err);
        setError('Unable to load announcements. Please try again later');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingUser(true);

    // Prepare role payload
    const roles = [userForm.role];
    
    // Auto-fill roll number with College ID if left blank
    const rollNo = userForm.rollNumber.trim() || userForm.collegeId.trim();

    if (!userForm.name.trim() || !userForm.collegeId.trim() || !userForm.email.trim() || !userForm.password) {
      toast.error("Please fill in all required fields.");
      setIsSubmittingUser(false);
      return;
    }

    const payload = {
      name: userForm.name.trim(),
      collegeId: userForm.collegeId.trim(),
      email: userForm.email.trim().toLowerCase(),
      password: userForm.password,
      roles,
      rollNumber: rollNo,
      year: userForm.role === 'STUDENT' ? parseInt(userForm.year) : null,
      branch: userForm.role === 'STUDENT' ? userForm.branch.trim() : null,
      department: userForm.role !== 'STUDENT' ? userForm.department.trim() : null,
      designation: userForm.role !== 'STUDENT' ? userForm.designation.trim() : null,
    };

    try {
      await register(payload);
      toast.success(`Successfully registered ${userForm.role.toLowerCase()} user: ${userForm.name}! 🎉`);
      // Reset form
      setUserForm({
        name: '',
        collegeId: '',
        email: '',
        password: '',
        role: 'STUDENT',
        rollNumber: '',
        year: '1',
        branch: '',
        department: '',
        designation: ''
      });
    } catch (err) {
      console.error("Failed to register user:", err);
      const backendMessage = err.response?.data?.message || err.message || "Unknown error";
      toast.error(`Registration failed: ${backendMessage}`);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <Activity className="w-10 h-10 text-indigo-600 dark:text-[#6366F1] animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading administration panel...
        </p>
      </div>
    );
  }

  return (
    <div className="scroll-style space-y-6 pb-20 p-6 max-w-6xl mx-auto">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 border border-border/50 p-6 rounded-2xl">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-[#6366F1] tracking-wider uppercase">
            Administrative Command Center
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
            System Workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor platform metrics, manage announcements, publish assignments, and register new academic members.
          </p>
        </div>

        {/* Action Badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-background border border-border/60 px-3.5 py-1.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-muted-foreground">Server: </span>
            <span className="font-semibold text-foreground">Active (Spring Boot)</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-border/60 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 px-1 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:border-[#6366F1] dark:text-[#6366F1]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 px-1 flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'border-indigo-600 text-indigo-600 dark:border-[#6366F1] dark:text-[#6366F1]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Announcements & Tasks
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 px-1 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:border-[#6366F1] dark:text-[#6366F1]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          User Registration
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Users */}
            <div className="p-5 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Users</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">154</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Platform registrations</p>
            </div>

            {/* Students count */}
            <div className="p-5 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Students</span>
                <GraduationCap className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">130</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Active enrollments</p>
            </div>

            {/* Faculty count */}
            <div className="p-5 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Faculty</span>
                <Briefcase className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">24</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Teaching staff members</p>
            </div>

            {/* Real Active Announcements */}
            <button 
              onClick={() => setActiveTab('announcements')}
              className="text-left p-5 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Active Notices</span>
                <Bell className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">{announcements.length}</h2>
              <p className="text-[10px] text-muted-foreground mt-1 hover:underline text-indigo-600 dark:text-[#6366F1]">Manage notices &rarr;</p>
            </button>

            {/* Pending Approvals */}
            <div className="p-5 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Overrides</span>
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">2</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Timetable conflicts resolved</p>
            </div>
          </div>

          {/* Overrides & Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* System Status & Overrides Preview */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border/50 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Recent System Conflicts & Overrides
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-background/50 border border-border/45 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-foreground">Room 102 Lecture Override</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Professor Watson rescheduled Web Programming to Tuesday 10:00 AM</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-500 font-semibold px-2 py-0.5 rounded-full text-[9px]">Resolved</span>
                </div>
                <div className="p-3 bg-background/50 border border-border/45 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-foreground">Lab Attendance Adjustment</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Automated override system approved attendance slot validation for CSE Section B</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-500 font-semibold px-2 py-0.5 rounded-full text-[9px]">Resolved</span>
                </div>
                <div className="p-3 bg-background/50 border border-border/45 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-foreground">Timetable Lock Status</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Term SPRING_2026 timetable structures locked against manual modifications</p>
                  </div>
                  <span className="bg-amber-500/10 text-amber-500 font-semibold px-2 py-0.5 rounded-full text-[9px]">Locked</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="p-5 rounded-2xl bg-card border border-border/50 space-y-4">
              <h3 className="font-bold text-sm text-card-foreground">
                Administrative Shortcut Actions
              </h3>
              <div className="flex flex-col gap-3">
                <Link
                  to="/admin/timetable"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border/60 hover:border-indigo-500/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Timetable Editor</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Manage schedules & rooms</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>

                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-background border border-border/60 hover:border-indigo-500/30 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-4 h-4 text-indigo-500" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Create User Accounts</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Register students/faculty</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                <button
                  onClick={() => toast.success("Academic performance report compilation started. Check downloads folder shortly.")}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-background border border-border/60 hover:border-indigo-500/30 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Export Global Timetable</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Compile classroom data to Excel</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-card border border-border/50 p-6 rounded-2xl">
            <AnnouncementAdmin
              announcements={announcements}
              onAnnouncementsChange={setAnnouncements}
            />
          </div>
          <div className="bg-card border border-border/50 p-6 rounded-2xl">
            <AssignmentPublisher />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="font-extrabold text-lg text-foreground">
              Register New Portal Account
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add a new Student, Faculty member, or Administrator credentials. Basic authentication parameters are initialized instantly.
            </p>
          </div>

          <form onSubmit={handleUserSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={userForm.name}
                  onChange={handleUserFormChange}
                  placeholder="Enter full name"
                  required
                  className="login-input bg-background/50 border-border/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full"
                />
              </div>

              {/* College ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">College ID *</label>
                <input 
                  type="text" 
                  name="collegeId"
                  value={userForm.collegeId}
                  onChange={handleUserFormChange}
                  placeholder="e.g. CSE2024098"
                  required
                  className="login-input bg-background/50 border-border/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  placeholder="e.g. user@university.edu"
                  required
                  className="login-input bg-background/50 border-border/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Password *</label>
                <input 
                  type="password" 
                  name="password"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  placeholder="Minimum 8 characters"
                  required
                  className="login-input bg-background/50 border-border/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full"
                />
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Account Role *</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleUserFormChange}
                  className="login-input bg-background/50 border-border/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground"
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Roll Number (defaults to College ID if blank, but let's expose it) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  Roll Number / System ID
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" title="Auto-fills with College ID if left blank" />
                </label>
                <input 
                  type="text" 
                  name="rollNumber"
                  value={userForm.rollNumber}
                  onChange={handleUserFormChange}
                  placeholder="Optional - defaults to College ID"
                  className="login-input bg-background/50 border-border/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full"
                />
              </div>
            </div>

            {/* Conditional Student Details */}
            {userForm.role === 'STUDENT' && (
              <div className="p-4 bg-background/55 border border-border/50 rounded-xl space-y-3">
                <span className="text-xs font-bold text-indigo-500">Student Profile Information</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Current Year</label>
                    <select
                      name="year"
                      value={userForm.year}
                      onChange={handleUserFormChange}
                      className="login-input bg-background border-border/50 rounded-lg py-1.5 px-2 text-xs w-full text-foreground"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Branch</label>
                    <input 
                      type="text" 
                      name="branch"
                      value={userForm.branch}
                      onChange={handleUserFormChange}
                      placeholder="e.g. Computer Science"
                      className="login-input bg-background border-border/50 rounded-lg py-1.5 px-2 text-xs w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Faculty/Admin Details */}
            {userForm.role !== 'STUDENT' && (
              <div className="p-4 bg-background/55 border border-border/50 rounded-xl space-y-3">
                <span className="text-xs font-bold text-indigo-500">{userForm.role === 'FACULTY' ? 'Faculty' : 'Admin'} Profile Information</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Department</label>
                    <input 
                      type="text" 
                      name="department"
                      value={userForm.department}
                      onChange={handleUserFormChange}
                      placeholder="e.g. Computer Science"
                      className="login-input bg-background border-border/50 rounded-lg py-1.5 px-2 text-xs w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Designation</label>
                    <input 
                      type="text" 
                      name="designation"
                      value={userForm.designation}
                      onChange={handleUserFormChange}
                      placeholder="e.g. Associate Professor"
                      className="login-input bg-background border-border/50 rounded-lg py-1.5 px-2 text-xs w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingUser}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2"
            >
              {isSubmittingUser ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register User Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;