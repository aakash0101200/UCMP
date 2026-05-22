import React, { useState, useEffect, useCallback } from 'react';
import API from '../../Services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { toast } from 'react-toastify';
import { Search, UserCheck, UserX, Check, Loader2 } from 'lucide-react';

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
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                <p className="text-sm font-medium">Loading session roster...</p>
            </div>
        );
    }

    return (
        <div className="w-full mt-6 bg-neutral-950/40 border border-neutral-800 rounded-2xl p-5 shadow-inner text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h4 className="text-lg font-bold text-white">Roster Management</h4>
                    <p className="text-xs text-neutral-500">Track and manually update attendance status</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Search student..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-800 mb-4">
                <button
                    onClick={() => setActiveTab('present')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === 'present'
                            ? 'border-emerald-500 text-emerald-400'
                            : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    }`}
                >
                    <UserCheck className="w-4 h-4" />
                    Present ({presentRecords.length})
                </button>
                <button
                    onClick={() => setActiveTab('absent')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === 'absent'
                            ? 'border-amber-500 text-amber-400'
                            : 'border-transparent text-neutral-400 hover:text-neutral-200'
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
                        <div className="text-center py-10 text-neutral-500 text-sm">
                            {searchQuery ? "No matching students found." : "No students have marked present yet."}
                        </div>
                    ) : (
                        filteredPresent.map((record, index) => (
                            <div 
                                key={record.collegeId || index} 
                                className="flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800/40 rounded-xl hover:border-neutral-700/50 transition duration-200"
                            >
                                <div>
                                    <div className="font-semibold text-white text-sm">{record.name}</div>
                                    <div className="text-xs text-neutral-500">{record.collegeId}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {record.markedBy === 'FACULTY_MANUAL' && (
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-400 border border-indigo-500/20">
                                            Manual
                                        </span>
                                    )}
                                    <div className="text-right">
                                        <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                            <Check className="w-3.5 h-3.5" /> Present
                                        </div>
                                        <div className="text-[10px] text-neutral-500 mt-0.5">
                                            {record.markedAt ? new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    filteredAbsent.length === 0 ? (
                        <div className="text-center py-10 text-neutral-500 text-sm">
                            {searchQuery ? "No matching students found." : "All students are marked present!"}
                        </div>
                    ) : (
                        filteredAbsent.map((student) => (
                            <div 
                                key={student.collegeId} 
                                className="flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800/40 rounded-xl hover:border-neutral-700/50 transition duration-200"
                            >
                                <div>
                                    <div className="font-semibold text-neutral-200 text-sm">
                                        {student.name}
                                        {student.rollNumber && <span className="text-xs text-neutral-500 ml-2 font-normal">Roll: {student.rollNumber}</span>}
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                        {student.collegeId} {student.sectionName && `· ${student.sectionName}`}
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => handleManualMark(student.collegeId)}
                                    disabled={markingIds.has(student.collegeId)}
                                    className="px-3.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-900/50 hover:border-indigo-500 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
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