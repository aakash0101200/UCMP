import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import initialAnnouncements from '@/components/Announcements/datafiles/announcementData';
import AnnouncementAdmin from '@/components/Announcements/AnnouncementAdmin';
import API from '@/Services/announcements';
import baseAPI from '@/Services/api';
import { register, adminCreateStudent, adminCreateFaculty } from '@/Services/auth';
import { getAllBatches } from '@/Services/admin';
import { getAllSections } from '@/Services/timetable';
import { getProfile } from '@/Services/profile';
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
  const [hoveredPoint, setHoveredPoint] = useState(null);

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

  // Scoped admin details
  const [adminProfile, setAdminProfile] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);

  const isSuperAdmin = !adminProfile?.department || 
    adminProfile.department.toLowerCase() === 'administration' || 
    localStorage.getItem("collegeId") === 'ADMIN_001';

  const handleAddSection = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!newSectionName.trim()) {
      toast.error("Please enter a section name.");
      return;
    }
    
    const yearToUse = isSuperAdmin ? parseInt(userForm.year) : (adminProfile?.yearScope || parseInt(userForm.year));
    
    let batchIdToUse = null;
    if (isSuperAdmin) {
      batchIdToUse = userForm.batchId ? parseInt(userForm.batchId) : null;
    } else {
      const matchingBatch = findBatchMatch(batches, adminProfile?.department);
      batchIdToUse = matchingBatch ? matchingBatch.id : (userForm.batchId ? parseInt(userForm.batchId) : null);
    }

    if (!yearToUse) {
      toast.error("Please select or configure a Year first.");
      return;
    }
    if (!batchIdToUse) {
      toast.error("Please select or configure a Batch first.");
      return;
    }

    setIsAddingSection(true);
    try {
      const res = await baseAPI.post('/sections', {
        sectionName: newSectionName.trim(),
        year: yearToUse,
        batchId: batchIdToUse
      });
      toast.success(`Successfully created section: ${newSectionName.trim()}! 🎉`);
      setNewSectionName('');
      
      const newSec = res.data;
      setSections(prev => [...prev, newSec]);
      setUserForm(prev => ({ ...prev, sectionId: String(newSec.id) }));
    } catch (err) {
      console.error('Failed to create section:', err);
      const backendMessage = err.response?.data?.message || err.message || "Unknown error";
      toast.error(`Failed to create section: ${backendMessage}`);
    } finally {
      setIsAddingSection(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const loggedInCollegeId = localStorage.getItem("collegeId");
        const [annRes, batchesRes, sectionsRes, statsRes, profileRes] = await Promise.allSettled([
          API.get('/'),
          getAllBatches(),
          getAllSections(),
          baseAPI.get('/admin/stats'),
          getProfile(loggedInCollegeId)
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

        if (profileRes.status === 'fulfilled') {
          setAdminProfile(profileRes.value.data || null);
        } else {
          console.error('Failed to load admin profile:', profileRes.reason);
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

  useEffect(() => {
    if (adminProfile && batches.length > 0) {
      const isSuper = !adminProfile.department || 
        adminProfile.department.toLowerCase() === 'administration' || 
        localStorage.getItem("collegeId") === 'ADMIN_001';
      
      if (!isSuper) {
        const matchingBatch = findBatchMatch(batches, adminProfile.department);
        
        setUserForm(prev => {
          const next = { ...prev };
          if (adminProfile.yearScope) {
            next.year = adminProfile.yearScope.toString();
          }
          if (matchingBatch) {
            next.batchId = matchingBatch.id.toString();
          }
          return next;
        });
      }
    }
  }, [adminProfile, batches]);

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
          rollNumber: rollNo,
          department: userForm.department.trim() || null,
          year: userForm.year ? parseInt(userForm.year) : null
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
    <div className="space-y-6 pb-24 p-6 -mt-6 -mx-6 min-h-[calc(100vh-64px)] bg-[#F8F9FA] dark:bg-[#0B0F19] transition-colors duration-300 text-[#1A202C] dark:text-slate-100 overflow-y-auto w-[calc(100%+3rem)]">

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* BEGIN: Admin Header */}
      <section data-purpose="greeting" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Administrative Command Center
          </span>
          <h1 className="text-5xl font-light text-slate-900 dark:text-white tracking-tight mt-1">
            System Workspace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Monitor platform metrics, manage announcements, and register new academic members.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent px-3.5 py-1.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-500 dark:text-slate-400">Server: </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Active (Spring Boot)</span>
          </div>
        </div>
      </section>
      {/* END: Admin Header */}

      {/* BEGIN: Tabs Bar */}
      <div className="flex bg-white/80 dark:bg-[#161B26] p-1 rounded-2xl border border-slate-100 dark:border-transparent w-fit gap-2 shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'overview'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
            }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'announcements'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
            }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          Announcements & Tasks
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'users'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
            }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          User Registration
        </button>
      </div>
      {/* END: Tabs Bar */}

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Users */}
            <Link
              to="/admin/users"
              className="bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent rounded-[2rem] p-5 shadow-sm dark:shadow-none hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col items-center select-none"
            >
              <div className="w-full flex justify-between items-center mb-4 text-slate-600 dark:text-slate-400">
                <span className="text-sm font-medium">Total Users</span>
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <div className="mt-4 text-5xl font-light text-[#1A202C] dark:text-slate-100">{stats.totalUsers}</div>
            </Link>

            {/* Students count */}
            <Link
              to="/admin/users"
              className="bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent rounded-[2rem] p-5 shadow-sm dark:shadow-none hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col items-center select-none"
            >
              <div className="w-full flex justify-between items-center mb-4 text-slate-600 dark:text-slate-400">
                <span className="text-sm font-medium">Students</span>
                <GraduationCap className="w-5 h-5 text-slate-400" />
              </div>
              <div className="mt-4 text-5xl font-light text-[#1A202C] dark:text-slate-100">{stats.studentCount}</div>
            </Link>

            {/* Faculty count */}
            <Link
              to="/admin/users"
              className="bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent rounded-[2rem] p-5 shadow-sm dark:shadow-none hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col items-center select-none"
            >
              <div className="w-full flex justify-between items-center mb-4 text-slate-600 dark:text-slate-400">
                <span className="text-sm font-medium">Faculty</span>
                <Briefcase className="w-5 h-5 text-slate-400" />
              </div>
              <div className="mt-4 text-5xl font-light text-[#1A202C] dark:text-slate-100">{stats.facultyCount}</div>
            </Link>

            {/* Real Active Announcements */}
            <button
              onClick={() => setActiveTab('announcements')}
              className="bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent rounded-[2rem] p-5 shadow-sm dark:shadow-none hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col items-center select-none text-left"
            >
              <div className="w-full flex justify-between items-center mb-4 text-slate-600 dark:text-slate-400">
                <span className="text-sm font-medium">Active Notices</span>
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
              <div className="mt-4 text-5xl font-light text-[#1A202C] dark:text-slate-100">{announcements.length}</div>
            </button>

            {/* Platform Uptime Gauge */}
            <div className="bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent rounded-[2rem] p-5 shadow-sm dark:shadow-none hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col items-center select-none">
              <div className="w-full flex justify-between items-center mb-4 text-slate-600 dark:text-slate-400">
                <span className="text-sm font-medium">System Uptime</span>
                <ShieldCheck className="w-5 h-5 text-slate-400" />
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="stroke-slate-100 dark:stroke-slate-800/60"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="stroke-emerald-500"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - 0.984)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-[#1A202C] dark:text-slate-100">
                  98.4%
                </span>
              </div>
            </div>
          </div>

          {/* Main Grid: Administrative Shortcuts (Left) & Platform Activity (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Shortcuts */}
            <div className="lg:col-span-1 p-5 rounded-[2rem] bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-card-foreground">
                Administrative Shortcuts
              </h3>
              <div className="flex flex-col gap-3">
                <Link
                  to="/admin/timetable"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19]/60 border border-slate-100/60 dark:border-transparent hover:border-indigo-500/30 hover:shadow-sm transition-all"
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
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19]/60 border border-slate-100/60 dark:border-transparent hover:border-indigo-500/30 hover:shadow-sm transition-all text-left"
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
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19]/60 border border-slate-100/60 dark:border-transparent hover:border-indigo-500/30 hover:shadow-sm transition-all text-left"
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

            {/* Interactive Chart Card */}
            <section className="lg:col-span-2 bg-white dark:bg-[#161B26] rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-transparent flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-[#1A202C] dark:text-slate-100">Platform Activity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Platform session load and active TOTP check-ins inside classrooms today.</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full">
                  Live Monitoring
                </span>
              </div>

              <div className="relative w-full overflow-hidden select-none mt-2">
                <svg viewBox="0 0 600 200" className="w-full h-48 overflow-visible">
                  <defs>
                    <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="40" y1="40" x2="560" y2="40" className="stroke-slate-100 dark:stroke-slate-800/30" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="40" y1="100" x2="560" y2="100" className="stroke-slate-100 dark:stroke-slate-800/30" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="40" y1="160" x2="560" y2="160" className="stroke-slate-100 dark:stroke-slate-800/30" strokeWidth="1" strokeDasharray="4,4" />

                  {/* Area under the curve */}
                  <path
                    d="M 50,160 Q 100,105 150,50 Q 200,80 250,110 Q 300,90 350,70 Q 400,100 450,130 Q 500,150 550,170 L 550,190 L 50,190 Z"
                    fill="url(#chart-area-grad)"
                  />

                  {/* Main Blue line */}
                  <path
                    d="M 50,160 Q 100,105 150,50 Q 200,80 250,110 Q 300,90 350,70 Q 400,100 450,130 Q 500,150 550,170"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Dots at points */}
                  {[
                    { x: 50, y: 160 },
                    { x: 150, y: 50 },
                    { x: 250, y: 110 },
                    { x: 350, y: 70 },
                    { x: 450, y: 130 },
                    { x: 550, y: 170 }
                  ].map((pt, idx) => (
                    <g key={idx}>
                      {hoveredPoint === idx && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="12"
                          fill="#3b82f6"
                          fillOpacity="0.25"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPoint === idx ? "7" : "4.5"}
                        fill={hoveredPoint === idx ? "#3b82f6" : "white"}
                        stroke="#3b82f6"
                        strokeWidth="3"
                        className="transition-all duration-200"
                      />
                    </g>
                  ))}

                  {/* Invisible Hover overlay rectangles for interactive trigger */}
                  {[
                    { x: 50, y: 160, label: "08:00 AM", sessions: 45, load: "Low" },
                    { x: 150, y: 50, label: "10:00 AM", sessions: 135, load: "High" },
                    { x: 250, y: 110, label: "12:00 PM", sessions: 98, load: "Medium" },
                    { x: 350, y: 70, label: "02:00 PM", sessions: 124, load: "High" },
                    { x: 450, y: 130, label: "04:00 PM", sessions: 72, load: "Medium" },
                    { x: 550, y: 170, label: "06:00 PM", sessions: 30, load: "Low" }
                  ].map((pt, idx) => (
                    <rect
                      key={idx}
                      x={pt.x - 45}
                      y="10"
                      width="90"
                      height="180"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}

                  {/* Hover Tooltip rendered in-place */}
                  {hoveredPoint !== null && (
                    <g className="pointer-events-none">
                      {/* Tooltip Card shadow/border */}
                      <rect
                        x={[
                          { x: 50, y: 160 },
                          { x: 150, y: 50 },
                          { x: 250, y: 110 },
                          { x: 350, y: 70 },
                          { x: 450, y: 130 },
                          { x: 550, y: 170 }
                        ][hoveredPoint].x - 70}
                        y={[
                          { x: 50, y: 160 },
                          { x: 150, y: 50 },
                          { x: 250, y: 110 },
                          { x: 350, y: 70 },
                          { x: 450, y: 130 },
                          { x: 550, y: 170 }
                        ][hoveredPoint].y - 55}
                        width="140"
                        height="45"
                        rx="8"
                        fill="#0f172a"
                        className="shadow-2xl"
                      />
                      {/* Tooltip Header */}
                      <text
                        x={[
                          { x: 50, y: 160 },
                          { x: 150, y: 50 },
                          { x: 250, y: 110 },
                          { x: 350, y: 70 },
                          { x: 450, y: 130 },
                          { x: 550, y: 170 }
                        ][hoveredPoint].x}
                        y={[
                          { x: 50, y: 160 },
                          { x: 150, y: 50 },
                          { x: 250, y: 110 },
                          { x: 350, y: 70 },
                          { x: 450, y: 130 },
                          { x: 550, y: 170 }
                        ][hoveredPoint].y - 38}
                        fill="#f8fafc"
                        fontSize="9.5"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {[
                          { label: "08:00 AM" },
                          { label: "10:00 AM" },
                          { label: "12:00 PM" },
                          { label: "02:00 PM" },
                          { label: "04:00 PM" },
                          { label: "06:00 PM" }
                        ][hoveredPoint].label}
                      </text>
                      {/* Tooltip Content */}
                      <text
                        x={[
                          { x: 50, y: 160 },
                          { x: 150, y: 50 },
                          { x: 250, y: 110 },
                          { x: 350, y: 70 },
                          { x: 450, y: 130 },
                          { x: 550, y: 170 }
                        ][hoveredPoint].x}
                        y={[
                          { x: 50, y: 160 },
                          { x: 150, y: 50 },
                          { x: 250, y: 110 },
                          { x: 350, y: 70 },
                          { x: 450, y: 130 },
                          { x: 550, y: 170 }
                        ][hoveredPoint].y - 23}
                        fill="#60a5fa"
                        fontSize="8.5"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {[
                          { sessions: 45, load: "Low" },
                          { sessions: 135, load: "High" },
                          { sessions: 98, load: "Medium" },
                          { sessions: 124, load: "High" },
                          { sessions: 72, load: "Medium" },
                          { sessions: 30, load: "Low" }
                        ][hoveredPoint].sessions} Users • {[
                          { sessions: 45, load: "Low" },
                          { sessions: 135, load: "High" },
                          { sessions: 98, load: "Medium" },
                          { sessions: 124, load: "High" },
                          { sessions: 72, load: "Medium" },
                          { sessions: 30, load: "Low" }
                        ][hoveredPoint].load} Load
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 px-8 font-medium">
                <span>08:00 AM</span>
                <span>10:00 AM</span>
                <span>12:00 PM</span>
                <span>02:00 PM</span>
                <span>04:00 PM</span>
                <span>06:00 PM</span>
              </div>
            </section>
          </div>

          {/* System Status & Overrides Preview */}
          <div className="p-5 rounded-[2rem] bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <h3 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Recent System Conflicts & Overrides
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-[#0B0F19]/60 border border-slate-100/60 dark:border-transparent rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-foreground">Room 102 Lecture Override</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Professor Watson rescheduled Web Programming to Tuesday 10:00 AM</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 font-semibold px-2 py-0.5 rounded-full text-[9px]">Resolved</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#0B0F19]/60 border border-slate-100/60 dark:border-transparent rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-foreground">Lab Attendance Adjustment</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Automated override system approved attendance slot validation for CSE Section B</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 font-semibold px-2 py-0.5 rounded-full text-[9px]">Resolved</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#0B0F19]/60 border border-slate-100/60 dark:border-transparent rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-foreground">Timetable Lock Status</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Term SPRING_2026 timetable structures locked against manual modifications</p>
                </div>
                <span className="bg-amber-500/10 text-amber-500 font-semibold px-2 py-0.5 rounded-full text-[9px]">Locked</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <AnnouncementAdmin
            announcements={announcements}
            onAnnouncementsChange={setAnnouncements}
          />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="p-6 rounded-[2rem] bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent space-y-6 max-w-4xl mx-auto shadow-sm transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-foreground">
                Portal Onboarding Console
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Register new Student, Faculty, or Admin accounts manually or in bulk via CSV.
              </p>
            </div>

            <div className="flex bg-neutral-100 dark:bg-zinc-950 p-1 rounded-xl border border-border/50 self-start sm:self-auto">
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
                    className="login-input bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground"
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
                    className="login-input bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground"
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
                    className="login-input bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground"
                  />
                </div>

                {/* Role Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Account Role *</label>
                  <select
                    name="role"
                    value={userForm.role}
                    onChange={handleUserFormChange}
                    className="login-input bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Roll Number */}
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
                    className="login-input bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground"
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
                      className="login-input bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground"
                    />
                  </div>
                )}

                {/* Department (Only displayed for Admin, optional) */}
                {userForm.role === 'ADMIN' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Department / Scope</label>
                      <input
                        type="text"
                        name="department"
                        value={userForm.department}
                        onChange={handleUserFormChange}
                        placeholder="e.g. Computer Science (blank for Super Admin)"
                        className="login-input bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-205 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Year Scope</label>
                      <select
                        name="year"
                        value={userForm.year}
                        onChange={handleUserFormChange}
                        className="login-input bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-205 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground dark:text-slate-100"
                      >
                        <option value="" className="bg-white dark:bg-[#161B26]">All Years (Super/Global Admin)</option>
                        <option value="1" className="bg-white dark:bg-[#161B26]">Year 1 Scope</option>
                        <option value="2" className="bg-white dark:bg-[#161B26]">Year 2 Scope</option>
                        <option value="3" className="bg-white dark:bg-[#161B26]">Year 3 Scope</option>
                        <option value="4" className="bg-white dark:bg-[#161B26]">Year 4 Scope</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Password info message for student/faculty */}
              {userForm.role === 'STUDENT' && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-[#6366F1] rounded-xl text-[11px] font-medium font-semibold">
                  Note: A default password of <strong>Student@123</strong> will be assigned to this student account.
                </div>
              )}
              {userForm.role === 'FACULTY' && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-[#6366F1] rounded-xl text-[11px] font-medium font-semibold">
                  Note: A default password of <strong>Faculty@123</strong> will be assigned to this faculty account.
                </div>
              )}

              {/* Conditional Student Details */}
              {userForm.role === 'STUDENT' && (() => {
                const disableYearSelect = !isSuperAdmin && adminProfile?.yearScope;
                const matchingBatch = batches.find(b => b.batchName?.toLowerCase() === adminProfile?.department?.toLowerCase());
                const disableBatchSelect = !isSuperAdmin && adminProfile?.department && matchingBatch;
                
                const filteredSections = sections.filter(sec => {
                  if (userForm.year && sec.year !== parseInt(userForm.year)) return false;
                  if (userForm.batchId && sec.batchId !== parseInt(userForm.batchId)) return false;
                  return true;
                });

                return (
                  <div className="p-4 bg-slate-50 dark:bg-[#0B0F19]/60 border border-border/50 rounded-xl space-y-4">
                    <span className="text-xs font-bold text-indigo-500">Student Profile Information</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Current Year *</label>
                        <select
                          name="year"
                          value={userForm.year}
                          onChange={handleUserFormChange}
                          disabled={!!disableYearSelect}
                          className="login-input bg-background border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs w-full text-foreground disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800"
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
                          disabled={!!disableBatchSelect}
                          className="login-input bg-background border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs w-full text-foreground disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800"
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
                          className="login-input bg-background border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs w-full text-foreground"
                        >
                          <option value="">Select Section</option>
                          {filteredSections.map(sec => (
                            <option key={sec.id} value={sec.id}>
                              {sec.sectionName}
                            </option>
                          ))}
                        </select>
                        
                        {/* Inline Section Creation */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <input
                            type="text"
                            placeholder="Add new section..."
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            className="bg-background border border-slate-250 dark:border-slate-800 rounded-lg py-1.5 px-2 text-[11px] w-full text-foreground focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddSection}
                            disabled={isAddingSection}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            title="Create Section"
                          >
                            {isAddingSection ? '...' : '+'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Conditional Faculty Details */}
              {userForm.role === 'FACULTY' && (
                <div className="p-4 bg-slate-50 dark:bg-[#0B0F19]/60 border border-border/50 rounded-xl space-y-4">
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
                        className="login-input bg-background border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs w-full text-foreground"
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
                        className="login-input bg-background border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs w-full text-foreground"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Assigned Sections</label>
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-background border border-slate-200 dark:border-slate-800 rounded-xl max-h-48 overflow-y-auto">
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-[#0B0F19]/60 p-4 border border-border/50 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-foreground">1. Select Target Role</h4>
                  <p className="text-[10px] text-muted-foreground">Select the role of the users contained in your CSV file.</p>
                </div>
                <div className="flex bg-neutral-100 dark:bg-zinc-900 p-1 rounded-xl border border-border/50">
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
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-[#6366F1] rounded-xl text-[11px] font-medium font-semibold">
                Note: Standard default passwords (<strong>{bulkRole === 'STUDENT' ? 'Student@123' : 'Faculty@123'}</strong>) will be assigned to all imported profiles.
              </div>

              {/* Drag and Drop Dropzone / File Picker */}
              {parsedRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-indigo-500/60 rounded-2xl p-8 transition-all bg-slate-50/50 dark:bg-zinc-950/20 text-center">
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
                  <div className="mt-4 p-3 bg-neutral-100 dark:bg-zinc-900/50 border border-border/50 rounded-xl max-w-md text-left mx-auto">
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
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-[#0B0F19]/60 p-3 border border-border/40 rounded-xl">
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
                  <div className="overflow-x-auto border border-border/50 rounded-xl bg-neutral-50/20 max-h-96 scrollbar-thin">
                    <table className="min-w-[700px] w-full border-collapse text-left text-xs">
                      <thead className="bg-neutral-100 dark:bg-zinc-900 sticky top-0 border-b border-border/50 text-muted-foreground font-semibold text-[10px] uppercase">
                        <tr>
                          <th className="p-3">ID / Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Resolved Mappings</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {parsedRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-neutral-100/50 dark:hover:bg-zinc-800/30 transition-colors">
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