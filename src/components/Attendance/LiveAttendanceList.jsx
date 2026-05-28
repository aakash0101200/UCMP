import React, { useState, useEffect, useCallback } from 'react';
import API from '../../Services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { toast } from 'react-toastify';
import { Search, UserCheck, UserX, Check, Loader2, Download, Printer } from 'lucide-react';

export default function LiveAttendanceList({ sessionId }) {
    const [presentRecords, setPresentRecords] = useState([]);
    const [absentRecords, setAbsentRecords] = useState([]);
    const [activeTab, setActiveTab] = useState('present'); // 'present' | 'absent'
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [markingIds, setMarkingIds] = useState(new Set()); // Track IDs currently being manually marked

    const wsTopic = sessionId ? `/topic/roster/${sessionId}` : null;

    // WebSocket Roster Updates
    useWebSocket(
        wsTopic,
        useCallback((event) => {
            console.log('Received roster update event via WebSocket:', event);
            // 1. Add to present records if not already there
            setPresentRecords(prev => {
                if (prev.some(r => String(r.collegeId) === String(event.collegeId))) {
                    return prev;
                }
                return [...prev, {
                    name: event.studentName,
                    collegeId: event.collegeId,
                    rollNumber: event.rollNumber,
                    markedAt: event.markedAt,
                    markedBy: event.markSource || 'STUDENT_TOTP'
                }];
            });
            // 2. Remove from absent records
            setAbsentRecords(prev => prev.filter(r => String(r.collegeId) !== String(event.collegeId)));
        }, [])
    );

    // Initial Fetch: Present and Absent
    useEffect(() => {
        if (!sessionId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [presentRes, absentRes] = await Promise.all([
                    API.get(`/attendance/session/${sessionId}/records`),
                    API.get(`/attendance/session/${sessionId}/absent-students`)
                ]);
                setPresentRecords(presentRes.data || []);
                setAbsentRecords(absentRes.data || []);
            } catch (error) {
                console.error("Failed to fetch session data", error);
                toast.error("Failed to load attendance lists");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sessionId]);

    // Manual mark handler
    const handleManualMark = async (collegeId) => {
        if (markingIds.has(collegeId)) return;

        // Add to marking state to show spinner
        setMarkingIds(prev => {
            const next = new Set(prev);
            next.add(collegeId);
            return next;
        });

        try {
            await API.post(`/attendance/session/${sessionId}/manual-mark`, {
                studentCollegeIds: [collegeId],
                reason: "Faculty verified in-class"
            });

            toast.success(`Successfully marked ${collegeId} present`);
            // Note: RosterUpdateEvent will broadcast via WebSocket, which automatically 
            // moves the student to the present list and removes them from the absent list.
        } catch (error) {
            console.error("Failed to mark student manually", error);
            const errMsg = error.response?.data?.error || "Error marking attendance";
            toast.error(errMsg);
        } finally {
            setMarkingIds(prev => {
                const next = new Set(prev);
                next.delete(collegeId);
                return next;
            });
        }
    };

    const exportToCSV = () => {
        const getSortKey = (item) => item.rollNumber || item.collegeId || item.name || '';
        const combined = [
            ...presentRecords.map(r => ({ ...r, status: 'Present' })),
            ...absentRecords.map(r => ({ ...r, status: 'Absent' }))
        ].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)));

        const headers = ['Roll Number', 'Name', 'College ID', 'Status'];
        const csvRows = [
            headers.join(','),
            ...combined.map(item => [
                item.rollNumber || 'N/A',
                item.name || 'N/A',
                item.collegeId || 'N/A',
                item.status
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
        ];

        const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_roster_${sessionId || 'session'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const exportToPDF = () => {
        const getSortKey = (item) => item.rollNumber || item.collegeId || item.name || '';
        const combined = [
            ...presentRecords.map(r => ({ ...r, status: 'Present' })),
            ...absentRecords.map(r => ({ ...r, status: 'Absent' }))
        ].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)));

        const presentCount = presentRecords.length;
        const totalCount = combined.length;
        const absentCount = absentRecords.length;
        const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0.0';

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Popup blocker prevented exporting PDF. Please allow popups.");
            return;
        }

        const todayStr = new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const rowsHTML = combined.map((item, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-weight: 500; color: #334155;">${escapeHTML(item.rollNumber) || 'N/A'}</td>
                <td style="padding: 12px; color: #0f172a; font-weight: 600;">${escapeHTML(item.name) || 'N/A'}</td>
                <td style="padding: 12px; color: #64748b;">${escapeHTML(item.collegeId) || 'N/A'}</td>
                <td style="padding: 12px; font-weight: bold; text-align: center;">
                    <span style="
                        display: inline-block;
                        padding: 4px 8px;
                        font-size: 11px;
                        border-radius: 6px;
                        ${item.status === 'Present'
                ? 'background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;'
                : 'background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;'}
                    ">${escapeHTML(item.status)}</span>
                </td>
            </tr>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Attendance Report - Session ${sessionId || ''}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
                    body {
                        font-family: 'Outfit', sans-serif;
                        color: #1e293b;
                        background: #ffffff;
                        margin: 0;
                        padding: 40px;
                    }
                    .header-container {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        border-bottom: 3px solid #10b981;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .title-section h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #0f172a;
                    }
                    .title-section p {
                        margin: 5px 0 0 0;
                        color: #64748b;
                        font-size: 14px;
                    }
                    .meta-info {
                        text-align: right;
                        color: #475569;
                        font-size: 13px;
                    }
                    .meta-info div {
                        margin-bottom: 4px;
                    }
                    .stats-container {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    .stat-card {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 16px;
                        text-align: center;
                    }
                    .stat-value {
                        font-size: 24px;
                        font-weight: 700;
                        color: #0f172a;
                        margin-top: 4px;
                    }
                    .stat-value.present { color: #16a34a; }
                    .stat-value.absent { color: #dc2626; }
                    .stat-value.rate { color: #0284c7; }
                    .stat-label {
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        color: #64748b;
                        font-weight: 600;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    th {
                        background-color: #0f172a;
                        color: #ffffff;
                        font-weight: 600;
                        text-align: left;
                        padding: 12px;
                        font-size: 13px;
                        letter-spacing: 0.05em;
                        text-transform: uppercase;
                    }
                    th:first-child { border-top-left-radius: 8px; }
                    th:last-child { border-top-right-radius: 8px; }
                    td {
                        font-size: 14px;
                    }
                    @media print {
                        body { padding: 20px; }
                        button { display: none; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="header-container">
                    <div class="title-section">
                        <h1>Attendance Session Report</h1>
                        <p>Universal Classroom Management Platform (UCMP)</p>
                    </div>
                    <div class="meta-info">
                        <div><strong>Session ID:</strong> #\${sessionId || 'N/A'}</div>
                        <div><strong>Generated on:</strong> \${todayStr}</div>
                    </div>
                </div>

                <div class="stats-container">
                    <div class="stat-card">
                        <div class="stat-label">Total Strength</div>
                        <div class="stat-value">\${totalCount}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Present</div>
                        <div class="stat-value present">\${presentCount}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Absent</div>
                        <div class="stat-value absent">\${absentCount}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Attendance Rate</div>
                        <div class="stat-value rate">\${attendanceRate}%</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 25%;">Roll Number</th>
                            <th style="width: 40%;">Student Name</th>
                            <th style="width: 20%;">College ID</th>
                            <th style="width: 15%; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${rowsHTML}
                    </tbody>
                </table>

                <div style="margin-top: 40px; text-align: center;" class="no-print">
                    <button onclick="window.print();" style="
                        padding: 10px 20px;
                        background-color: #10b981;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
                        transition: all 0.2s;
                    " onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'">
                        Print / Save PDF
                    </button>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    // Filtered lists based on search query
    const filteredPresent = presentRecords.filter(r =>
    (r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.collegeId?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredAbsent = absentRecords.filter(r =>
    (r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.collegeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.rollNumber && r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-500 mb-2" />
                <p className="text-sm font-medium">Loading session roster...</p>
            </div>
        );
    }

    return (
        <div className="w-full mt-6 bg-slate-50/50 dark:bg-[#0D1512]/40 border border-slate-200 dark:border-emerald-950/60 rounded-2xl p-5 shadow-sm text-left">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Roster Management</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Track and manually update attendance status</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Export Buttons */}
                    <button
                        onClick={exportToCSV}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:bg-emerald-955/30 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:hover:text-white border border-emerald-250 dark:border-emerald-950/60 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-700 hover:text-white dark:bg-slate-800/60 dark:hover:bg-slate-600 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Export PDF
                    </button>

                    {/* Search Bar */}
                    <div className="relative max-w-xs w-full min-w-[200px]">
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#14221C]/60 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-550"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-emerald-950/60 mb-4">
                <button
                    onClick={() => setActiveTab('present')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'present'
                        ? 'border-emerald-600 text-emerald-650 dark:text-emerald-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <UserCheck className="w-4 h-4" />
                    Present ({presentRecords.length})
                </button>
                <button
                    onClick={() => setActiveTab('absent')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'absent'
                        ? 'border-amber-600 text-amber-650 dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <UserX className="w-4 h-4" />
                    Absent ({absentRecords.length})
                </button>
            </div>

            {/* List Body */}
            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2">
                {activeTab === 'present' ? (
                    filteredPresent.length === 0 ? (
                        <div className="text-center py-10 text-slate-405 dark:text-slate-500 text-sm">
                            {searchQuery ? "No matching students found." : "No students have marked present yet."}
                        </div>
                    ) : (
                        filteredPresent.map((record, index) => (
                            <div
                                key={record.collegeId || index}
                                className="flex items-center justify-between p-3 bg-white dark:bg-[#14221C]/80 border border-slate-150 dark:border-emerald-950/40 rounded-xl hover:border-slate-300 dark:hover:border-emerald-950/70 transition duration-200"
                            >
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                                        {record.name}
                                        {record.rollNumber && <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 font-normal">Roll: {record.rollNumber}</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{record.collegeId}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {record.markedBy === 'FACULTY_MANUAL' && (
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Manual
                                        </span>
                                    )}
                                    <div className="text-right">
                                        <div className="text-xs text-emerald-650 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                            <Check className="w-3.5 h-3.5" /> Present
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                            {record.markedAt ? new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    filteredAbsent.length === 0 ? (
                        <div className="text-center py-10 text-slate-405 dark:text-slate-500 text-sm">
                            {searchQuery ? "No matching students found." : "All students are marked present!"}
                        </div>
                    ) : (
                        filteredAbsent.map((student) => (
                            <div
                                key={student.collegeId}
                                className="flex items-center justify-between p-3 bg-white dark:bg-[#14221C]/80 border border-slate-150 dark:border-emerald-950/40 rounded-xl hover:border-slate-300 dark:hover:border-emerald-950/70 transition duration-200"
                            >
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-slate-205 text-sm">
                                        {student.name}
                                        {student.rollNumber && <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 font-normal">Roll: {student.rollNumber}</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {student.collegeId} {student.sectionName && `· ${student.sectionName}`}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleManualMark(student.collegeId)}
                                    disabled={markingIds.has(student.collegeId)}
                                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:bg-emerald-955/30 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:hover:text-white border border-emerald-200 dark:border-emerald-950/60 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {markingIds.has(student.collegeId) ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <UserCheck className="w-3.5 h-3.5" />
                                    )}
                                    Mark Present
                                </button>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
}