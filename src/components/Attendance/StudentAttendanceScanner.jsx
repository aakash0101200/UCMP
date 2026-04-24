import React, { useState, useEffect } from 'react';
import API from '../../Services/api';

export default function StudentAttendanceScanner() {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [activeSession, setActiveSession] = useState(null);
    
    useEffect(() => {
        const fetchActiveSession = async () => {
            try {
                // This endpoint should return the current active session for the student
                const response = await API.get('/attendance/active-session', {
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                setActiveSession(response.data); 
            } catch (err) {
                console.error("No active session found for your section.");
            }
        };
        fetchActiveSession();
    }, []);

    const handleMarkAttendance = () => {
        if (!activeSession) return setMessage("No active session found for your class.");
        if (code.length !== 6) return setMessage("Please enter the 6-digit code.");
        
        setStatus('loading');

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude: lat, longitude: lon } = pos.coords;
                
                await API.post(`/attendance/mark`, { 
                    sessionId: activeSession.id, 
                    code: code, 
                    latitude: lat, 
                    longitude: lon 
                });

                setStatus('success');
                setMessage("Attendance marked successfully!");
            } catch (error) {
                setStatus('error');
                // Backend might return "Invalid Code", "Too far away", or "Session Expired"
                setMessage(error.response?.data?.message || "Failed to mark attendance.");
            }
        }, (err) => {
            setStatus('error');
            setMessage("Location access denied. Please enable GPS.");
        }, { enableHighAccuracy: true });
    };

    return (
        <div className="p-6 mb-6 bg-neutral-900 rounded-2xl border border-neutral-700 shadow-md">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="text-lg font-bold text-white">Live Class Verification</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">Enter the 6-digit code shown on the projector.</p>
            
            <div className="flex flex-col items-center">
                <input 
                    type="text" 
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))} // only numbers
                    placeholder="000000"
                    className="w-full max-w-[240px] text-center text-4xl tracking-widest font-mono bg-neutral-950 border border-neutral-600 text-white rounded-2xl py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />

                <button 
                    onClick={handleMarkAttendance}
                    disabled={status === 'loading'}
                    className={`mt-6 w-full max-w-[240px] py-4 rounded-xl font-bold text-white transition ${
                        status === 'loading' ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30 shadow-lg'
                    }`}
                >
                    {status === 'loading' ? 'Verifying Coordinates...' : 'Submit Attendance'}
                </button>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl w-full text-center text-sm font-medium ${
                        status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
