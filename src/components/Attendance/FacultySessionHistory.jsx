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

    // Fetch recent sessions
    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await API.get('/attendance/faculty/session-history');
            setSessions(res.data || []);
        } catch (error) {
            console.error("Failed to fetch session history", error);
            toast.error("Failed to load session history");
        } finally {
            setLoadingHistory(false);
        }
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
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl text-left">
            <AnimatePresence mode="wait">
                {!selectedSession ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                            <History className="w-6 h-6 text-indigo-500" />
                            <div>
                                <h3 className="text-xl font-bold text-white">Attendance Session History</h3>
                                <p className="text-xs text-neutral-400">View recent sessions and edit records</p>
                            </div>
                        </div>

                        {loadingHistory ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-16 text-neutral-500">
                                <Calendar className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                                <p className="font-semibold text-neutral-400">No attendance sessions found</p>
                                <p className="text-xs text-neutral-600 mt-1">Sessions started by you will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
                                {sessions.map((s) => (
                                    <div 
                                        key={s.sessionId}
                                        onClick={() => loadSessionDetails(s)}
                                        className="p-4 bg-neutral-950/40 border border-neutral-800/80 rounded-xl hover:border-neutral-700 transition cursor-pointer flex flex-col justify-between gap-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-white text-sm">{s.subjectName}</h4>
                                                <span className="text-xs text-neutral-500 font-mono">{s.subjectCode} · {s.sectionName}</span>
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getStatusStyles(s.status)}`}>
                                                {s.status}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-neutral-400 pt-2 border-t border-neutral-900">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-neutral-500" />
                                                <span>{s.presentCount} Marked Present</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ChevronRight className="w-4 h-4 text-neutral-600" />
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-4">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition w-fit"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to History
                            </button>
                            
                            <div className="text-left sm:text-right">
                                <h3 className="text-lg font-bold text-white">{selectedSession.subjectName}</h3>
                                <p className="text-xs text-neutral-500">{selectedSession.subjectCode} · {selectedSession.sectionName}</p>
                            </div>
                        </div>

                        {/* Grace Period Notification / Override Checkbox */}
                        {selectedSession.status === 'ENDED' && (
                            <div className="p-4 bg-neutral-950 border border-neutral-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="text-sm font-semibold text-neutral-200">Manual Marking Window</h5>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {selectedSession.manualMarkAllowed 
                                                ? "Standard grace window is active. You can mark students directly."
                                                : "Standard grace window has expired. Check 'Force Override' to modify."
                                            }
                                        </p>
                                    </div>
                                </div>

                                {!selectedSession.manualMarkAllowed && (
                                    <label className="flex items-center gap-2 bg-indigo-950/20 hover:bg-indigo-950/30 border border-indigo-500/20 px-3.5 py-2 rounded-lg cursor-pointer transition select-none">
                                        <input
                                            type="checkbox"
                                            checked={forceOverride}
                                            onChange={e => setForceOverride(e.target.checked)}
                                            className="accent-indigo-500 rounded"
                                        />
                                        <span className="text-xs text-indigo-400 font-bold flex items-center gap-1.5">
                                            <ShieldAlert className="w-3.5 h-3.5" /> Force Override
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Search & Tabs */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative max-w-xs w-full">
                                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex gap-4 border-b border-neutral-900 w-full sm:w-auto">
                                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                    Present: {presentStudents.length}
                                </span>
                                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                                    Absent: {absentStudents.length}
                                </span>
                            </div>
                        </div>

                        {loadingDetails ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                {absentStudents.length === 0 && presentStudents.length === 0 ? (
                                    <div className="text-center py-10 text-neutral-500">
                                        No students registered in this section.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* Absent List (Modifiable) */}
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Absent Students</h5>
                                            {filteredAbsent.length === 0 ? (
                                                <p className="text-xs text-neutral-600 italic">No absent students found.</p>
                                            ) : (
                                                filteredAbsent.map(s => (
                                                    <div 
                                                        key={s.collegeId}
                                                        className="p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl flex items-center justify-between gap-3 hover:border-neutral-700/60 transition"
                                                    >
                                                        <div>
                                                            <div className="text-xs font-semibold text-white">{s.name}</div>
                                                            <div className="text-[10px] text-neutral-500">{s.collegeId} {s.rollNumber && `· Roll ${s.rollNumber}`}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleManualMark(s.collegeId)}
                                                            disabled={(!selectedSession.manualMarkAllowed && !forceOverride) || markingIds.has(s.collegeId)}
                                                            className="px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-900/50 hover:border-indigo-500 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1 disabled:opacity-30 disabled:hover:bg-indigo-600/10 disabled:hover:text-indigo-400"
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
                                            <h5 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Present Students</h5>
                                            {filteredPresent.length === 0 ? (
                                                <p className="text-xs text-neutral-600 italic">No present students found.</p>
                                            ) : (
                                                filteredPresent.map(s => (
                                                    <div 
                                                        key={s.collegeId}
                                                        className="p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl flex items-center justify-between gap-3"
                                                    >
                                                        <div>
                                                            <div className="text-xs font-semibold text-neutral-300">{s.name}</div>
                                                            <div className="text-[10px] text-neutral-500">{s.collegeId}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {s.markedBy === 'FACULTY_MANUAL' && (
                                                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-950/50 text-indigo-400 border border-indigo-500/20">
                                                                    Manual
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
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
