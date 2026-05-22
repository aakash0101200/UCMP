import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Shield, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Mail, 
  User, 
  Hash, 
  FileText,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import { getAllUsers } from '../../Services/admin';
import { toast } from 'react-toastify';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State to track which nodes are expanded
  // Keys can be: 'dept:CSE', 'dept:CSE:admins', 'dept:CSE:faculty', 'dept:CSE:sections', 'dept:CSE:sec:Section A'
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Helper to expand all nodes matching a search, or collapse/expand general ones
  const expandAll = (nodesObj) => {
    setExpandedNodes(nodesObj);
  };

  // Main stats
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'ADMIN').length;
    const faculty = users.filter(u => u.role === 'FACULTY').length;
    const students = users.filter(u => u.role === 'STUDENT').length;
    return { total, admins, faculty, students };
  }, [users]);

  // Filter and group users based on search query
  const groupedData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Filter users first
    const filteredUsers = users.filter(user => {
      if (!query) return true;
      return (
        user.name?.toLowerCase().includes(query) ||
        user.collegeId?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.rollNumber?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    });

    // Grouping structure:
    // {
    //   [deptOrBranch]: {
    //      admins: [],
    //      faculty: [],
    //      sections: {
    //         [sectionName]: []
    //      }
    //   }
    // }
    const groups = {};

    filteredUsers.forEach(user => {
      let dept = 'Administration';
      
      if (user.role === 'FACULTY') {
        dept = user.department || 'Unassigned Faculty';
      } else if (user.role === 'STUDENT') {
        dept = user.branch || 'Unassigned Students';
      } else {
        dept = 'Administration';
      }

      if (!groups[dept]) {
        groups[dept] = {
          admins: [],
          faculty: [],
          sections: {}
        };
      }

      if (user.role === 'ADMIN') {
        groups[dept].admins.push(user);
      } else if (user.role === 'FACULTY') {
        groups[dept].faculty.push(user);
      } else if (user.role === 'STUDENT') {
        const sec = user.sectionName || 'No Section';
        if (!groups[dept].sections[sec]) {
          groups[dept].sections[sec] = [];
        }
        groups[dept].sections[sec].push(user);
      }
    });

    return groups;
  }, [users, searchQuery]);

  // Automatically expand folders if there is a search query active
  useEffect(() => {
    if (searchQuery.trim()) {
      const autoExpand = {};
      Object.keys(groupedData).forEach(dept => {
        autoExpand[`dept:${dept}`] = true;
        autoExpand[`dept:${dept}:admins`] = true;
        autoExpand[`dept:${dept}:faculty`] = true;
        autoExpand[`dept:${dept}:sections`] = true;
        
        Object.keys(groupedData[dept].sections).forEach(sec => {
          autoExpand[`dept:${dept}:sec:${sec}`] = true;
        });
      });
      setExpandedNodes(autoExpand);
    }
  }, [searchQuery, groupedData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <Activity className="w-10 h-10 text-indigo-600 dark:text-[#6366F1] animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading user directory hierarchy...
        </p>
      </div>
    );
  }

  return (
    <div className="scroll-style space-y-6 pb-20 p-6 max-w-6xl mx-auto text-foreground">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 border border-border/50 p-6 rounded-2xl">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-[#6366F1] tracking-wider uppercase">
            Management console
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
            User Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and search academic registry level-by-level
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            className="w-full bg-background/50 border border-border/80 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-muted-foreground/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Metric summary boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Users</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">{stats.total}</h2>
          <p className="text-[10px] text-muted-foreground mt-1">Overall accounts registered</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Admins</span>
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">{stats.admins}</h2>
          <p className="text-[10px] text-muted-foreground mt-1">System administrators</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Faculty</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">{stats.faculty}</h2>
          <p className="text-[10px] text-muted-foreground mt-1">Teaching staff members</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Students</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight mt-3">{stats.students}</h2>
          <p className="text-[10px] text-muted-foreground mt-1">Enrolled students</p>
        </div>
      </div>

      {/* Directory Tree Structure */}
      <div className="space-y-4">
        {Object.keys(groupedData).length === 0 ? (
          <div className="text-center py-16 bg-card/20 rounded-2xl border border-border/30">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Users Found</h3>
            <p className="text-sm text-muted-foreground/70">
              Try adjusting your search criteria or register new users.
            </p>
          </div>
        ) : (
          Object.keys(groupedData).sort().map(dept => {
            const deptNodeId = `dept:${dept}`;
            const isDeptExpanded = !!expandedNodes[deptNodeId];
            
            // Calculate department stats
            const deptAdmins = groupedData[dept].admins.length;
            const deptFaculty = groupedData[dept].faculty.length;
            let deptStudents = 0;
            Object.values(groupedData[dept].sections).forEach(secStudents => {
              deptStudents += secStudents.length;
            });
            const deptTotal = deptAdmins + deptFaculty + deptStudents;

            return (
              <div 
                key={dept} 
                className="bg-card border border-border/40 rounded-2xl overflow-hidden transition-all duration-200"
              >
                {/* Department Row */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 select-none transition-colors border-b border-border/20"
                  onClick={() => toggleNode(deptNodeId)}
                >
                  <div className="flex items-center gap-3">
                    {isDeptExpanded ? (
                      <FolderOpen className="w-5 h-5 text-indigo-500" />
                    ) : (
                      <Folder className="w-5 h-5 text-indigo-400" />
                    )}
                    <span className="font-bold text-base tracking-wide text-foreground">
                      {dept}
                    </span>
                    <span className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-[#6366F1] px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {deptTotal} {deptTotal === 1 ? 'User' : 'Users'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground/80">
                    <div className="hidden sm:flex items-center gap-3">
                      {deptAdmins > 0 && <span>Admins: {deptAdmins}</span>}
                      {deptFaculty > 0 && <span>Faculty: {deptFaculty}</span>}
                      {deptStudents > 0 && <span>Students: {deptStudents}</span>}
                    </div>
                    {isDeptExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>

                {/* Sub levels */}
                {isDeptExpanded && (
                  <div className="p-4 pl-8 space-y-3 bg-card/20 border-t border-border/10">
                    
                    {/* 1. Admins Node */}
                    {groupedData[dept].admins.length > 0 && (
                      <div className="space-y-1">
                        <div 
                          className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-muted/40 cursor-pointer text-sm font-semibold select-none"
                          onClick={() => toggleNode(`${deptNodeId}:admins`)}
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-amber-500" />
                            <span>Admins</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/10 text-amber-500 rounded-md">
                              {groupedData[dept].admins.length}
                            </span>
                          </div>
                          {expandedNodes[`${deptNodeId}:admins`] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </div>
                        
                        {expandedNodes[`${deptNodeId}:admins`] && (
                          <div className="pl-6 pt-1 space-y-2">
                            <div className="overflow-x-auto rounded-xl border border-border/40">
                              <table className="min-w-full divide-y divide-border/30 text-left text-xs">
                                <thead className="bg-muted/50 text-muted-foreground font-medium uppercase tracking-wider">
                                  <tr>
                                    <th className="px-4 py-2">College ID</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Email</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20 bg-background/25">
                                  {groupedData[dept].admins.map(admin => (
                                    <tr key={admin.collegeId} className="hover:bg-muted/20">
                                      <td className="px-4 py-2 font-semibold font-mono text-indigo-400">{admin.collegeId}</td>
                                      <td className="px-4 py-2 font-medium">{admin.name}</td>
                                      <td className="px-4 py-2 text-muted-foreground">{admin.email}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Faculty Node */}
                    {groupedData[dept].faculty.length > 0 && (
                      <div className="space-y-1">
                        <div 
                          className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-muted/40 cursor-pointer text-sm font-semibold select-none"
                          onClick={() => toggleNode(`${deptNodeId}:faculty`)}
                        >
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-500" />
                            <span>Faculty</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/10 text-blue-500 rounded-md">
                              {groupedData[dept].faculty.length}
                            </span>
                          </div>
                          {expandedNodes[`${deptNodeId}:faculty`] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </div>

                        {expandedNodes[`${deptNodeId}:faculty`] && (
                          <div className="pl-6 pt-1 space-y-2">
                            <div className="overflow-x-auto rounded-xl border border-border/40">
                              <table className="min-w-full divide-y divide-border/30 text-left text-xs">
                                <thead className="bg-muted/50 text-muted-foreground font-medium uppercase tracking-wider">
                                  <tr>
                                    <th className="px-4 py-2">College ID</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Department</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20 bg-background/25">
                                  {groupedData[dept].faculty.map(fac => (
                                    <tr key={fac.collegeId} className="hover:bg-muted/20">
                                      <td className="px-4 py-2 font-semibold font-mono text-indigo-400">{fac.collegeId}</td>
                                      <td className="px-4 py-2 font-medium">{fac.name}</td>
                                      <td className="px-4 py-2 text-muted-foreground">{fac.email}</td>
                                      <td className="px-4 py-2 text-muted-foreground/80">{fac.department || dept}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Sections & Students */}
                    {Object.keys(groupedData[dept].sections).length > 0 && (
                      <div className="space-y-1">
                        <div 
                          className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-muted/40 cursor-pointer text-sm font-semibold select-none"
                          onClick={() => toggleNode(`${deptNodeId}:sections`)}
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-500" />
                            <span>Sections</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-500 rounded-md">
                              {Object.keys(groupedData[dept].sections).length}
                            </span>
                          </div>
                          {expandedNodes[`${deptNodeId}:sections`] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </div>

                        {expandedNodes[`${deptNodeId}:sections`] && (
                          <div className="pl-6 pt-1 space-y-3">
                            {Object.keys(groupedData[dept].sections).sort().map(secName => {
                              const secNodeId = `${deptNodeId}:sec:${secName}`;
                              const isSecExpanded = !!expandedNodes[secNodeId];
                              const secStudents = groupedData[dept].sections[secName];

                              return (
                                <div key={secName} className="space-y-1 border-l-2 border-border/40 pl-3">
                                  <div 
                                    className="flex items-center justify-between py-1 px-3 rounded-lg hover:bg-muted/30 cursor-pointer text-xs font-semibold select-none"
                                    onClick={() => toggleNode(secNodeId)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <GraduationCap className="w-3.5 h-3.5 text-teal-500" />
                                      <span className="text-foreground">{secName}</span>
                                      <span className="text-[9px] bg-teal-500/10 text-teal-600 dark:text-teal-400 px-1.5 rounded-full">
                                        {secStudents.length} {secStudents.length === 1 ? 'Student' : 'Students'}
                                      </span>
                                    </div>
                                    {isSecExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                  </div>

                                  {isSecExpanded && (
                                    <div className="pl-3 pt-1">
                                      <div className="overflow-x-auto rounded-xl border border-border/40">
                                        <table className="min-w-full divide-y divide-border/30 text-left text-[11px]">
                                          <thead className="bg-muted/50 text-muted-foreground font-medium uppercase">
                                            <tr>
                                              <th className="px-4 py-1.5">Roll No</th>
                                              <th className="px-4 py-1.5">Name</th>
                                              <th className="px-4 py-1.5">Email</th>
                                              <th className="px-4 py-1.5">Year</th>
                                              <th className="px-4 py-1.5">College ID</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-border/20 bg-background/25">
                                            {secStudents.map(student => (
                                              <tr key={student.collegeId} className="hover:bg-muted/20">
                                                <td className="px-4 py-1.5 font-semibold font-mono text-indigo-400">{student.rollNumber || 'N/A'}</td>
                                                <td className="px-4 py-1.5 font-medium">{student.name}</td>
                                                <td className="px-4 py-1.5 text-muted-foreground">{student.email}</td>
                                                <td className="px-4 py-1.5 text-muted-foreground/80">{student.year || 'N/A'}</td>
                                                <td className="px-4 py-1.5 text-muted-foreground/60 font-mono">{student.collegeId}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
