import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import initialAnnouncements from '@/components/Announcements/datafiles/announcementData';
import AnnouncementAdmin from '@/components/Announcements/AnnouncementAdmin';
import AssignmentPublisher from '@/components/Announcements/AssignmentPublisher.jsx';
import API from '@/Services/announcements';
import baseAPI from '@/Services/api';
import { register, adminCreateStudent, adminCreateFaculty } from '@/Services/auth';
import { getAllBatches } from '@/Services/admin';
import { getAllSections } from '@/Services/timetable';
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

// CSV Header and Data Normalization Helpers
const headerAliases = {
  collegeId: ['collegeid', 'rollno', 'rollnumber', 'id', 'collegeidrollno', 'collegeicollegeidrollno', 'collegeicollegeid/rollno', 'collegeid/rollno'],
  name: ['name', 'fullname', 'studentname', 'facultyname', 'username'],
  email: ['email', 'mail', 'mailid', 'emailaddress', 'studentmailid', 'studentmail.id'],
  year: ['year', 'classyear', 'academicyear', 'currentyear', 'sem', 'semester'],
  batchName: ['batchname', 'branch', 'batch', 'course', 'stream'],
  sectionName: ['sectionname', 'section', 'sec'],
  rollNumber: ['rollnumber', 'rollno', 'roll'],
  department: ['department', 'dept'],
  designation: ['designation', 'desg', 'role', 'post'],
  sectionNames: ['sectionnames', 'sections', 'assignedsections', 'assignedsection']
};

const mapHeaders = (rawHeaders) => {
  const mapped = {};
  rawHeaders.forEach((rawHeader) => {
    // Trim, lowercase and strip symbols (spaces, dots, slashes, etc.)
    const clean = rawHeader.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    // Find matching alias key
    const matchKey = Object.keys(headerAliases).find(key =>
      headerAliases[key].includes(clean) || clean.includes(key.toLowerCase())
    );
    if (matchKey) {
      mapped[rawHeader] = matchKey;
    } else {
      mapped[rawHeader] = rawHeader; // Fallback to raw header
    }
  });
  return mapped;
};

const batchAbbreviations = {
  'cse': ['computerscience', 'computerscienceengineering', 'computerscienceandengineering'],
  'ece': ['electronicsandcommunication', 'electronicsandcommunicationengineering'],
  'ee': ['electricalengineering', 'electrical'],
  'me': ['mechanicalengineering', 'mechanical'],
  'ce': ['civilengineering', 'civil'],
  'it': ['informationtechnology']
};

const findBatchMatch = (batches, inputName) => {
  if (!inputName) return null;
  const cleanInput = inputName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  // Helper to normalize batch name
  const normalize = (name) => name?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || '';

  // Try exact match first
  let match = batches.find(b => normalize(b.batchName) === cleanInput);
  if (match) return match;

  // Try matching using abbreviation mappings
  match = batches.find(b => {
    const normBatch = normalize(b.batchName);

    // Check if cleanInput is abbreviation for normBatch
    if (batchAbbreviations[cleanInput]?.some(expanded => normBatch.includes(expanded) || expanded.includes(normBatch))) {
      return true;
    }

    // Check if normBatch is abbreviation for cleanInput
    if (batchAbbreviations[normBatch]?.some(expanded => cleanInput.includes(expanded) || expanded.includes(normBatch))) {
      return true;
    }

    // Fallback: substring matching
    return normBatch.includes(cleanInput) || cleanInput.includes(normBatch);
  });

  return match;
};

const findSectionMatch = (sections, inputName) => {
  if (!inputName) return null;
  const cleanInput = inputName.trim().toLowerCase();

  // Try exact match first
  let match = sections.find(s => s.sectionName?.toLowerCase() === cleanInput);
  if (match) return match;

  // Try matching just the letter/ID (e.g., if input is "A" and section is "Section A")
  // Or vice versa
  match = sections.find(s => {
    const cleanSec = s.sectionName?.toLowerCase() || '';
    return cleanSec === `section ${cleanInput}` ||
      cleanSec === `section-${cleanInput}` ||
      cleanInput === `section ${cleanSec}` ||
      cleanInput === `section-${cleanSec}` ||
      cleanSec.replace(/[^a-z0-9]/g, '') === cleanInput.replace(/[^a-z0-9]/g, '');
  });
  return match;
};

const AdminDashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Dynamic stats
  const [stats, setStats] = useState({ totalUsers: 154, studentCount: 130, facultyCount: 24 });

  // Meta state
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [regType, setRegType] = useState('single'); // 'single' | 'bulk'

  // Bulk onboarding state
  const [bulkRole, setBulkRole] = useState('STUDENT');
  const [parsedRecords, setParsedRecords] = useState([]);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // User creation form state
  const [userForm, setUserForm] = useState({
    name: '',
    collegeId: '',
    email: '',
    password: '',
    role: 'STUDENT',
    rollNumber: '',
    year: '1',
    batchId: '',
    sectionId: '',
    department: '',
    designation: '',
    sectionIds: []
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [annRes, batchesRes, sectionsRes, statsRes] = await Promise.allSettled([
          API.get('/'),
          getAllBatches(),
          getAllSections(),
          baseAPI.get('/admin/stats')
        ]);

        if (annRes.status === 'fulfilled') {
          setAnnouncements(annRes.value.data || []);
        } else {
          console.error('Failed to load announcements:', annRes.reason);
        }

        if (batchesRes.status === 'fulfilled') {
          setBatches(batchesRes.value.data || []);
        } else {
          console.error('Failed to load batches:', batchesRes.reason);
        }

        if (sectionsRes.status === 'fulfilled') {
          setSections(sectionsRes.value.data || []);
        } else {
          console.error('Failed to load sections:', sectionsRes.reason);
        }

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data || { totalUsers: 154, studentCount: 130, facultyCount: 24 });
        } else {
          console.error('Failed to load stats:', statsRes.reason);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard resources:', err);
        setError('Unable to load server resources. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingUser(true);

    const rollNo = userForm.rollNumber.trim() || userForm.collegeId.trim();

    // Standard validations for Single registration
    if (!userForm.name.trim() || !userForm.collegeId.trim() || !userForm.email.trim()) {
      toast.error("Please fill in all required fields.");
      setIsSubmittingUser(false);
      return;
    }

    try {
      if (userForm.role === 'STUDENT') {
        if (!userForm.batchId) {
          toast.error("Please select a Batch.");
          setIsSubmittingUser(false);
          return;
        }
        if (!userForm.sectionId) {
          toast.error("Please select a Section.");
          setIsSubmittingUser(false);
          return;
        }
        const payload = {
          collegeId: userForm.collegeId.trim(),
          name: userForm.name.trim(),
          email: userForm.email.trim().toLowerCase(),
          rollNumber: rollNo,
          year: parseInt(userForm.year),
          batchId: parseInt(userForm.batchId),
          sectionId: parseInt(userForm.sectionId)
        };
        await adminCreateStudent(payload);
        toast.success(`Successfully registered Student: ${userForm.name}! 🎉`);
      } else if (userForm.role === 'FACULTY') {
        if (!userForm.department.trim() || !userForm.designation.trim()) {
          toast.error("Department and Designation are required for Faculty.");
          setIsSubmittingUser(false);
          return;
        }
        const payload = {
          collegeId: userForm.collegeId.trim(),
          name: userForm.name.trim(),
          email: userForm.email.trim().toLowerCase(),
          department: userForm.department.trim(),
          designation: userForm.designation.trim(),
          sectionIds: userForm.sectionIds || []
        };
        await adminCreateFaculty(payload);
        toast.success(`Successfully registered Faculty: ${userForm.name}! 🎉`);
      } else {
        // Admin user creation (uses standard register endpoint)
        if (!userForm.password) {
          toast.error("Password is required for Admin role.");
          setIsSubmittingUser(false);
          return;
        }
        const payload = {
          collegeId: userForm.collegeId.trim(),
          name: userForm.name.trim(),
          email: userForm.email.trim().toLowerCase(),
          password: userForm.password,
          roles: ['ADMIN'],
          rollNumber: rollNo
        };
        await register(payload);
        toast.success(`Successfully registered Admin: ${userForm.name}! 🎉`);
      }

      // Reset form
      setUserForm({
        name: '',
        collegeId: '',
        email: '',
        password: '',
        role: 'STUDENT',
        rollNumber: '',
        year: '1',
        batchId: '',
        sectionId: '',
        department: '',
        designation: '',
        sectionIds: []
      });
      // Refresh stats
      baseAPI.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
    } catch (err) {
      console.error("Failed to register user:", err);
      const backendMessage = err.response?.data?.message || err.message || "Unknown error";
      toast.error(`Registration failed: ${backendMessage}`);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // CSV Parser
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
    // Extract headers
    const rawHeaders = lines[0].split(',');
    const headers = rawHeaders.map(h => h.trim().replace(/^["']|["']$/g, ''));

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row = {};
      headers.forEach((header, index) => {
        let val = values[index] || '';
        val = val.replace(/^["']|["']$/g, ''); // Clean quotes
        row[header] = val;
      });
      records.push(row);
    }
    return records;
  };

  // CSV File Handler
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = parseCSV(text);

      // Perform pre-validation and mapping
      const headerMap = mapHeaders(Object.keys(rows[0] || {}));

      const validated = rows.map((row, idx) => {
        // Normalize keys
        const normRow = {};
        Object.keys(row).forEach(key => {
          normRow[headerMap[key] || key] = row[key];
        });

        const errors = [];
        let resolvedDetails = '';
        let mappedData = {};

        if (bulkRole === 'STUDENT') {
          const reqFields = ['collegeId', 'name', 'email', 'year', 'batchName', 'sectionName'];
          reqFields.forEach(f => {
            if (!normRow[f]?.trim()) {
              const rawHeaderName = Object.keys(headerMap).find(k => headerMap[k] === f) || f;
              errors.push(`Missing field: ${rawHeaderName}`);
            }
          });

          // Resolve batchName -> batchId
          const bMatch = findBatchMatch(batches, normRow.batchName);
          // Resolve sectionName -> sectionId
          const sMatch = findSectionMatch(sections, normRow.sectionName);

          if (!bMatch && normRow.batchName) errors.push(`Batch '${normRow.batchName}' not found`);
          if (!sMatch && normRow.sectionName) errors.push(`Section '${normRow.sectionName}' not found`);

          mappedData = {
            collegeId: normRow.collegeId?.trim(),
            name: normRow.name?.trim(),
            email: normRow.email?.trim()?.toLowerCase(),
            rollNumber: normRow.rollNumber?.trim() || normRow.collegeId?.trim(),
            year: parseInt(normRow.year) || 1,
            batchId: bMatch ? bMatch.id : null,
            sectionId: sMatch ? sMatch.id : null
          };
          resolvedDetails = `Batch: ${bMatch?.batchName || normRow.batchName || 'N/A'} (ID: ${bMatch?.id || '?'}), Section: ${sMatch?.sectionName || normRow.sectionName || 'N/A'} (ID: ${sMatch?.id || '?'})`;
        } else if (bulkRole === 'FACULTY') {
          const reqFields = ['collegeId', 'name', 'email', 'department', 'designation'];
          reqFields.forEach(f => {
            if (!normRow[f]?.trim()) {
              const rawHeaderName = Object.keys(headerMap).find(k => headerMap[k] === f) || f;
              errors.push(`Missing field: ${rawHeaderName}`);
            }
          });

          // Resolve semicolon-separated sectionNames to array of sectionIds
          const facultySectionIds = [];
          if (normRow.sectionNames) {
            const names = normRow.sectionNames.split(';').map(n => n.trim());
            names.forEach(name => {
              if (!name) return;
              const match = findSectionMatch(sections, name);
              if (match) {
                facultySectionIds.push(match.id);
              } else {
                errors.push(`Section '${name}' not found`);
              }
            });
          }

          mappedData = {
            collegeId: normRow.collegeId?.trim(),
            name: normRow.name?.trim(),
            email: normRow.email?.trim()?.toLowerCase(),
            department: normRow.department?.trim(),
            designation: normRow.designation?.trim(),
            sectionIds: facultySectionIds
          };
          resolvedDetails = `Dept: ${normRow.department || 'N/A'}, Sections: ${normRow.sectionNames || 'None'}`;
        }

        return {
          id: idx,
          raw: row,
          mapped: mappedData,
          errors,
          resolvedDetails,
          status: errors.length > 0 ? 'invalid' : 'pending', // 'invalid' | 'pending' | 'uploading' | 'success' | 'failed'
          message: errors.length > 0 ? errors.join('; ') : 'Ready for import'
        };
      });

      setParsedRecords(validated);
      toast.info(`Parsed ${validated.length} rows. Please review before uploading.`);
    };
    reader.readAsText(file);
  };

  // Run Bulk Upload Sequentially
  const handleBulkUpload = async () => {
    const validRecords = parsedRecords.filter(r => r.status === 'pending');
    if (validRecords.length === 0) {
      toast.warning("No valid pending records to upload.");
      return;
    }

    setIsUploadingBulk(true);
    setBulkProgress(0);

    const updated = [...parsedRecords];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== 'pending') continue;

      updated[i].status = 'uploading';
      updated[i].message = 'Uploading to server...';
      setParsedRecords([...updated]);

      try {
        if (bulkRole === 'STUDENT') {
          await adminCreateStudent(updated[i].mapped);
        } else {
          await adminCreateFaculty(updated[i].mapped);
        }
        updated[i].status = 'success';
        updated[i].message = 'Registered successfully! 🎉';
      } catch (err) {
        console.error("Bulk upload row error:", err);
        const errMsg = err.response?.data?.message || err.message || "Failed";
        updated[i].status = 'failed';
        updated[i].message = `Error: ${errMsg}`;
      }
      setBulkProgress(prev => prev + 1);
      setParsedRecords([...updated]);
    }

    setIsUploadingBulk(false);
    toast.success("Bulk registration operation complete!");
    // Refresh stats
    baseAPI.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
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
    <div className="scroll-style space-y-5 pb-16 px-3 py-4 sm:px-5 lg:px-6 max-w-7xl mx-auto overflow-x-hidden">

      {/* Admin Header */}
      <div className=" flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/40 border border-border/50 p-4 sm:p-5 lg:p-6 rounded-2xl ">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-[#6366F1] tracking-wider uppercase">
            Administrative Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
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
      <div className="flex overflow-x-auto whitespace-nowrap border-b border-border/60 gap-4 pb-2 scrollbar-hide">        <button
        onClick={() => setActiveTab('overview')}
        className={`shrink-0 pb-3 text-sm font-semibold transition-all border-b-2 px-1 flex items-center gap-2 ${activeTab === 'overview'
          ? 'border-indigo-600 text-indigo-600 dark:border-[#6366F1] dark:text-[#6366F1]'
          : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        Overview
      </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`shrink-0 pb-3 text-sm font-semibold transition-all border-b-2 px-1 flex items-center gap-2 ${activeTab === 'announcements'
            ? 'border-indigo-600 text-indigo-600 dark:border-[#6366F1] dark:text-[#6366F1]'
            : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <Megaphone className="w-4 h-4" />
          Announcements & Tasks
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`shrink-0 pb-3 text-sm font-semibold transition-all border-b-2 px-1 flex items-center gap-2 ${activeTab === 'users'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Users */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Users</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground tracking-tight mt-3">{stats.totalUsers}</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Platform registrations</p>
            </div>

            {/* Students count */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Students</span>
                <GraduationCap className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground tracking-tight mt-3">{stats.studentCount}</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Active enrollments</p>
            </div>

            {/* Faculty count */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Faculty</span>
                <Briefcase className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground tracking-tight mt-3">{stats.facultyCount}</h2>
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground tracking-tight mt-3">{announcements.length}</h2>
              <p className="text-[10px] text-muted-foreground mt-1 hover:underline text-indigo-600 dark:text-[#6366F1]">Manage notices &rarr;</p>
            </button>

            {/* Pending Approvals */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Overrides</span>
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground tracking-tight mt-3">2</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Timetable conflicts resolved</p>
            </div>
          </div>

          {/* Overrides & Actions Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">

            {/* System Status & Overrides Preview */}
            <div className="xl:col-span-2 p-5 rounded-2xl bg-card border border-border/50 space-y-4">
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
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/50 space-y-4">
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
        <div className={`p-6 rounded-2xl bg-card border border-border/50 space-y-6 ${regType === 'bulk' ? 'max-w-4xl' : 'max-w-2xl'} mx-auto transition-all duration-300`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-foreground">
                Portal Onboarding Console
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Register new Student, Faculty, or Admin accounts manually or in bulk via CSV.
              </p>
            </div>

            <div className="flex bg-background/80 p-1 rounded-xl border border-border/50 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setRegType('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${regType === 'single'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Single User
              </button>
              <button
                type="button"
                onClick={() => setRegType('bulk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${regType === 'bulk'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Bulk CSV Import
              </button>
            </div>
          </div>

          {regType === 'single' ? (
            <form onSubmit={handleUserSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Full Name *</label>
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
                  <label className="text-xs font-medium text-foreground">College ID *</label>
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
                  <label className="text-xs font-medium text-foreground">Email Address *</label>
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

                {/* Role Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Account Role *</label>
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

                {/* Roll Number (defaults to College ID if blank) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1">
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

                {/* Password (Only required and displayed for Admin) */}
                {userForm.role === 'ADMIN' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Password *</label>
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
                )}
              </div>

              {/* Password info message for student/faculty */}
              {userForm.role === 'STUDENT' && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-[#6366F1] rounded-xl text-[11px] font-medium">
                  Note: A default password of <strong>Student@123</strong> will be assigned to this student account.
                </div>
              )}
              {userForm.role === 'FACULTY' && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-[#6366F1] rounded-xl text-[11px] font-medium">
                  Note: A default password of <strong>Faculty@123</strong> will be assigned to this faculty account.
                </div>
              )}

              {/* Conditional Student Details */}
              {userForm.role === 'STUDENT' && (
                <div className="p-4 bg-background/55 border border-border/50 rounded-xl space-y-4">
                  <span className="text-xs font-bold text-indigo-500">Student Profile Information</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Current Year *</label>
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

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Batch *</label>
                      <select
                        name="batchId"
                        value={userForm.batchId}
                        onChange={handleUserFormChange}
                        required
                        className="login-input bg-background border-border/50 rounded-lg py-1.5 px-2 text-xs w-full text-foreground"
                      >
                        <option value="">Select Batch</option>
                        {batches.map(batch => (
                          <option key={batch.id} value={batch.id}>
                            {batch.batchName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Section *</label>
                      <select
                        name="sectionId"
                        value={userForm.sectionId}
                        required
                        onChange={handleUserFormChange}
                        className="login-input bg-background border-border/50 rounded-lg py-1.5 px-2 text-xs w-full text-foreground"
                      >
                        <option value="">Select Section</option>
                        {sections.map(sec => (
                          <option key={sec.id} value={sec.id}>
                            {sec.sectionName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Faculty Details */}
              {userForm.role === 'FACULTY' && (
                <div className="p-4 bg-background/55 border border-border/50 rounded-xl space-y-4">
                  <span className="text-xs font-bold text-indigo-500">Faculty Profile Information</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Department *</label>
                      <input
                        type="text"
                        name="department"
                        value={userForm.department}
                        onChange={handleUserFormChange}
                        placeholder="e.g. Computer Science"
                        required
                        className="login-input bg-background border-border/50 rounded-lg py-1.5 px-2 text-xs w-full"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Designation *</label>
                      <input
                        type="text"
                        name="designation"
                        value={userForm.designation}
                        onChange={handleUserFormChange}
                        placeholder="e.g. Associate Professor"
                        required
                        className="login-input bg-background border-border/50 rounded-lg py-1.5 px-2 text-xs w-full"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Assigned Sections</label>
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-background/50 border border-border/50 rounded-xl max-h-48 overflow-y-auto">
                        {sections.map(sec => (
                          <label key={sec.id} className="flex items-center gap-2 text-xs text-foreground cursor-pointer hover:text-indigo-500">
                            <input
                              type="checkbox"
                              checked={(userForm.sectionIds || []).includes(sec.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setUserForm(prev => {
                                  const currentIds = prev.sectionIds || [];
                                  if (checked) {
                                    return { ...prev, sectionIds: [...currentIds, sec.id] };
                                  } else {
                                    return { ...prev, sectionIds: currentIds.filter(id => id !== sec.id) };
                                  }
                                });
                              }}
                              className="rounded border-border text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                            />
                            <span>{sec.sectionName}</span>
                          </label>
                        ))}
                      </div>
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
          ) : (
            <div className="space-y-5">
              {/* Role Selection for Bulk */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/40 p-4 border border-border/50 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-foreground">1. Select Target Role</h4>
                  <p className="text-[10px] text-muted-foreground">Select the role of the users contained in your CSV file.</p>
                </div>
                <div className="flex bg-background p-1 rounded-xl border border-border/50">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkRole('STUDENT');
                      setParsedRecords([]);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${bulkRole === 'STUDENT'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkRole('FACULTY');
                      setParsedRecords([]);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${bulkRole === 'FACULTY'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Faculty
                  </button>
                </div>
              </div>

              {/* Password notice for bulk import */}
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-[#6366F1] rounded-xl text-[11px] font-medium">
                Note: Standard default passwords (<strong>{bulkRole === 'STUDENT' ? 'Student@123' : 'Faculty@123'}</strong>) will be assigned to all imported profiles.
              </div>

              {/* Drag and Drop Dropzone / File Picker */}
              {parsedRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-indigo-500/60 rounded-2xl p-8 transition-all bg-background/20 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mb-3" />
                  <label className="cursor-pointer">
                    <span className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all inline-block mb-1">
                      Choose CSV File
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    or drag and drop your CSV file here
                  </p>
                  <div className="mt-4 p-3 bg-background/50 border border-border/50 rounded-xl max-w-md text-left mx-auto">
                    <span className="text-[10px] font-bold text-foreground block mb-1">Expected CSV Headers:</span>
                    {bulkRole === 'STUDENT' ? (
                      <code className="text-[9px] text-indigo-500 block break-all font-mono">
                        collegeId, name, email, year, batchName, sectionName, [rollNumber]
                      </code>
                    ) : (
                      <code className="text-[9px] text-indigo-500 block break-all font-mono">
                        collegeId, name, email, department, designation, sectionNames (semi-colon separated)
                      </code>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Indicator Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-background/50 p-3 border border-border/40 rounded-xl">
                    <div className="flex gap-4 text-xs font-semibold text-foreground">
                      <div>
                        Total Rows: <span className="text-indigo-500 font-bold">{parsedRecords.length}</span>
                      </div>
                      <div>
                        Ready: <span className="text-emerald-500 font-bold">{parsedRecords.filter(r => r.status === 'pending').length}</span>
                      </div>
                      <div>
                        Errors: <span className="text-rose-500 font-bold">{parsedRecords.filter(r => r.status === 'invalid' || r.status === 'failed').length}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setParsedRecords([])}
                        disabled={isUploadingBulk}
                        className="px-3 py-1.5 border border-border/60 hover:border-rose-500/30 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 text-xs font-bold rounded-lg transition-all"
                      >
                        Clear File
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkUpload}
                        disabled={isUploadingBulk || parsedRecords.filter(r => r.status === 'pending').length === 0}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                        {isUploadingBulk ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading ({bulkProgress}/{parsedRecords.filter(r => r.status !== 'invalid').length})</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Process Upload</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isUploadingBulk && (
                    <div className="space-y-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                        <span>Uploading records...</span>
                        <span>{bulkProgress} / {parsedRecords.filter(r => r.status !== 'invalid').length} Completed</span>
                      </div>
                      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-300"
                          style={{
                            width: `${(bulkProgress / Math.max(1, parsedRecords.filter(r => r.status !== 'invalid').length)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="overflow-x-auto border border-border/50 rounded-xl bg-background/10 max-h-96 scrollbar-thin">
                    <table className="min-w-[700px] w-full border-collapse text-left text-xs">
                      <thead className="bg-background/80 sticky top-0 border-b border-border/50 text-muted-foreground font-semibold text-[10px] uppercase">
                        <tr>
                          <th className="p-3">ID / Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Resolved Mappings</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {parsedRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-background/30 transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-foreground">{record.raw.name || <em className="text-muted-foreground text-[10px]">No Name</em>}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{record.raw.collegeId || 'N/A'}</div>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {record.raw.email || 'N/A'}
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] text-foreground font-medium block">
                                {record.resolvedDetails}
                              </span>
                              {record.message && (
                                <span className={`text-[9px] block mt-0.5 ${record.status === 'invalid' || record.status === 'failed'
                                  ? 'text-rose-500 font-medium'
                                  : record.status === 'success'
                                    ? 'text-emerald-500 font-medium'
                                    : 'text-muted-foreground'
                                  }`}>
                                  {record.message}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 ${record.status === 'success'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : record.status === 'failed'
                                  ? 'bg-rose-500/10 text-rose-500'
                                  : record.status === 'invalid'
                                    ? 'bg-rose-500/10 text-rose-500'
                                    : record.status === 'uploading'
                                      ? 'bg-indigo-500/10 text-indigo-500 animate-pulse'
                                      : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                {record.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;