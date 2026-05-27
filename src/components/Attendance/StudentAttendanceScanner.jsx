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
        
        // Transport security check for geolocation access
        const isSecure = window.location.protocol === 'https:' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
        if (!isSecure) {
            setStatus('error');
            setMessage("Security Error: Geolocation hardware APIs require a secure HTTPS connection.");
            return;
        }
        
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
            <p className="text-sm text-gray-400 mb-4">Enter the 6-digit code shown on the projector.</p>
            
            {/* Geolocation Privacy & Security Disclosure */}
            <div className="mb-6 p-3.5 bg-indigo-950/20 border border-indigo-900/30 rounded-xl flex items-start gap-2.5 text-xs text-indigo-200">
                <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="leading-relaxed">
                    <strong>Privacy Disclosure:</strong> This scanner requests your device's physical GPS coordinates to verify classroom presence. Coordinates are securely encrypted, compared against the teacher's location in real-time, and are not tracked outside this action.
                </p>
            </div>
            
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
