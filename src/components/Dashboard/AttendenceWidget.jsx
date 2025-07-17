// import React from 'react';
// import { Card, CardContent, Typography, LinearProgress } from '@mui/material';

// export default function AttendanceWidget() {
//   return (
//     <Card>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>
//           Attendance
//         </Typography>
//         <Typography variant="body2" color="textSecondary">
//           75% (Required: 75%)
//         </Typography>
//         <LinearProgress variant="determinate" value={75} sx={{ mt: 2, height: 10 }} />
//       </CardContent>
//     </Card>
//   );
// }

import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import ProgressBar from "@ramonak/react-progress-bar";
import { motion, AnimatePresence } from 'framer-motion';
import { subjectData } from '../../utils/attendanceData';

export default function Attendance() {
    const [view, setView] = useState('average');
    const totalAttendance =subjectData.reduce((sum,subject)=> sum+ subject.attendance, 0);
    const averageAttendance = totalAttendance / subjectData.length;
    
    function handleViewChange(newView) {
        setView(newView);
    }

    return (
        <section className='w-120 h-120 m-10 bg-gray-200 text-gray-900 p-6 rounded-xl shadow-lg shadow-gray-300 font-sans'>
            <div className='flex justify-end gap-4 mb-6'>
                <button
                    onClick={() => handleViewChange("average")}
                    className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${view === "average"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-900 text-white hover:bg-gray-700"
                        }`}
                >
                    Average
                </button>
                <button
                    onClick={() => handleViewChange("subject")}
                    className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${view === "subject"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-900 text-white hover:bg-gray-700"
                        }`}
                >
                    Subject-wise
                </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">Current view: {view}</p>

            {/* AnimatePresence adds exit animation support */}
            <AnimatePresence mode="wait">
                {view === 'average' ? (
                    <motion.div
                        key="average"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 ,ease: "easeInOut"}}
                    >
                        {renderAverageAttendance(averageAttendance)}
                    </motion.div>
                ) : (
                    <motion.div
                        key="subject"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        {renderSubjectAttendance()}
                    </motion.div>
                )}
            </AnimatePresence>

        </section>
    );
}

function renderAverageAttendance(averageAttendance) {
    return (
        <div className='flex flex-col items-center'>
            <div className="mt-10 w-50 h-50">
                <CircularProgressbar
                    value={averageAttendance}
                    text={`${averageAttendance}%`}
                    styles={buildStyles({
                        textSize: '16px',
                        textColor: '#ffffff',
                        trailColor: '#374151',
                        pathColor:
                            averageAttendance >= 75
                                ? '#22c55e' // green (good)
                                : averageAttendance >= 50
                                    ? '#eab308' // yellow (borderline)
                                    : '#ef4444', // red (bad)
                    })} />
            </div>
            <p className="mt-4 text-gray-700 text-sm font-medium">Overall Attendance</p>
        </div>
    );
}

function renderSubjectAttendance() {


    return (
        <div className='space-y-4'>
            {subjectData.map((subject, index) => (
                <div key={index}>
                    <div className="text-sm font-medium text-gray-800 mb-1">
                        {subject.name}
                    </div>

                    <ProgressBar
                        completed={subject.attendance}
                        maxCompleted={100}
                        height="12px"
                        borderRadius="8px"
                        labelAlignment="outside"
                        baseBgColor="#E5E7EB"
                        labelClassName="text-gray-800"
                        bgColor={
                            subject.attendance >= 75
                                ? "#16a34a" // green
                                : subject.attendance >= 60
                                    ? "#facc15" // yellow
                                    : "#dc2626" // red
                        } />
                </div>
            ))}
        </div>
    );
}
