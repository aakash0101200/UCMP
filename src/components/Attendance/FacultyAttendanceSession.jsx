import React, { useState, useEffect } from 'react';
import API from '../../Services/api';

export default function FacultyAttendanceSession() {
    const [sessionActive, setSessionActive] = useState(false);
    const [currentCode, setCurrentCode] = useState('');
    const [countdown, setCountdown] = useState(15);
    const [sessionId, setSessionId] = useState(null);

    const sectionId = 1; // Assuming section 1 is selected by the faculty for this demo.

    // Start session
    const startSession = async () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    const response = await API.post(`/attendance/start`, { 
                        sectionId: sectionId, latitude: lat, longitude: lon, radiusInMeters: 50.0 
                    });
                    const data = response.data;
                    setSessionId(data.id);
                    setSessionActive(true);
                    fetchCode(data.id);
                } catch (error) {
                    console.error("Start Session Error:", error);
                    alert("Error starting session. Check backend or faculty permissions.");
                }
            }, (error) => {
                alert("Please allow location to start the attendance session.");
            });
        } else {
            alert("Geolocation IS NOT available in your browser");
        }
    };

    const fetchCode = async (sId) => {
        try {
            const response = await API.get(`/attendance/session/${sId}/code`);
            if (response.status === 200) {
                // Check if axios parsed it as number or string. Usually string.
                setCurrentCode(response.data.toString());
            } else {
                console.error("Failed to fetch code. Status:", response.status);
            }
            setCountdown(15);
        } catch (error) {
             console.error("Network error fetching code", error);
        }
    };

    useEffect(() => {
        let interval;
        if (sessionActive && sessionId) {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        fetchCode(sessionId);
                        return 15;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionActive, sessionId]);

    const stopSession = async () => {
        if (sessionId) {
             await API.post(`/attendance/session/${sessionId}/end`).catch(() => {});
        }
        setSessionActive(false);
        setSessionId(null);
    };

    return (
        <div className="p-6 mt-4 mb-4 bg-neutral-900 rounded-2xl border border-neutral-700 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Live Class Attendance</h3>
            
            {!sessionActive ? (
                <button 
                    onClick={startSession}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition shadow-indigo-500/30 shadow-lg"
                >
                    Start Attendance Session
                </button>
            ) : (
                <div className="flex flex-col items-center py-6">
                    <p className="text-gray-400 mb-4 font-medium uppercase tracking-wider text-sm">Project this code to the class</p>
                    <div className="text-7xl font-mono text-white tracking-widest bg-neutral-950 px-10 py-6 rounded-2xl border border-neutral-700 shadow-inner">
                        {currentCode ? currentCode.split('').join(' ') : '------'}
                    </div>
                    <div className="mt-8 flex items-center gap-3 bg-indigo-950/30 px-6 py-3 rounded-full border border-indigo-500/30">
                        <div className="w-5 h-5 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                        <span className="text-indigo-400 font-medium tracking-wide">Refreshes in {countdown} sec</span>
                    </div>
                    <button 
                        onClick={stopSession}
                        className="mt-8 px-8 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-900/50 rounded-xl font-medium transition"
                    >
                        End Session
                    </button>
                </div>
            )}
        </div>
    );
}
