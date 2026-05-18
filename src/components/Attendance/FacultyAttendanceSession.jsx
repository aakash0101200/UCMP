import React, { useState, useEffect } from 'react';
import API from '../../Services/api';
import LiveAttendanceList from './LiveAttendanceList';

export default function FacultyAttendanceSession() {
    const [sessionActive, setSessionActive]     = useState(false);
    const [currentCode, setCurrentCode]         = useState('');
    const [countdown, setCountdown]             = useState(15);
    const [sessionId, setSessionId]             = useState(null);

    // Section + subject selection
    const [sections, setSections]               = useState([]);
    const [subjects, setSubjects]               = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

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
        API.get('/timetable/assignments')
            .then(r => {
                // Filter assignments for the selected section
                const filtered = (r.data || []).filter(
                    a => String(a.sectionId) === String(selectedSectionId)
                );
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
    }, [selectedSectionId]);

    // Start session
    const startSession = async () => {
        if (!selectedSectionId) { alert('Please select a section first.'); return; }

        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude: lat, longitude: lon } }) => {
                try {
                    const res = await API.post('/attendance/start', {
                        sectionId:      selectedSectionId,
                        subjectId:      selectedSubjectId || null,   // ← subject tag
                        latitude:       lat,
                        longitude:      lon,
                        radiusInMeters: 50.0,
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
        setCountdown(15);
    };

    useEffect(() => {
        let interval;
        if (sessionActive && sessionId) {
            interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { fetchCode(sessionId); return 15; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionActive, sessionId]);

    const stopSession = async () => {
        if (sessionId) await API.post(`/attendance/session/${sessionId}/end`).catch(() => {});
        setSessionActive(false);
        setSessionId(null);
        setCurrentCode('');
    };

    // Find current subject label
    const currentSubject = subjects.find(s =>
        String(s.subjectId) === String(selectedSubjectId)
    );

    return (
        <div className="p-6 mt-4 mb-4 bg-neutral-900 rounded-2xl border border-neutral-700 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Live Class Attendance</h3>

            {!sessionActive ? (
                <div className="flex flex-col gap-4 max-w-md">
                    {/* Section selector */}
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1 font-medium uppercase tracking-wider">
                            Section
                        </label>
                        <select
                            value={selectedSectionId}
                            onChange={e => setSelectedSectionId(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-950 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="" disabled>Select a Section</option>
                            {sections.map(s => (
                                <option key={s.id} value={s.id}>{s.sectionName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Subject selector — the critical addition */}
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1 font-medium uppercase tracking-wider">
                            Subject being taught
                        </label>
                        <select
                            value={selectedSubjectId}
                            onChange={e => setSelectedSubjectId(e.target.value)}
                            disabled={subjects.length === 0}
                            className="w-full px-4 py-3 bg-neutral-950 text-white rounded-xl border border-neutral-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                        >
                            <option value="" disabled>
                                {subjects.length === 0 ? 'No subjects found for this section' : 'Select a Subject'}
                            </option>
                            {subjects.map(s => (
                                <option key={s.subjectId} value={s.subjectId}>
                                    {s.subjectCode ? `${s.subjectCode} — ${s.subjectName}` : s.subjectName}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-neutral-500">
                            Each session is tagged to this subject for accurate per-subject attendance stats.
                        </p>
                    </div>

                    <button
                        onClick={startSession}
                        disabled={!selectedSectionId}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition shadow-indigo-500/30 shadow-lg"
                    >
                        Start Attendance Session
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center py-6">
                    {currentSubject && (
                        <div className="mb-4 px-4 py-2 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-sm text-indigo-300 font-medium">
                            📚 {currentSubject.subjectCode} — {currentSubject.subjectName}
                        </div>
                    )}
                    <p className="text-gray-400 mb-4 font-medium uppercase tracking-wider text-sm">
                        Project this code to the class
                    </p>
                    <div className="text-7xl font-mono text-white tracking-widest bg-neutral-950 px-10 py-6 rounded-2xl border border-neutral-700 shadow-inner">
                        {currentCode ? currentCode.split('').join(' ') : '------'}
                    </div>
                    <div className="mt-8 flex items-center gap-3 bg-indigo-950/30 px-6 py-3 rounded-full border border-indigo-500/30">
                        <div className="w-5 h-5 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                        <span className="text-indigo-400 font-medium tracking-wide">Refreshes in {countdown} sec</span>
                    </div>
                    <button
                        onClick={stopSession}
                        className="mt-8 px-8 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-900/50 rounded-xl font-medium transition"
                    >
                        End Session
                    </button>
                    <div className="w-full mt-10">
                        <LiveAttendanceList sessionId={sessionId} />
                    </div>
                </div>
            )}
        </div>
    );
}