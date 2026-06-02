import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  RefreshCw
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
  getAllUsers
} from '../../Services/admin';
import { getAllSections } from '../../Services/timetable';
import { toast } from 'react-toastify';

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

  // SVGs Connectors coordinate state
  const [connectors, setConnectors] = useState([]);
  const containerRef = useRef(null);

  // Initial load
  useEffect(() => {
    const initData = async () => {
      setLoadingDepts(true);
      try {
        const [deptsRes, sectionsRes] = await Promise.all([
          getDepartments(),
          getAllSections()
        ]);
        setDepartments(deptsRes.data || []);
        setSections(sectionsRes.data || []);
      } catch (err) {
        console.error('Failed to load initial directory data:', err);
        toast.error('Failed to load academic departments.');
      } finally {
        setLoadingDepts(false);
      }
    };
    initData();
  }, []);

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
        res = await getDepartmentFaculty(activeDept, pageNumber, 30);
      } else if (activeBranchType === 'Sections' && activeSectionId) {
        res = await getSectionStudents(activeSectionId, pageNumber, 30);
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

  // Recalculate coordinates for mindmap Bezier lines
  const updateConnectors = () => {
    if (!containerRef.current || searchQuery.trim()) {
      setConnectors([]);
      return;
    }
    const containerRect = containerRef.current.getBoundingClientRect();
    const newConnectors = [];

    // Query node DOM elements by identifier
    const nodes = containerRef.current.querySelectorAll('[data-node-id]');
    const nodeRects = {};

    nodes.forEach(node => {
      const id = node.getAttribute('data-node-id');
      nodeRects[id] = node.getBoundingClientRect();
    });

    nodes.forEach(node => {
      const id = node.getAttribute('data-node-id');
      const parentId = node.getAttribute('data-parent-id');

      if (parentId && nodeRects[parentId] && nodeRects[id]) {
        const parentRect = nodeRects[parentId];
        const childRect = nodeRects[id];

        // Calculate absolute center-right of parent and center-left of child relative to container scroll
        const parentX = parentRect.left - containerRect.left + parentRect.width;
        const parentY = parentRect.top - containerRect.top + parentRect.height / 2;

        const childX = childRect.left - containerRect.left;
        const childY = childRect.top - containerRect.top + childRect.height / 2;

        newConnectors.push({
          id: `${parentId}-${id}`,
          x1: parentX,
          y1: parentY,
          x2: childX,
          y2: childY
        });
      }
    });

    setConnectors(newConnectors);
  };

  // Triggers updates on UI changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateConnectors();
    }, 150);
    return () => clearTimeout(timer);
  }, [activeDept, activeBranchType, activeSectionId, personnelList, searchQuery, departments]);

  useEffect(() => {
    window.addEventListener('resize', updateConnectors);
    return () => window.removeEventListener('resize', updateConnectors);
  }, []);

  // Update connectors on container scroll to keep curves anchored correctly
  const handleScroll = () => {
    updateConnectors();
  };

  const refreshActiveData = () => {
    fetchPersonnel(0, false);
    if (searchQuery.trim()) {
      getAllUsers().then(res => setAllUsers(res.data || [])).catch(console.error);
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
            User Mindmap Tree
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse corporate structure, reassign sections, and manage accounts dynamically level-by-level.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search directory..."
            className="w-full bg-slate-55 dark:bg-[#0B0F19]/40 border border-slate-205 dark:border-slate-800/60 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loadingDepts ? (
        <div className="flex flex-col items-center justify-center py-24">
          <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">
            Loading registry connections...
          </p>
        </div>
      ) : searchQuery.trim() ? (
        /* Flat Search View */
        <div className="space-y-4">
          <div className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
            Search Matches ({filteredUsers.length})
          </div>
          {loadingAllUsers ? (
            <div className="text-center py-12">
              <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
              <span className="text-xs text-slate-400">Searching records...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#161B26] border border-slate-100 dark:border-slate-800/60 rounded-3xl text-slate-450 dark:text-slate-500 shadow-sm">
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
        /* Mindmap Visual Hierarchy Graph */
        <div
          ref={containerRef}
          onScroll={handleScroll}
          id="mindmap-container"
          className="flex overflow-x-auto gap-16 py-12 px-6 relative min-h-[600px] w-full rounded-3xl bg-white dark:bg-[#161B26] border border-slate-100 dark:border-slate-800/60 no-scrollbar select-none shadow-sm"
        >
          {/* SVG Connections Overlay */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
            {connectors.map(conn => {
              const dx = Math.abs(conn.x2 - conn.x1) * 0.45;
              const pathStr = `M ${conn.x1} ${conn.y1} C ${conn.x1 + dx} ${conn.y1}, ${conn.x2 - dx} ${conn.y2}, ${conn.x2} ${conn.y2}`;
              return (
                <path
                  key={conn.id}
                  d={pathStr}
                  stroke="url(#mindmap-grad)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  className="opacity-70 dark:opacity-40 transition-all duration-300"
                />
              );
            })}
            <defs>
              <linearGradient id="mindmap-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Column 1: Departments */}
          <div className="flex flex-col gap-4 z-10 w-60 shrink-0 justify-center">
            <div className="text-center font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Departments</div>
            {departments.map(dept => {
              const isSelected = activeDept === dept;
              return (
                <div
                  key={dept}
                  data-node-id={`dept:${dept}`}
                  onClick={() => handleDeptClick(dept)}
                  className={`p-4 rounded-2xl border transition-all duration-250 cursor-pointer text-center ${isSelected
                      ? 'bg-slate-900 text-white dark:bg-slate-105 dark:text-slate-900 border-transparent shadow-md scale-[1.02] font-semibold'
                      : 'bg-slate-50/80 dark:bg-[#0b0f19]/30 border-slate-200/50 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:scale-[1.02] text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <span className="text-xs font-bold">{dept}</span>
                </div>
              );
            })}
          </div>

          {/* Column 2: Branch Types */}
          {activeDept && (
            <div className="flex flex-col gap-8 z-10 w-60 shrink-0 justify-center">
              <div className="text-center font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Branch Categories</div>

              {/* Faculty Branch */}
              <div
                data-node-id="branch:Faculty"
                data-parent-id={`dept:${activeDept}`}
                onClick={() => handleBranchTypeClick('Faculty')}
                className={`p-4 rounded-2xl border transition-all duration-250 cursor-pointer text-center ${activeBranchType === 'Faculty'
                    ? 'bg-slate-900 text-white dark:bg-slate-105 dark:text-slate-900 border-transparent shadow-md scale-[1.02] font-semibold'
                    : 'bg-slate-50/80 dark:bg-[#0b0f19]/30 border-slate-200/50 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:scale-[1.02] text-slate-700 dark:text-slate-300'
                  }`}
              >
                <span className="text-xs font-bold flex items-center justify-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  Faculty staff
                </span>
              </div>

              {/* Sections Branch */}
              {activeDept !== 'Administration' && (
                <div
                  data-node-id="branch:Sections"
                  data-parent-id={`dept:${activeDept}`}
                  onClick={() => handleBranchTypeClick('Sections')}
                  className={`p-4 rounded-2xl border transition-all duration-250 cursor-pointer text-center ${activeBranchType === 'Sections'
                      ? 'bg-slate-900 text-white dark:bg-slate-105 dark:text-slate-900 border-transparent shadow-md scale-[1.02] font-semibold'
                      : 'bg-slate-50/80 dark:bg-[#0b0f19]/30 border-slate-200/50 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:scale-[1.02] text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <span className="text-xs font-bold flex items-center justify-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Sections list
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Column 3: Sections */}
          {activeDept && activeBranchType === 'Sections' && (
            <div className="flex flex-col gap-4 z-10 w-60 shrink-0 justify-center">
              <div className="text-center font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Sections</div>
              {loadingSections ? (
                <div className="text-center text-xs text-slate-400">Loading sections...</div>
              ) : sectionsList.length === 0 ? (
                <div className="text-center text-xs text-slate-400">No sections found.</div>
              ) : (
                sectionsList.map(sec => {
                  const isSelected = activeSectionId === sec.id;
                  return (
                    <div
                      key={sec.id}
                      data-node-id={`sec:${sec.id}`}
                      data-parent-id="branch:Sections"
                      onClick={() => handleSectionClick(sec.id)}
                      className={`p-4 rounded-2xl border transition-all duration-250 cursor-pointer text-center ${isSelected
                          ? 'bg-slate-900 text-white dark:bg-slate-105 dark:text-slate-900 border-transparent shadow-md scale-[1.02] font-semibold'
                          : 'bg-slate-50/80 dark:bg-[#0b0f19]/30 border-slate-200/50 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:scale-[1.02] text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      <span className="text-xs font-bold">{sec.sectionName}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Column 4: Personnel Directory */}
          {((activeDept && activeBranchType === 'Faculty') || (activeBranchType === 'Sections' && activeSectionId)) && (
            <div className="flex flex-col gap-4 z-10 w-72 shrink-0 max-h-[550px] overflow-y-auto no-scrollbar p-3 border border-slate-100 dark:border-slate-800/60 rounded-3xl bg-slate-50/60 dark:bg-[#0B0F19]/30 shadow-inner">
              <div className="text-center font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 sticky top-0 py-1 bg-transparent">
                {activeBranchType === 'Faculty' ? 'Faculty Directory' : 'Enrolled Students'}
              </div>

              {loadingPersonnel && personnelList.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-8">Loading directory...</div>
              ) : personnelList.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-8">No records registered.</div>
              ) : (
                <>
                  {personnelList.map(person => (
                    <div
                      key={person.collegeId}
                      data-node-id={`person:${person.collegeId}`}
                      data-parent-id={activeBranchType === 'Faculty' ? 'branch:Faculty' : `sec:${activeSectionId}`}
                      className="p-4 rounded-2xl bg-white dark:bg-[#161B26] border border-slate-150/80 dark:border-slate-800/50 hover:shadow-md hover:scale-[1.01] transition-all flex flex-col gap-2 shadow-sm text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs">{person.name}</h4>
                          <p className="text-[9px] font-mono text-indigo-500 dark:text-indigo-400 mt-0.5">{person.collegeId}</p>
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

                      <div className="text-slate-500 dark:text-slate-400 space-y-1 text-[10px]">
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
                            <span>Roll: {person.rollNumber} • Year {person.year}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800/60 pt-2 mt-1">
                        <button
                          title={person.role === 'STUDENT' ? 'Transfer Section' : 'Assign Sections'}
                          onClick={() => openEditModal(person)}
                          className="p-1 rounded hover:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Reset Password"
                          onClick={() => setResettingUser(person)}
                          className="p-1 rounded hover:bg-amber-500/10 text-amber-500 dark:text-amber-400 transition-all"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete User"
                          onClick={() => setDeletingUser(person)}
                          className="p-1 rounded hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Load More Button Node */}
                  {!hasLoadedAll && (
                    <div
                      onClick={handleLoadMore}
                      className="p-3 text-center border border-dashed border-slate-200 dark:border-slate-800/60 hover:border-indigo-500 rounded-2xl cursor-pointer hover:bg-white dark:hover:bg-[#161B26] transition-all text-xs font-bold text-indigo-500 dark:text-indigo-400 select-none shadow-sm"
                    >
                      {loadingPersonnel ? (
                        <div className="flex items-center justify-center gap-1">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading next batch...</span>
                        </div>
                      ) : (
                        <span>Load More Records...</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
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
                    className="w-full bg-slate-55 dark:bg-[#0B0F19]/40 border border-slate-205 dark:border-slate-800/60 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 cursor-pointer"
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                  >
                    <option value="" className="bg-white dark:bg-[#161B26]">-- Choose New Section --</option>
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.id} className="bg-white dark:bg-[#161B26]">
                        {sec.sectionName} ({sec.batchName || 'N/A'} - Yr {sec.year || ''})
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
                  <div className="max-h-60 overflow-y-auto border border-slate-205 dark:border-slate-800/60 rounded-xl p-3 bg-slate-55 dark:bg-[#0B0F19]/20 grid grid-cols-2 gap-2.5">
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
                            <span className="truncate text-xs font-normal" title={`${sec.sectionName} (${sec.batchName || 'N/A'} - Yr ${sec.year || ''})`}>
                              {sec.sectionName} ({sec.batchName || 'N/A'} - Yr {sec.year || ''})
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
                className="px-4 py-2 border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingUser.role === 'STUDENT' ? handleUpdateStudentSection : handleUpdateFacultySections}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
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
          <div className="bg-white dark:bg-[#161B26] border border-slate-105 dark:border-slate-805/60 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in duration-200">
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
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
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
          <div className="bg-white dark:bg-[#161B26] border border-slate-105 dark:border-slate-805/60 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in duration-200">
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
                className="px-4 py-2 border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
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
