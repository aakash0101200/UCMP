import React, { useState, useEffect } from 'react';
import API from '../../Services/api'; // Assuming your api instance is exported as default here

export default function LiveAttendanceList({ sessionId }) {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        if (!sessionId) return;

        const fetchRecords = async () => {
            try {
                const response = await API.get(`/attendance/session/${sessionId}/records`);
                setRecords(response.data);
            } catch (error) {
                console.error("Failed to fetch records", error);
            }
        };

        fetchRecords();
        const interval = setInterval(fetchRecords, 5000); // Polls every 5 seconds
        
        return () => clearInterval(interval);
    }, [sessionId]);

    return (
        <div className="mt-6 p-4 border rounded shadow-sm bg-white">
            <h3 className="text-lg font-bold mb-4">Live Attendance</h3>
            
            {records.length === 0 ? (
                <p className="text-gray-500">No students have joined yet.</p>
            ) : (
                <ul className="space-y-2">
                    {records.map((record, index) => (
                        <li key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium">
                                {record.name || 'Unknown Name'} ({record.collegeId})
                            </span>
                            <span className="text-sm text-gray-500">
                                {new Date(record.markedAt).toLocaleTimeString()}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}