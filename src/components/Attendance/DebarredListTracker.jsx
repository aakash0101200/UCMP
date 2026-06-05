import React, { useState, useEffect } from 'react';
import API from '../../Services/api';
import { toast } from 'react-toastify';
import { 
    ShieldAlert, Calendar, Users, FileText, Download, 
    Printer, Loader2, Search, AlertCircle, CheckCircle, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DebarredListTracker() {
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [activeTerm, setActiveTerm] = useState('2026-27-ODD');
    
    // Date filter state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [datePreset, setDatePreset] = useState('currentMonth'); // 'currentMonth' | 'lastMonth' | 'allTime' | 'custom'

    // Results state
    const [loadingData, setLoadingData] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch available terms
    useEffect(() => {
        API.get('/timetable/terms')
            .then(r => {
                if (r.data && r.data.length > 0) {
                    setActiveTerm(r.data[0]);
                }
            })
            .catch(err => console.error('Failed to fetch terms:', err));
    }, []);

    // Fetch assigned sections on mount
    useEffect(() => {
        API.get('/faculty/my-sections')
            .then(r => {
                setSections(r.data);
                if (r.data.length > 0) setSelectedSectionId(r.data[0].id);
            })
            .catch(err => console.error('Failed to fetch sections:', err));
    }, []);

    // When section changes, fetch assigned subjects
    useEffect(() => {
        if (!selectedSectionId) { setSubjects([]); return; }
        API.get(`/timetable/assignment/section/${selectedSectionId}?term=${activeTerm}`)
            .then(r => {
                const filtered = r.data || [];
                setSubjects(filtered);
                setSelectedSubjectId(filtered.length > 0 ? filtered[0].subjectId : '');
            })
            .catch(() => {
                // Fallback to subjects
                API.get('/subjects').then(r => {
                    setSubjects(r.data.map(s => ({ subjectId: s.id, subjectName: s.name, subjectCode: s.code })));
                    setSelectedSubjectId(r.data.length > 0 ? r.data[0].id : '');
                }).catch(() => setSubjects([]));
            });
    }, [selectedSectionId, activeTerm]);

    // Handle Preset dates on change
    useEffect(() => {
        let start = '';
        let end = '';
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();

        if (datePreset === 'currentMonth') {
            start = new Date(y, m, 1).toLocaleDateString('en-CA');
            end = new Date(y, m + 1, 0).toLocaleDateString('en-CA');
        } else if (datePreset === 'lastMonth') {
            start = new Date(y, m - 1, 1).toLocaleDateString('en-CA');
            end = new Date(y, m, 0).toLocaleDateString('en-CA');
        }

        setStartDate(start);
        setEndDate(end);
    }, [datePreset]);

    const generateList = async (e) => {
        if (e) e.preventDefault();
        if (!selectedSectionId || !selectedSubjectId) {
            toast.warning("Please select both a Section and a Subject.");
            return;
        }

        setLoadingData(true);
        setReportData(null);

        try {
            const params = {
                subjectId: selectedSubjectId,
                sectionId: selectedSectionId
            };
            if (datePreset !== 'allTime') {
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
            }

            const res = await API.get('/attendance/faculty/debarred-list', { params });
            setReportData(res.data);
            toast.success("Debarment statistics loaded successfully.");
        } catch (err) {
            console.error("Failed to generate debarred list", err);
            toast.error("Failed to generate debarred student records.");
        } finally {
            setLoadingData(false);
        }
    };

    const downloadCSV = () => {
        if (!reportData || !reportData.students) return;

        const headers = ['Roll Number', 'College ID', 'Name', 'Total Classes Conducted', 'Classes Attended', 'Attendance Percentage', 'Status'];
        const rows = reportData.students.map(s => [
            s.rollNumber || 'N/A',
            s.collegeId,
            s.name,
            s.classesConducted,
            s.classesAttended,
            `${s.attendancePercentage.toFixed(2)}%`,
            s.isDebarred ? 'DEBARRED' : 'ALLOWED'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Debarred_List_${reportData.subjectCode}_Section_${reportData.sectionName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        if (!reportData) return;

        // Open print view in new window or directly in window print with CSS
        const printWindow = window.open('', '_blank');
        const debarredList = reportData.students.filter(s => s.isDebarred);
        const allowedList = reportData.students.filter(s => !s.isDebarred);

        const html = `
            <html>
            <head>
                <title>Attendance Debarment Report - ${reportData.subjectCode}</title>
                <style>
                    body {
                        font-family: 'Inter', system-ui, -apple-system, sans-serif;
                        color: #1e293b;
                        padding: 40px;
                        line-height: 1.5;
                    }
                    .header {
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .title {
                        font-size: 24px;
                        font-weight: 300;
                        margin: 0;
                        color: #0f172a;
                    }
                    .meta {
                        font-size: 13px;
                        color: #64748b;
                        margin-top: 5px;
                    }
                    .stats-row {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    .stat-card {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 15px 20px;
                        flex: 1;
                    }
                    .stat-label {
                        font-size: 11px;
                        text-transform: uppercase;
                        font-weight: 600;
                        color: #64748b;
                        letter-spacing: 0.05em;
                    }
                    .stat-value {
                        font-size: 22px;
                        font-weight: 700;
                        margin-top: 5px;
                        color: #0f172a;
                    }
                    h2 {
                        font-size: 16px;
                        font-weight: 600;
                        color: #0f172a;
                        margin-top: 30px;
                        margin-bottom: 12px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                        margin-bottom: 35px;
                    }
                    th {
                        background: #f1f5f9;
                        text-align: left;
                        padding: 10px 12px;
                        font-weight: 600;
                        border-bottom: 1px solid #cbd5e1;
                        color: #334155;
                    }
                    td {
                        padding: 10px 12px;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .debarred {
                        color: #b91c1c;
                        font-weight: 600;
                    }
                    .allowed {
                        color: #15803d;
                    }
                    .text-right {
                        text-align: right;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">Attendance Debarment Report</h1>
                    <div class="meta">
                        Subject: <strong>${reportData.subjectCode} - ${reportData.subjectName}</strong> &nbsp;|&nbsp; 
                        Section: <strong>${reportData.sectionName}</strong> &nbsp;|&nbsp; 
                        Academic Term: <strong>${activeTerm}</strong>
                        ${startDate || endDate ? `<br/>Date Period: <strong>${startDate || 'Start'}</strong> to <strong>${endDate || 'Now'}</strong>` : ''}
                    </div>
                </div>

                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-label">Conducted Lectures</div>
                        <div class="stat-value">${reportData.totalSessionsConducted}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Section Roster</div>
                        <div class="stat-value">${reportData.students?.length || 0}</div>
                    </div>
                    <div class="stat-card" style="border-color: #fca5a5; background: #fff5f5;">
                        <div class="stat-label" style="color: #b91c1c;">Debarred (Under 75%)</div>
                        <div class="stat-value" style="color: #b91c1c;">${debarredList.length}</div>
                    </div>
                </div>

                <h2>Debarred Students (${debarredList.length})</h2>
                ${debarredList.length === 0 ? '<p style="font-size:12px; font-style:italic;">No students are currently debarred in this date range.</p>' : `
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 15%">Roll Number</th>
                                <th style="width: 15%">College ID</th>
                                <th>Student Name</th>
                                <th class="text-right" style="width: 12%">Conducted</th>
                                <th class="text-right" style="width: 12%">Attended</th>
                                <th class="text-right" style="width: 15%">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${debarredList.map(s => `
                                <tr>
                                    <td>${s.rollNumber || 'N/A'}</td>
                                    <td>${s.collegeId}</td>
                                    <td class="debarred">${s.name}</td>
                                    <td class="text-right">${s.classesConducted}</td>
                                    <td class="text-right">${s.classesAttended}</td>
                                    <td class="text-right debarred">${s.attendancePercentage.toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `}

                <h2>Allowed Students (${allowedList.length})</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 15%">Roll Number</th>
                            <th style="width: 15%">College ID</th>
                            <th>Student Name</th>
                            <th class="text-right" style="width: 12%">Conducted</th>
                            <th class="text-right" style="width: 12%">Attended</th>
                            <th class="text-right" style="width: 15%">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allowedList.map(s => `
                            <tr>
                                <td>${s.rollNumber || 'N/A'}</td>
                                <td>${s.collegeId}</td>
                                <td>${s.name}</td>
                                <td class="text-right">${s.classesConducted}</td>
                                <td class="text-right">${s.classesAttended}</td>
                                <td class="text-right allowed">${s.attendancePercentage.toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    // Filter local display results
    const filteredStudents = reportData?.students?.filter(s => 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.collegeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    const debarredCount = reportData?.students?.filter(s => s.isDebarred).length || 0;
    const allowedCount = reportData?.students?.filter(s => !s.isDebarred).length || 0;

    return (
        <div className="bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl p-6 shadow-sm text-left text-slate-800 dark:text-slate-100">
            
            {/* Header info */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-6">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
                <div>
                    <h3 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">Debarment Tracker</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Generate subject-wise debarred student lists for midterm review</p>
                </div>
            </div>

            {/* Config Form Panel */}
            <form onSubmit={generateList} className="bg-slate-50/50 dark:bg-[#0D1512]/30 border border-slate-200/60 dark:border-emerald-950/40 p-5 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Section Selector */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Section</label>
                        <select
                            value={selectedSectionId}
                            onChange={e => setSelectedSectionId(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0D1512]/50 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                        >
                            <option value="" disabled>Select Section</option>
                            {sections.map(s => (
                                <option key={s.id} value={s.id}>{s.sectionName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Subject Selector */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                        <select
                            value={selectedSubjectId}
                            onChange={e => setSelectedSubjectId(e.target.value)}
                            disabled={subjects.length === 0}
                            required
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0D1512]/50 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                        >
                            <option value="" disabled>
                                {subjects.length === 0 ? "No assigned subjects" : "Select Subject"}
                            </option>
                            {subjects.map(s => (
                                <option key={s.subjectId} value={s.subjectId}>
                                    {s.subjectCode ? `${s.subjectCode} — ${s.subjectName}` : s.subjectName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Presets Selector */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Time Scope Preset</label>
                        <select
                            value={datePreset}
                            onChange={e => setDatePreset(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0D1512]/50 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                        >
                            <option value="currentMonth">Current Month Only</option>
                            <option value="lastMonth">Last Month Only</option>
                            <option value="allTime">All Term History (Cumulative)</option>
                            <option value="custom">Custom Date Range</option>
                        </select>
                    </div>
                </div>

                {/* Custom Date Picker inputs */}
                {datePreset === 'custom' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/40"
                    >
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                required
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0D1512]/50 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                required
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0D1512]/50 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </motion.div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loadingData}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
                    >
                        {loadingData ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing Class Sessions...
                            </>
                        ) : (
                            <>
                                <Calendar className="w-4 h-4" />
                                Generate Debarment Report
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Results Roster Section */}
            <div className="mt-8">
                {loadingData && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-500 mb-3" />
                        <span className="text-xs font-semibold animate-pulse">Running cumulative records scan...</span>
                    </div>
                )}

                {!loadingData && !reportData && (
                    <div className="text-center py-20 border border-dashed border-slate-200 dark:border-emerald-950/40 rounded-3xl text-slate-400 dark:text-slate-500">
                        <Users className="w-12 h-12 text-slate-300 dark:text-[#0D1512]/80 mx-auto mb-3" />
                        <p className="font-semibold text-sm text-slate-500 dark:text-slate-400">No report generated yet</p>
                        <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Select a subject, section, and date range above to scan student attendance percentages.</p>
                    </div>
                )}

                {!loadingData && reportData && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Summary Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50/80 dark:bg-[#0D1512]/30 border border-slate-200 dark:border-emerald-950/60 rounded-2xl shadow-sm">
                            <div className="space-y-1">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    {reportData.subjectCode} — {reportData.subjectName}
                                </h4>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Section {reportData.sectionName} · {activeTerm} · <strong>{reportData.totalSessionsConducted} Lectures Held</strong>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={downloadCSV}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1512] dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                                >
                                    <Download className="w-3.5 h-3.5" /> CSV
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1512] dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                                >
                                    <Printer className="w-3.5 h-3.5" /> Print Report
                                </button>
                            </div>
                        </div>

                        {/* Quick metrics cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50/40 dark:bg-[#0d1512]/20 border border-slate-200/60 dark:border-emerald-950/30 rounded-xl">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Active Roster Size</div>
                                <div className="text-xl font-bold text-slate-800 dark:text-white mt-1">{reportData.students?.length || 0} Students</div>
                            </div>
                            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">Allowed (75%+)</div>
                                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{allowedCount} Students</div>
                            </div>
                            <div className="p-4 bg-rose-500/5 dark:bg-rose-500/5 border border-rose-500/10 rounded-xl col-span-2 sm:col-span-1">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400">Debarred (Under 75%)</div>
                                <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{debarredCount} Students</div>
                            </div>
                        </div>

                        {/* Search filter for list */}
                        <div className="relative max-w-md">
                            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by name, college ID or roll number..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#0D1512]/40 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Table roster */}
                        <div className="border border-slate-200 dark:border-emerald-950/60 rounded-2xl overflow-hidden bg-white dark:bg-[#14221C]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-[#0d1512]/40 border-b border-slate-200 dark:border-emerald-950/60">
                                            <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Roll No</th>
                                            <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">College ID</th>
                                            <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                                            <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-right">Lectures Held</th>
                                            <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-right">Attended</th>
                                            <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-right">Percentage</th>
                                            <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="p-8 text-center text-slate-400 italic">No matching student records found.</td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map(student => (
                                                <tr 
                                                    key={student.studentId}
                                                    className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-[#0d1512]/10 transition-colors"
                                                >
                                                    <td className="p-3.5 font-medium text-slate-500 dark:text-slate-400 font-mono">{student.rollNumber || 'N/A'}</td>
                                                    <td className="p-3.5 font-medium text-slate-500 dark:text-slate-400 font-mono">{student.collegeId}</td>
                                                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{student.name}</td>
                                                    <td className="p-3.5 text-right font-mono text-slate-500 dark:text-slate-400">{student.classesConducted}</td>
                                                    <td className="p-3.5 text-right font-mono text-slate-500 dark:text-slate-455">{student.classesAttended}</td>
                                                    <td className={`p-3.5 text-right font-bold font-mono ${student.isDebarred ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                        {student.attendancePercentage.toFixed(1)}%
                                                    </td>
                                                    <td className="p-3.5 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            student.isDebarred 
                                                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                                                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                        }`}>
                                                            {student.isDebarred ? (
                                                                <>
                                                                    <ShieldAlert className="w-3 h-3" /> DEBARRED
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3" /> ALLOWED
                                                                </>
                                                            )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
