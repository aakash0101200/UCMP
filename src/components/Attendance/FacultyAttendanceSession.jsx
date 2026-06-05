import React, { useState, useEffect } from 'react';
import API from '../../Services/api';
import LiveAttendanceList from './LiveAttendanceList';

export default function FacultyAttendanceSession() {
    const [sessionActive, setSessionActive] = useState(false);
    const [currentCode, setCurrentCode] = useState('');
    const [countdown, setCountdown] = useState(30);
    const [sessionId, setSessionId] = useState(null);

    // Section + subject selection
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [activeTerm, setActiveTerm] = useState('2026-27-ODD');
    const [durationInMinutes, setDurationInMinutes] = useState(40);

    // Restore active session state on mount
    useEffect(() => {
        API.get('/attendance/active-session')
            .then(r => {
                if (r.data) {
                    setSessionId(r.data.id);
                    setSelectedSectionId(r.data.sectionId);
                    setSelectedSubjectId(r.data.subjectId || '');
                    setSessionActive(true);
                    fetchCode(r.data.id);
                }
            })
            .catch(() => {
                // Ignore failure if no active session is running
            });
    }, []);

    // Fetch available terms and select the latest one
    useEffect(() => {
        API.get('/timetable/terms')
            .then(r => {
                if (r.data && r.data.length > 0) {
                    setActiveTerm(r.data[0]);
                }
            })
            .catch(err => console.error('Failed to fetch terms:', err));
    }, []);

    // Fetch faculty's assigned sections on mount
    useEffect(() => {
        API.get('/faculty/my-sections')
            .then(r => {
                setSections(r.data);
                if (r.data.length > 0) setSelectedSectionId(r.data[0].id);
            })
            .catch(err => console.error('Failed to fetch sections:', err));
    }, []);

    // When section changes, fetch subjects assigned to faculty for that section
    useEffect(() => {
        if (!selectedSectionId) { setSubjects([]); return; }
        API.get(`/timetable/assignment/section/${selectedSectionId}?term=${activeTerm}`)
            .then(r => {
                // Since this returns assignments specifically for the selected section, we just use the data
                const filtered = r.data || [];
                setSubjects(filtered);
                setSelectedSubjectId(filtered.length > 0 ? filtered[0].subjectId : '');
            })
            .catch(() => {
                // Fallback: fetch all subjects if assignment endpoint unavailable
                API.get('/subjects').then(r => {
                    setSubjects(r.data.map(s => ({ subjectId: s.id, subjectName: s.name, subjectCode: s.code })));
                    setSelectedSubjectId(r.data.length > 0 ? r.data[0].id : '');
                }).catch(() => setSubjects([]));
            });
    }, [selectedSectionId, activeTerm]);

    // Start session
    const startSession = async () => {
        if (!selectedSectionId) { alert('Please select a section first.'); return; }

        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude: lat, longitude: lon } }) => {
                try {
                    const res = await API.post('/attendance/start', {
                        sectionId: selectedSectionId,
                        subjectId: selectedSubjectId || null,   // ← subject tag
                        latitude: lat,
                        longitude: lon,
                        radiusInMeters: 50.0,
                        durationInMinutes: durationInMinutes,
                    });
                    setSessionId(res.data.id);
                    setSessionActive(true);
                    fetchCode(res.data.id);
                } catch (err) {
                    console.error('Start Session Error:', err);
                    alert('Error starting session. Check backend or faculty permissions.');
                }
            },
            () => alert('Please allow location access to start the attendance session.')
        );
    };

    const fetchCode = async (sId) => {
        try {
            const res = await API.get(`/attendance/session/${sId}/code`);
            if (res.status === 200) setCurrentCode(res.data.toString());
        } catch (err) {
            console.error('Network error fetching code:', err);
        }
        setCountdown(30);
    };

    useEffect(() => {
        let interval;
        if (sessionActive && sessionId) {
            interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { fetchCode(sessionId); return 30; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionActive, sessionId]);

    const stopSession = async () => {
        if (sessionId) await API.post(`/attendance/session/${sessionId}/end`).catch(() => { });
        setSessionActive(false);
        setSessionId(null);
        setCurrentCode('');
    };

    // Find current subject label
    const currentSubject = subjects.find(s =>
        String(s.subjectId) === String(selectedSubjectId)
    );
    return (
        <div className="
            mt-4 mb-4 mx-auto w-full max-w-6xl p-5 sm:p-6 lg:p-8
            bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl shadow-sm text-slate-800 dark:text-slate-100 overflow-hidden text-left
        ">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">
                Live Class Attendance
            </h3>

            {!sessionActive ? (
                <div className="w-full max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Section */}
                        <div className="space-y-2">
                            <label className="
                                block text-xs
                                text-slate-500 dark:text-slate-400
                                font-semibold
                                uppercase
                                tracking-wider
                            ">
                                Section
                            </label>
                            <select
                                value={selectedSectionId}
                                onChange={e => setSelectedSectionId(e.target.value)}
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    text-sm
                                    bg-slate-50 dark:bg-[#0D1512]/40
                                    text-slate-900 dark:text-slate-100
                                    rounded-xl
                                    border border-slate-200 dark:border-emerald-950/60
                                    focus:outline-none
                                    focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                                    transition-all cursor-pointer
                                "
                            >
                                <option value="" disabled className="bg-white dark:bg-[#14221C] text-slate-900 dark:text-slate-100">
                                    Select a Section
                                </option>
                                {sections.map(s => (
                                    <option key={s.id} value={s.id} className="bg-white dark:bg-[#14221C] text-slate-900 dark:text-slate-100">
                                        {s.sectionName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <label className="
                                block text-xs
                                text-slate-500 dark:text-slate-400
                                font-semibold
                                uppercase
                                tracking-wider
                            ">
                                Subject being taught
                            </label>
                            <select
                                value={selectedSubjectId}
                                onChange={e => setSelectedSubjectId(e.target.value)}
                                disabled={subjects.length === 0}
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    text-sm
                                    bg-slate-50 dark:bg-[#0D1512]/40
                                    text-slate-900 dark:text-slate-100
                                    rounded-xl
                                    border border-slate-200 dark:border-emerald-950/60
                                    focus:outline-none
                                    focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                                    transition-all cursor-pointer
                                    disabled:opacity-50
                                "
                            >
                                <option value="" disabled className="bg-white dark:bg-[#14221C] text-slate-900 dark:text-slate-100">
                                    {subjects.length === 0
                                        ? "No subjects assigned"
                                        : "Select a Subject"}
                                </option>
                                {subjects.map(s => (
                                    <option
                                        key={s.subjectId}
                                        value={s.subjectId}
                                        className="bg-white dark:bg-[#14221C] text-slate-900 dark:text-slate-100"
                                    >
                                        {s.subjectCode
                                            ? `${s.subjectCode} — ${s.subjectName}`
                                            : s.subjectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <label className="
                                block text-xs
                                text-slate-500 dark:text-slate-400
                                font-semibold
                                uppercase
                                tracking-wider
                            ">
                                Session Duration
                            </label>
                            <select
                                value={durationInMinutes}
                                onChange={e => setDurationInMinutes(parseInt(e.target.value))}
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    text-sm
                                    bg-slate-50 dark:bg-[#0D1512]/40
                                    text-slate-900 dark:text-slate-100
                                    rounded-xl
                                    border border-slate-200 dark:border-emerald-950/60
                                    focus:outline-none
                                    focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                                    transition-all cursor-pointer
                                "
                            >
                                <option value={30} className="bg-white dark:bg-[#14221C] text-slate-900 dark:text-slate-100">30 Minutes</option>
                                <option value={40} className="bg-white dark:bg-[#14221C] text-slate-900 dark:text-slate-100">40 Minutes (Default)</option>
                                <option value={50} className="bg-white dark:bg-[#14221C] text-slate-900 dark:text-slate-100">50 Minutes</option>
                                <option value={60} className="bg-white dark:bg-[#14221C] text-slate-900 dark:text-slate-100">60 Minutes</option>
                                <option value={90} className="bg-white dark:bg-[#14221C] text-slate-900 dark:text-slate-100">90 Minutes</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-center pt-2">
                        <button
                            onClick={startSession}
                            disabled={!selectedSectionId}
                            className="
                                px-8 py-3.5
                                bg-emerald-600
                                hover:bg-emerald-700
                                disabled:bg-slate-300 dark:disabled:bg-emerald-950/50
                                disabled:cursor-not-allowed
                                text-white
                                rounded-xl
                                font-bold
                                transition-all
                                shadow-md shadow-emerald-500/10
                            "
                        >
                            Start Attendance Session
                        </button>
                    </div>
                </div>

            ) : (

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
                    
                    {/* Left Panel: Control console and rotating code */}
                    <div className="lg:col-span-5 flex flex-col items-center text-center p-6 bg-slate-50/50 dark:bg-[#0D1512]/30 border border-slate-200/50 dark:border-emerald-950/40 rounded-2xl w-full">
                        
                        {currentSubject && (
                            <div className="
                                mb-4
                                px-4
                                py-2.5
                                text-center
                                bg-emerald-50 dark:bg-emerald-950/30
                                border border-emerald-200/40 dark:border-emerald-950/60
                                rounded-xl
                                text-xs
                                text-emerald-700 dark:text-emerald-300
                                font-bold
                                max-w-full
                                break-words
                            ">
                                📚 {currentSubject.subjectCode} — {currentSubject.subjectName}
                            </div>
                        )}

                        <p className="
                            text-slate-400 dark:text-slate-500
                            mb-4
                            font-semibold
                            uppercase
                            tracking-wider
                            text-[11px]
                        ">
                            Class Verification Code
                        </p>

                        {/* Individual Card-Based Passcode Display */}
                        <div className="flex justify-center gap-2 sm:gap-3 my-2 w-full max-w-md">
                            {Array.from({ length: 6 }).map((_, idx) => {
                                const char = currentCode ? currentCode[idx] : '—';
                                return (
                                    <div
                                        key={idx}
                                        className="
                                            flex-1 aspect-[3/4] max-w-[55px] min-h-[50px]
                                            flex items-center justify-center
                                            text-2xl sm:text-3xl font-bold font-mono
                                            rounded-xl
                                            bg-gradient-to-b from-white to-slate-50/50
                                            dark:from-[#1A2E26] dark:to-[#0D1A15]
                                            border border-slate-200 dark:border-emerald-900/40
                                            shadow-sm text-emerald-600 dark:text-emerald-400
                                            transition-all duration-300 transform hover:scale-105
                                        "
                                    >
                                        {char}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Timer Badge */}
                        <div className="
                            mt-6
                            flex
                            justify-center
                            items-center
                            gap-2.5
                            bg-emerald-500/10 dark:bg-emerald-950/30
                            px-4
                            py-2
                            rounded-full
                            border border-emerald-500/20 dark:border-emerald-950/50
                        ">
                            <div className="
                                w-3.5 h-3.5
                                rounded-full
                                border-2
                                border-emerald-600 dark:border-emerald-400
                                border-t-transparent
                                animate-spin
                            " />
                            <span className="
                                text-emerald-700 dark:text-emerald-300
                                text-xs
                                font-semibold
                            ">
                                Refreshes in {countdown} sec
                            </span>
                        </div>

                        {/* Action Control */}
                        <button
                            onClick={stopSession}
                            className="
                                mt-6
                                w-full
                                py-3
                                bg-rose-500/10
                                hover:bg-rose-500/20
                                text-rose-600 dark:text-rose-400
                                border border-rose-500/30
                                rounded-xl
                                font-bold
                                text-sm
                                transition
                            "
                        >
                            End Session
                        </button>
                    </div>

                    {/* Right Panel: Live Attendance Roster */}
                    <div className="lg:col-span-7 w-full lg:mt-0 mt-4">
                        <LiveAttendanceList
                            sessionId={sessionId}
                        />
                    </div>

                </div>

            )}
        </div>
    );
}