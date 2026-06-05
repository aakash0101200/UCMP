import React, { useState, useEffect } from 'react';
import API from '../../Services/api';
import { toast } from 'react-toastify';
import {
    History, Calendar, Users, CheckCircle, Clock, AlertCircle,
    ChevronRight, ArrowLeft, Search, UserCheck, Loader2, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FacultySessionHistory() {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [absentStudents, setAbsentStudents] = useState([]);
    const [presentStudents, setPresentStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [markingIds, setMarkingIds] = useState(new Set());
    const [forceOverride, setForceOverride] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [datePreset, setDatePreset] = useState('last20'); // 'last20' | 'currentMonth' | 'lastMonth' | 'custom'

    // Fetch recent sessions
    const fetchHistory = async (start = startDate, end = endDate, preset = datePreset) => {
        setLoadingHistory(true);
        try {
            const params = {};
            if (preset !== 'last20') {
                if (start) params.startDate = start;
                if (end) params.endDate = end;
            }
            const res = await API.get('/attendance/faculty/session-history', { params });
            setSessions(res.data || []);
        } catch (error) {
            console.error("Failed to fetch session history", error);
            toast.error("Failed to load session history");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handlePresetChange = (preset) => {
        setDatePreset(preset);
        let start = '';
        let end = '';

        if (preset === 'currentMonth') {
            const now = new Date();
            const y = now.getFullYear();
            const m = now.getMonth();
            start = new Date(y, m, 1).toLocaleDateString('en-CA'); // YYYY-MM-DD
            end = new Date(y, m + 1, 0).toLocaleDateString('en-CA');
        } else if (preset === 'lastMonth') {
            const now = new Date();
            const y = now.getFullYear();
            const m = now.getMonth();
            start = new Date(y, m - 1, 1).toLocaleDateString('en-CA');
            end = new Date(y, m, 0).toLocaleDateString('en-CA');
        }

        setStartDate(start);
        setEndDate(end);
        fetchHistory(start, end, preset);
    };

    const handleCustomDateSubmit = (e) => {
        e.preventDefault();
        fetchHistory(startDate, endDate, 'custom');
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // Load details (present & absent students) for the selected session
    const loadSessionDetails = async (session) => {
        setLoadingDetails(true);
        setSelectedSession(session);
        try {
            const [presentRes, absentRes] = await Promise.all([
                API.get(`/attendance/session/${session.sessionId}/records`),
                API.get(`/attendance/session/${session.sessionId}/absent-students`)
            ]);
            setPresentStudents(presentRes.data || []);
            setAbsentStudents(absentRes.data || []);
        } catch (error) {
            console.error("Failed to load session details", error);
            toast.error("Failed to load session rosters");
        } finally {
            setLoadingDetails(false);
        }
    };

    // Handle manual mark from history view
    const handleManualMark = async (collegeId) => {
        if (!selectedSession) return;
        if (markingIds.has(collegeId)) return;

        setMarkingIds(prev => {
            const next = new Set(prev);
            next.add(collegeId);
            return next;
        });

        try {
            await API.post(`/attendance/session/${selectedSession.sessionId}/manual-mark`, {
                studentCollegeIds: [collegeId],
                reason: "Faculty manual override"
            }, {
                params: { forceOverride }
            });

            toast.success(`Successfully marked ${collegeId} present`);

            // Move student from absent to present in local state immediately
            const student = absentStudents.find(s => s.collegeId === collegeId);
            if (student) {
                setAbsentStudents(prev => prev.filter(s => s.collegeId !== collegeId));
                setPresentStudents(prev => [...prev, {
                    name: student.name,
                    collegeId: student.collegeId,
                    markedAt: new Date().toISOString(),
                    markedBy: 'FACULTY_MANUAL'
                }]);
            }
        } catch (error) {
            console.error("Failed to mark attendance", error);
            const errMsg = error.response?.data?.error || error.response?.data?.message || "Failed to mark attendance";
            toast.error(errMsg);
        } finally {
            setMarkingIds(prev => {
                const next = new Set(prev);
                next.delete(collegeId);
                return next;
            });
        }
    };

    const handleBack = () => {
        setSelectedSession(null);
        setAbsentStudents([]);
        setPresentStudents([]);
        setSearchQuery('');
        setForceOverride(false);
        fetchHistory(); // Refresh counts
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'ENDED':
                return 'bg-neutral-500/10 text-neutral-400 border-neutral-800';
            case 'CANCELLED':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-neutral-500/10 text-neutral-400 border-neutral-800';
        }
    };

    // Filter absent students
    const filteredAbsent = absentStudents.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.collegeId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter present students
    const filteredPresent = presentStudents.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.collegeId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl p-6 shadow-sm text-left text-slate-800 dark:text-slate-100">
            <AnimatePresence mode="wait">
                {!selectedSession ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                            <History className="w-6 h-6 text-emerald-600 dark:text-emerald-555" />
                            <div>
                                <h3 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">Attendance Session History</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">View recent sessions and edit records</p>
                            </div>
                        </div>

                        {/* Monthly / Date-Range Filter */}
                        <div className="bg-slate-50/50 dark:bg-[#0D1512]/30 border border-slate-200/65 dark:border-emerald-950/40 p-4 rounded-2xl space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Filter Sessions
                                </span>

                                <div className="flex bg-slate-200/40 dark:bg-[#0D1512]/50 p-1 rounded-xl border border-slate-200/50 dark:border-emerald-950/60 w-fit gap-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => handlePresetChange('last20')}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${datePreset === 'last20'
                                                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm font-semibold'
                                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        Recent (Last 20)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePresetChange('currentMonth')}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${datePreset === 'currentMonth'
                                                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm font-semibold'
                                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        Current Month
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePresetChange('lastMonth')}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${datePreset === 'lastMonth'
                                                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm font-semibold'
                                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        Last Month
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDatePreset('custom')}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${datePreset === 'custom'
                                                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm font-semibold'
                                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        Custom Range
                                    </button>
                                </div>
                            </div>

                            {datePreset === 'custom' && (
                                <form onSubmit={handleCustomDateSubmit} className="flex flex-wrap items-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            required
                                            className="px-3 py-1.5 text-xs bg-white dark:bg-[#0D1512]/50 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            required
                                            className="px-3 py-1.5 text-xs bg-white dark:bg-[#0D1512]/50 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
                                    >
                                        Apply Filter
                                    </button>
                                </form>
                            )}
                        </div>

                        {loadingHistory ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-555" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                                <Calendar className="w-12 h-12 text-slate-300 dark:text-[#0D1512]/60 mx-auto mb-3" />
                                <p className="font-semibold text-slate-500 dark:text-slate-400">No attendance sessions found</p>
                                <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Sessions started by you will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1 scroll-style">
                                {sessions.map((s) => (
                                    <div
                                        key={s.sessionId}
                                        onClick={() => loadSessionDetails(s)}
                                        className="p-4 bg-slate-50/50 dark:bg-[#0D1512]/40 border border-slate-200 dark:border-emerald-950/60 rounded-xl hover:border-emerald-500/30 transition cursor-pointer flex flex-col justify-between gap-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{s.subjectName}</h4>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{s.subjectCode} · {s.sectionName}</span>
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getStatusStyles(s.status)}`}>
                                                {s.status}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                                <span>{s.presentCount} Marked Present</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        className="space-y-6"
                    >
                        {/* Session details header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition w-fit"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to History
                            </button>

                            <div className="text-left sm:text-right">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedSession.subjectName}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedSession.subjectCode} · {selectedSession.sectionName}</p>
                            </div>
                        </div>

                        {/* Grace Period Notification / Override Checkbox */}
                        {selectedSession.status === 'ENDED' && (
                            <div className="p-4 bg-slate-50 dark:bg-[#0D1512]/60 border border-slate-200 dark:border-emerald-950/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white">Manual Marking Window</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {selectedSession.manualMarkAllowed
                                                ? "Standard grace window is active. You can mark students directly."
                                                : "Standard grace window has expired. Check 'Force Override' to modify."
                                            }
                                        </p>
                                    </div>
                                </div>

                                {!selectedSession.manualMarkAllowed && (
                                    <label className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3.5 py-2 rounded-lg cursor-pointer transition select-none">
                                        <input
                                            type="checkbox"
                                            checked={forceOverride}
                                            onChange={e => setForceOverride(e.target.checked)}
                                            className="accent-emerald-600 dark:accent-emerald-500 rounded"
                                        />
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                                            <ShieldAlert className="w-3.5 h-3.5" /> Force Override
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Search & Tabs */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative max-w-xs w-full">
                                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#0D1512]/40 border border-slate-200 dark:border-emerald-950/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="flex gap-4 w-full sm:w-auto">
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                    Present: {presentStudents.length}
                                </span>
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                                    Absent: {absentStudents.length}
                                </span>
                            </div>
                        </div>

                        {loadingDetails ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-500" />
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scroll-style">
                                {absentStudents.length === 0 && presentStudents.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                                        No students registered in this section.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Absent List (Modifiable) */}
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Absent Students</h5>
                                            {filteredAbsent.length === 0 ? (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 italic">No absent students found.</p>
                                            ) : (
                                                filteredAbsent.map(s => (
                                                    <div
                                                        key={s.collegeId}
                                                        className="p-3 bg-slate-50 dark:bg-[#0D1512]/40 border border-slate-200 dark:border-emerald-950/40 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-emerald-950/70 transition"
                                                    >
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</div>
                                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{s.collegeId} {s.rollNumber && `· Roll ${s.rollNumber}`}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleManualMark(s.collegeId)}
                                                            disabled={(!selectedSession.manualMarkAllowed && !forceOverride) || markingIds.has(s.collegeId)}
                                                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:bg-emerald-950/30 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:hover:text-white border border-emerald-200 dark:border-emerald-950/60 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1 disabled:opacity-30 disabled:hover:bg-emerald-50/10 disabled:hover:text-emerald-600"
                                                        >
                                                            {markingIds.has(s.collegeId) ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <UserCheck className="w-3 h-3" />
                                                            )}
                                                            Override
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Present List (Read-only status) */}
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider mb-3">Present Students</h5>
                                            {filteredPresent.length === 0 ? (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 italic">No present students found.</p>
                                            ) : (
                                                filteredPresent.map(s => (
                                                    <div
                                                        key={s.collegeId}
                                                        className="p-3 bg-slate-50 dark:bg-[#0D1512]/40 border border-slate-200 dark:border-emerald-950/40 rounded-xl flex items-center justify-between gap-3"
                                                    >
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-900 dark:text-slate-200">{s.name}</div>
                                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{s.collegeId}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {s.markedBy === 'FACULTY_MANUAL' && (
                                                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                                    Manual
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> OK
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
