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
            mt-4 mb-4 mx-auto w-full max-w-5xl p-6 sm:p-8
            bg-white dark:bg-[#14221C] border border-emerald-200/40 dark:border-emerald-950/60 rounded-3xl shadow-sm text-slate-800 dark:text-slate-100 overflow-hidden text-left
        ">
            <h3 className="text-xl sm:text-2xl font-light tracking-tight text-slate-900 dark:text-white mb-6 ml-2">
                Live Class Attendance
            </h3>

            {!sessionActive ? (
                <div className="
                    flex flex-col items-center py-6 max-w-3xl mx-auto w-full space-y-6
                ">

                    {/* Section */}
                    <div className="max-w-md mx-auto w-full px-2">
                        <label className="
                            block text-xs
                            text-slate-500 dark:text-slate-400
                            mb-2
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
                    <div className="max-w-md mx-auto w-full px-2">
                        <label className="
                            block text-xs
                            text-slate-500 dark:text-slate-400
                            mb-2
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
                                    ? "No subjects found for this section"
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

                        <p className="
                            mt-2
                            text-xs
                            text-slate-400 dark:text-slate-500
                        ">
                            Each session is tagged for subject attendance tracking.
                        </p>
                    </div>

                    {/* Duration */}
                    <div className="max-w-md mx-auto w-full px-2">
                        <label className="
                            block text-xs
                            text-slate-500 dark:text-slate-400
                            mb-2
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

                    <button
                        onClick={startSession}
                        disabled={!selectedSectionId}
                        className="
                            w-full sm:w-auto
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

            ) : (

                <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto items-center">

                    {currentSubject && (
                        <div className="
                            mb-2
                            px-6
                            py-3
                            text-center
                            bg-emerald-50 dark:bg-emerald-950/30
                            border border-emerald-200/40 dark:border-emerald-950/60
                            rounded-2xl
                            text-sm
                            text-emerald-700 dark:text-emerald-300
                            font-bold
                            max-w-full
                            break-words
                        ">
                            📚 {currentSubject.subjectCode}
                            {" — "}
                            {currentSubject.subjectName}
                        </div>
                    )}

                    <p className="
                        text-slate-400 dark:text-slate-500
                        mb-2
                        font-semibold
                        uppercase
                        tracking-wider
                        text-xs
                        text-center
                    ">
                        Project this code to the class
                    </p>

                    {/* Attendance code */}
                    <div className="
                        w-full
                        text-center
                        overflow-x-auto
                    ">
                        <div className="
                            inline-block
                            text-4xl
                            sm:text-6xl
                            lg:text-7xl
                            font-mono
                            text-slate-800 dark:text-white
                            tracking-[0.25em]
                            bg-slate-50 dark:bg-[#0D1512]
                            px-8 sm:px-12 lg:px-16
                            py-6 sm:py-8
                            rounded-3xl
                            border border-slate-200 dark:border-emerald-950/60
                            shadow-inner
                        ">
                            {currentCode
                                ? currentCode.split("").join(" ")
                                : "------"}
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="
                        mt-6
                        flex
                        justify-center
                        items-center
                        gap-3
                        text-center
                        bg-emerald-500/10 dark:bg-emerald-950/30
                        px-6
                        py-3
                        rounded-full
                        border border-emerald-500/20 dark:border-emerald-950/50
                    ">
                        <div className="
                            w-4.5 h-4.5
                            rounded-full
                            border-4
                            border-emerald-600 dark:border-emerald-400
                            border-t-transparent
                            animate-spin
                        " />

                        <span className="
                            text-emerald-700 dark:text-emerald-300
                            text-sm
                            font-semibold
                        ">
                            Refreshes in {countdown} sec
                        </span>
                    </div>

                    <button
                        onClick={stopSession}
                        className="
                            mt-6
                            w-full sm:w-auto
                            px-8
                            py-3
                            bg-rose-500/10
                            hover:bg-rose-500/20
                            text-rose-600 dark:text-rose-400
                            border border-rose-500/30
                            rounded-xl
                            font-bold
                            transition
                        "
                    >
                        End Session
                    </button>

                    <div className="
                        w-full
                        mt-8
                        overflow-x-auto
                    ">
                        <LiveAttendanceList
                            sessionId={sessionId}
                        />
                    </div>

                </div>

            )}
        </div>
    );
}