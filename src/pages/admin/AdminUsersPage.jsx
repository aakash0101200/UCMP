import React, { useState, useEffect, useMemo } from 'react';
import DirectoryMindmap from '../../components/layout/DirectoryMindmap';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Users,
  GraduationCap,
  Briefcase,
  Shield,
  Mail,
  Hash,
  Layers,
  KeyRound,
  Pencil,
  Trash2,
  X,
  Check,
  RefreshCw,
  UserPlus,
  Plus,
  HelpCircle,
  CheckCircle,
  FileText
} from 'lucide-react';
import {
  resetUserPassword,
  updateStudentSection,
  updateFacultySections,
  deleteUser,
  getDepartments,
  getDepartmentSections,
  getDepartmentFaculty,
  getSectionStudents,
  getAllUsers,
  getAllBatches
} from '../../Services/admin';
import { getAllSections } from '../../Services/timetable';
import { register, adminCreateStudent, adminCreateFaculty } from '../../Services/auth';
import { getProfile } from '../../Services/profile';
import baseAPI from '../../Services/api';
import { toast } from 'react-toastify';

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
      clean === key.toLowerCase() || headerAliases[key].includes(clean)
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

const findSectionMatch = (sections, inputName, batchId = null, year = null) => {
  if (!inputName) return null;
  const cleanInput = inputName.trim().toLowerCase();

  // Filter sections by batchId and year if provided
  const candidates = sections.filter(s => {
    if (batchId && s.batchId !== batchId) return false;
    if (year && s.year !== year) return false;
    return true;
  });

  // Try exact match first among candidates
  let match = candidates.find(s => s.sectionName?.toLowerCase() === cleanInput);
  if (match) return match;

  // Try fallback matching among candidates
  match = candidates.find(s => {
    const cleanSec = s.sectionName?.toLowerCase() || '';
    return cleanSec === `section ${cleanInput}` ||
      cleanSec === `section-${cleanInput}` ||
      cleanInput === `section ${cleanSec}` ||
      cleanInput === `section-${cleanSec}` ||
      cleanSec.replace(/[^a-z0-9]/g, '') === cleanInput.replace(/[^a-z0-9]/g, '');
  });
  if (match) return match;

  // If no candidate matches, fallback to search all sections
  return sections.find(s => s.sectionName?.toLowerCase() === cleanInput);
};

const getCleanSectionName = (secName) => {
  if (!secName) return '';
  return secName.split('(')[0].trim();
};

export default function AdminUsersPage() {
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState('');
  const [activeBranchType, setActiveBranchType] = useState(''); // 'Faculty' | 'Sections'
  const [activeSectionId, setActiveSectionId] = useState('');

  const [sectionsList, setSectionsList] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [personnelPage, setPersonnelPage] = useState(0);
  const [hasLoadedAll, setHasLoadedAll] = useState(true);

  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingPersonnel, setLoadingPersonnel] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);

  // Global sections list (for reassignment dropdowns)
  const [sections, setSections] = useState([]);

  // Modals state
  const [editingUser, setEditingUser] = useState(null); // student or faculty object
  const [deletingUser, setDeletingUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [resetSuccessPassword, setResetSuccessPassword] = useState('');

  // Edit forms state
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [facultySectionIds, setFacultySectionIds] = useState([]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'register' ? 'register' : 'mindmap');

  // Onboarding console states
  const [adminProfile, setAdminProfile] = useState(null);
  const [batches, setBatches] = useState([]);
  const [regType, setRegType] = useState('single'); // 'single' | 'bulk'
  const [bulkRole, setBulkRole] = useState('STUDENT');
  const [parsedRecords, setParsedRecords] = useState([]);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

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
  const [newSectionName, setNewSectionName] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);

  const isSuperAdmin = !adminProfile?.department ||
    adminProfile.department.toLowerCase() === 'administration' ||
    localStorage.getItem("collegeId") === 'ADMIN_001';

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newUrl = tab === 'register' ? '?tab=register' : '?tab=mindmap';
    window.history.pushState(null, '', newUrl);
  };

  // Initial load
  useEffect(() => {
    const initData = async () => {
      setLoadingDepts(true);
      try {
        const loggedInCollegeId = localStorage.getItem("collegeId");
        const [deptsRes, sectionsRes, batchesRes, profileRes] = await Promise.allSettled([
          getDepartments(),
          getAllSections(),
          getAllBatches(),
          getProfile(loggedInCollegeId)
        ]);

        if (deptsRes.status === 'fulfilled') {
          setDepartments(deptsRes.value.data || []);
        } else {
          console.error('Failed to load departments:', deptsRes.reason);
        }

        if (sectionsRes.status === 'fulfilled') {
          setSections(sectionsRes.value.data || []);
        } else {
          console.error('Failed to load sections:', sectionsRes.reason);
        }

        if (batchesRes.status === 'fulfilled') {
          setBatches(batchesRes.value.data || []);
        } else {
          console.error('Failed to load batches:', batchesRes.reason);
        }

        if (profileRes.status === 'fulfilled') {
          setAdminProfile(profileRes.value.data || null);
        } else {
          console.error('Failed to load admin profile:', profileRes.reason);
        }
      } catch (err) {
        console.error('Failed to load initial directory data:', err);
        toast.error('Failed to load academic departments.');
      } finally {
        setLoadingDepts(false);
      }
    };
    initData();
  }, []);

  // Sync userForm defaults with admin profile scope
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

  // Fetch sections list when active department changes
  useEffect(() => {
    if (!activeDept || activeDept === 'Administration') {
      setSectionsList([]);
      return;
    }
    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const res = await getDepartmentSections(activeDept);
        setSectionsList(res.data || []);
      } catch (err) {
        console.error('Failed to load sections:', err);
        toast.error('Failed to load department sections.');
      } finally {
        setLoadingSections(false);
      }
    };
    fetchSections();
  }, [activeDept]);

  // Fetch personnel list when path criteria change
  useEffect(() => {
    if (activeDept) {
      setPersonnelList([]);
      setPersonnelPage(0);
      setHasLoadedAll(true);
      fetchPersonnel(0, false);
    } else {
      setPersonnelList([]);
    }
  }, [activeDept, activeBranchType, activeSectionId]);

  // Load all users for flat search list if search is active
  useEffect(() => {
    if (searchQuery.trim()) {
      const fetchAll = async () => {
        setLoadingAllUsers(true);
        try {
          const res = await getAllUsers();
          setAllUsers(res.data || []);
        } catch (err) {
          console.error('Search data fetch failed:', err);
        } finally {
          setLoadingAllUsers(false);
        }
      };
      fetchAll();
    }
  }, [searchQuery]);

  const fetchPersonnel = async (pageNumber = 0, append = false) => {
    if (!activeDept) return;
    if (activeBranchType === 'Sections' && !activeSectionId) {
      setPersonnelList([]);
      return;
    }

    setLoadingPersonnel(true);
    try {
      let res;
      if (activeBranchType === 'Faculty') {
        res = await getDepartmentFaculty(activeDept, pageNumber, 12);
      } else if (activeBranchType === 'Sections' && activeSectionId) {
        res = await getSectionStudents(activeSectionId, pageNumber, 12);
      }

      if (res && res.data) {
        const { content, last } = res.data;
        if (append) {
          setPersonnelList(prev => [...prev, ...content]);
        } else {
          setPersonnelList(content);
        }
        setPersonnelPage(pageNumber);
        setHasLoadedAll(last);
      }
    } catch (err) {
      console.error('Failed to load personnel:', err);
      toast.error('Failed to load directory members.');
    } finally {
      setLoadingPersonnel(false);
    }
  };

  const handleLoadMore = () => {
    fetchPersonnel(personnelPage + 1, true);
  };

  // Path selection triggers
  const handleDeptClick = (dept) => {
    if (activeDept === dept) {
      setActiveDept('');
      setActiveBranchType('');
      setActiveSectionId('');
    } else {
      setActiveDept(dept);
      setActiveBranchType('');
      setActiveSectionId('');
    }
  };

  const handleBranchTypeClick = (type) => {
    if (activeBranchType === type) {
      setActiveBranchType('');
      setActiveSectionId('');
    } else {
      setActiveBranchType(type);
      setActiveSectionId('');
    }
  };

  const handleSectionClick = (sectionId) => {
    if (activeSectionId === sectionId) {
      setActiveSectionId('');
    } else {
      setActiveSectionId(sectionId);
    }
  };
  const refreshActiveData = () => {
    fetchPersonnel(0, false);
    if (searchQuery.trim()) {
      getAllUsers().then(res => setAllUsers(res.data || [])).catch(console.error);
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    const defaultForm = {
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
    };

    if (adminProfile && batches.length > 0) {
      const isSuper = !adminProfile.department ||
        adminProfile.department.toLowerCase() === 'administration' ||
        localStorage.getItem("collegeId") === 'ADMIN_001';

      if (!isSuper) {
        const matchingBatch = findBatchMatch(batches, adminProfile.department);
        if (adminProfile.yearScope) {
          defaultForm.year = adminProfile.yearScope.toString();
        }
        if (matchingBatch) {
          defaultForm.batchId = matchingBatch.id.toString();
        }
      }
    }
    setUserForm(defaultForm);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingUser(true);

    const rollNo = userForm.rollNumber.trim() || userForm.collegeId.trim();

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

      resetForm();
    } catch (err) {
      console.error("Failed to register user:", err);
      const backendMessage = err.response?.data?.message || err.message || "Unknown error";
      toast.error(`Registration failed: ${backendMessage}`);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
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
        val = val.replace(/^["']|["']$/g, '');
        row[header] = val;
      });
      records.push(row);
    }
    return records;
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = parseCSV(text);
      if (rows.length === 0) return;

      const headerMap = mapHeaders(Object.keys(rows[0] || {}));

      const validated = rows.map((row, idx) => {
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

          const bMatch = findBatchMatch(batches, normRow.batchName);
          const sMatch = findSectionMatch(
            sections,
            normRow.sectionName,
            bMatch ? bMatch.id : null,
            parseInt(normRow.year) || 1
          );

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

          const facultySectionIds = [];
          const rawSectionVal = normRow.sectionNames || normRow.sectionName;
          if (rawSectionVal) {
            const names = rawSectionVal.split(';').map(n => n.trim());
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
          resolvedDetails = `Dept: ${normRow.department || 'N/A'}, Sections: ${rawSectionVal || 'None'}`;
        }

        return {
          id: idx,
          raw: row,
          mapped: mappedData,
          errors,
          resolvedDetails,
          status: errors.length > 0 ? 'invalid' : 'pending',
          message: errors.length > 0 ? errors.join('; ') : 'Ready for import'
        };
      });

      setParsedRecords(validated);
      toast.info(`Parsed ${validated.length} rows. Please review before uploading.`);
    };
    reader.readAsText(file);
  };

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
  };

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

  // Actions handlers
  const handleResetPassword = async () => {
    if (!resettingUser) return;
    try {
      const res = await resetUserPassword(resettingUser.collegeId);
      const tempPass = res.data?.temporaryPassword || '';
      if (tempPass) {
        setResetSuccessPassword(tempPass);
        toast.success(res.data?.message || 'Password reset successfully.');
      } else {
        toast.success('Password reset successfully.');
        setResettingUser(null);
      }
      refreshActiveData();
    } catch (err) {
      console.error('Password reset failed:', err);
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to reset password.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser.collegeId);
      toast.success(`User ${deletingUser.name} deleted successfully.`);
      setDeletingUser(null);
      refreshActiveData();
    } catch (err) {
      console.error('Deletion failed:', err);
      toast.error(err.response?.data || 'Failed to delete user.');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    if (user.role === 'STUDENT') {
      const matched = sections.find(s => s.sectionName === user.sectionName);
      setSelectedSectionId(matched ? matched.id : '');
    } else if (user.role === 'FACULTY') {
      setFacultySectionIds(user.sectionIds || []);
    }
  };

  const handleUpdateStudentSection = async () => {
    if (!editingUser || !selectedSectionId) return;
    try {
      await updateStudentSection(editingUser.collegeId, parseInt(selectedSectionId));
      toast.success(`Transferred ${editingUser.name} to the new section.`);
      setEditingUser(null);
      refreshActiveData();
    } catch (err) {
      console.error('Section transfer failed:', err);
      toast.error(err.response?.data || 'Failed to transfer student.');
    }
  };

  const handleUpdateFacultySections = async () => {
    if (!editingUser) return;
    try {
      await updateFacultySections(editingUser.collegeId, facultySectionIds);
      toast.success(`Updated class teaching assignments for ${editingUser.name}.`);
      setEditingUser(null);
      refreshActiveData();
    } catch (err) {
      console.error('Faculty assignment update failed:', err);
      toast.error(err.response?.data || 'Failed to update sections.');
    }
  };

  const toggleFacultySection = (id) => {
    setFacultySectionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Search Results filtering
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return allUsers.filter(user =>
      user.name?.toLowerCase().includes(query) ||
      user.collegeId?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.rollNumber?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  }, [allUsers, searchQuery]);

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

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#161B26] border border-slate-100 dark:border-slate-800/60 p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-[#6366F1] tracking-wider uppercase">
            Administrative Command Registry
          </span>
          <h1 className="text-4xl font-light tracking-tight mt-1 text-slate-900 dark:text-white">
            {activeTab === 'register' ? 'User Onboarding Console' : 'User Mindmap Tree'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === 'register'
              ? 'Register new Student, Faculty, or Admin accounts manually or in bulk via CSV.'
              : 'Browse corporate structure, reassign sections, and manage accounts dynamically level-by-level.'}
          </p>
        </div>

        {activeTab === 'mindmap' && (
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search directory..."
              className="w-full bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* BEGIN: Tabs Bar */}
      <div className="flex bg-white/80 dark:bg-[#161B26] p-1 rounded-2xl border border-slate-100/60 dark:border-transparent w-fit gap-2 shadow-sm">
        <button
          onClick={() => handleTabChange('mindmap')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'mindmap'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
            }`}
        >
          <Users className="w-3.5 h-3.5" />
          Directory Mindmap
        </button>
        <button
          onClick={() => handleTabChange('register')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === 'register'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
            }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          User Registration
        </button>
      </div>
      {/* END: Tabs Bar */}

      {loadingDepts ? (
        <div className="flex flex-col items-center justify-center py-24">
          <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">
            Loading registry connections...
          </p>
        </div>
      ) : activeTab === 'register' ? (
        /* Portal Onboarding Console */
        <div className="p-6 rounded-[2rem] bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent space-y-6 max-w-4xl mx-auto shadow-sm transition-all duration-300 animate-in fade-in duration-200">
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
                        className="login-input bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Year Scope</label>
                      <select
                        name="year"
                        value={userForm.year}
                        onChange={handleUserFormChange}
                        className="login-input bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs w-full text-foreground dark:text-slate-100"
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
                            className="bg-background border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-[11px] w-full text-foreground focus:outline-none focus:border-indigo-500"
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
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-indigo-500/60 rounded-2xl p-8 transition-all bg-slate-50/50 dark:bg-[#0B0F19]/40 text-center">
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
      ) : searchQuery.trim() ? (
        /* Flat Search View */
        <div className="space-y-4">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Search Matches ({filteredUsers.length})
          </div>
          {loadingAllUsers ? (
            <div className="text-center py-12">
              <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
              <span className="text-xs text-slate-400">Searching records...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#161B26] border border-slate-100 dark:border-slate-800/60 rounded-3xl text-slate-400 dark:text-slate-500 shadow-sm">
              No matching records found in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map(person => (
                <div
                  key={person.collegeId}
                  className="p-5 rounded-3xl bg-white dark:bg-[#161B26] border border-slate-100 dark:border-slate-800/60 hover:shadow-md hover:scale-[1.01] transition-all flex flex-col gap-3 shadow-sm text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{person.name}</h4>
                      <p className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 mt-0.5">{person.collegeId}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${person.role === 'ADMIN'
                      ? 'bg-amber-500/10 text-amber-500'
                      : person.role === 'FACULTY'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                      {person.role}
                    </span>
                  </div>

                  <div className="text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{person.email}</span>
                    </div>
                    {person.role === 'FACULTY' && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{person.designation || 'Faculty Staff'} ({person.department})</span>
                      </div>
                    )}
                    {person.role === 'STUDENT' && (
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span>Roll: {person.rollNumber} • Year {person.year} • Section: {person.sectionName || 'N/A'}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800/60 pt-2 mt-1">
                    <button
                      title={person.role === 'STUDENT' ? 'Transfer Section' : 'Assign Sections'}
                      onClick={() => openEditModal(person)}
                      className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Reset Password"
                      onClick={() => setResettingUser(person)}
                      className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-500 dark:text-amber-400 transition-all"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete User"
                      onClick={() => setDeletingUser(person)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Mindmap Visual Hierarchy Graph — React Flow + Dagre */
        <DirectoryMindmap
          departments={departments}
          activeDept={activeDept}
          activeBranchType={activeBranchType}
          activeSectionId={activeSectionId}
          sectionsList={sectionsList}
          loadingSections={loadingSections}
          personnelList={personnelList}
          loadingPersonnel={loadingPersonnel}
          hasLoadedAll={hasLoadedAll}
          onDeptClick={handleDeptClick}
          onBranchTypeClick={handleBranchTypeClick}
          onSectionClick={handleSectionClick}
          onLoadMore={handleLoadMore}
          onEdit={openEditModal}
          onResetPassword={setResettingUser}
          onDelete={setDeletingUser}
        />
      )}



      {/* Edit Section/Assignments Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#161B26] border border-slate-100 dark:border-slate-800/60 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in duration-200">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                {editingUser.role === 'STUDENT' ? <GraduationCap className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Modify User Access</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Adjust attributes for {editingUser.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">College ID</span>
                <p className="font-mono text-sm font-semibold text-indigo-500 dark:text-indigo-400 mt-0.5">{editingUser.collegeId}</p>
              </div>

              {/* STUDENT: Section transfer select */}
              {editingUser.role === 'STUDENT' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reassign Section</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 cursor-pointer"
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                  >
                    <option value="" className="bg-white dark:bg-[#161B26]">-- Choose New Section --</option>
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.id} className="bg-white dark:bg-[#161B26]">
                        {getCleanSectionName(sec.sectionName)} ({sec.batchName || 'N/A'} - Yr {sec.year || ''})
                      </option>
                    ))}

                  </select>
                  <p className="text-[11px] text-slate-400">
                    Changing the student's section automatically synchronizes their batch/branch mappings.
                  </p>
                </div>
              )}

              {/* FACULTY: Sections checkbox grid */}
              {editingUser.role === 'FACULTY' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assign Taught Classes/Sections</label>
                  <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800/60 rounded-xl p-3 bg-slate-50 dark:bg-[#0B0F19]/20 grid grid-cols-2 gap-2.5">
                    {sections.length === 0 ? (
                      <p className="text-xs text-slate-400 col-span-2 text-center py-4">No sections available.</p>
                    ) : (
                      sections.map(sec => {
                        const isChecked = facultySectionIds.includes(sec.id);
                        return (
                          <div
                            key={sec.id}
                            onClick={() => toggleFacultySection(sec.id)}
                            className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer select-none text-xs font-semibold transition-all ${isChecked
                              ? 'bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                              : 'border-slate-200 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                              }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-400 dark:border-slate-600'
                              }`}>
                              {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="truncate text-xs font-normal" title={`${getCleanSectionName(sec.sectionName)} (${sec.batchName || 'N/A'} - Yr ${sec.year || ''})`}>
                              {getCleanSectionName(sec.sectionName)} ({sec.batchName || 'N/A'} - Yr {sec.year || ''})
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Select the class sections this faculty member is authorized to teach and record attendance for.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingUser.role === 'STUDENT' ? handleUpdateStudentSection : handleUpdateFacultySections}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation: Password Reset Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#161B26] border border-slate-100 dark:border-slate-800/60 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in duration-200">
            {resetSuccessPassword ? (
              // Success Screen
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Temporary Password Generated</h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  The password for <strong className="text-slate-800 dark:text-white">{resettingUser.name}</strong> ({resettingUser.collegeId}) has been successfully reset. Provide this temporary password to the user to allow login:
                </p>

                <div className="flex items-center gap-2 p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-3 select-text">
                  <span className="font-mono text-base font-bold tracking-widest text-emerald-600 dark:text-emerald-400 flex-1 text-center">
                    {resetSuccessPassword}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetSuccessPassword);
                      toast.success("Password copied to clipboard!");
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    Copy
                  </button>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => {
                      setResettingUser(null);
                      setResetSuccessPassword('');
                    }}
                    className="px-5 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // Confirmation Dialog
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reset User Password</h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to reset the password for <strong className="text-slate-800 dark:text-white">{resettingUser.name}</strong> ({resettingUser.collegeId})?
                </p>
                <p className="text-xs text-amber-500 mt-2 font-medium bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  The password will be reset to a random, lookalike-safe 8-character temporary password.
                </p>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setResettingUser(null);
                      setResetSuccessPassword('');
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetPassword}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Confirm Reset
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmation: Deletion Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#161B26] border border-slate-100 dark:border-slate-800/60 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-500">Delete User Account</h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Warning! You are about to permanently delete <strong className="text-slate-800 dark:text-white">{deletingUser.name}</strong> (College ID: <span className="font-mono text-indigo-500 dark:text-indigo-400 font-semibold">{deletingUser.collegeId}</span>).
            </p>
            <p className="text-xs text-rose-500 mt-2 font-medium bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              This action is destructive and irreversible. All academic profiles, role associations, and personal settings linked to this user will be removed.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
