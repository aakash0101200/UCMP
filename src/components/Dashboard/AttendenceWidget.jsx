import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; // Import the styles for CircularProgressbar   
import ProgressBar from "@ramonak/react-progress-bar";
import { motion, AnimatePresence } from 'framer-motion';
import { subjectData } from '../../utils/attendanceData';
import { div, h2 } from "framer-motion/client";

const subjectWiseAttendance = subjectData.map((subject) => ({ ...subject, percentage: ((subject.attendedClasses / subject.totalClasses) * 100).toFixed(2) }))
const totalPercentage = subjectWiseAttendance.reduce((sum, subject) => sum + parseFloat(subject.percentage), 0);
const averagePercentage = (totalPercentage / subjectWiseAttendance.length).toFixed(2);

export default function AttendanceWidget() {
    const [view, setView] = useState('average');

    console.log(subjectWiseAttendance);
    return (
        <section className="bg-neutral-800 rounded-2xl shadow-md shadow-neutral-900 p-5 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-md text-gray-200">Attendance Overview</h2>
                <br />
                <button onClick={() => setView('average')} className={`text-xs rounded-md px-4 py-2 cursor-pointer transition-colors ${view === 'average' ? (
                    'bg-indigo-600 '
                ) : (
                    'bg-neutral-900')}`}>
                    Average
                </button>
                <button onClick={() => setView('subject')} className={`text-xs rounded-md px-4 py-2  cursor-pointer transition-colors ${view === 'subject' ? (
                    'bg-indigo-600 '
                ) : (
                    'bg-neutral-900')}`}>
                    Subject-wise
                </button>

            </div>
            <AnimatePresence mode="wait">
                {view === 'average' ? (
                    <motion.div
                        key="average"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        {renderAverageAttendance(averagePercentage)}
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
    )
}



function renderAverageAttendance(averagePercentage) {
    return (
        <div className="flex justify-around">

            <div className="w-30 h-30">
                <CircularProgressbar
                    value={averagePercentage}
                    text={`${averagePercentage}%`}
                    styles={buildStyles({
                        textSize: '16px',
                        textColor: '#ffffff',
                        trailColor: '#374151',
                        // Adjust the path color based on the average percentage
                        pathColor:
                            averagePercentage >= 75
                                ? '#22c55e' // green (good)
                                : averagePercentage >= 50
                                    ? '#eab308' // yellow (borderline)
                                    : '#ef4444', // red (bad)
                    })}
                />
            </div>
            <div className="flex flex-col items-center mt-6">
                <h2 className="text-lg text-gray-200 mb-2">Overall Attendance</h2>
                <p className="text-sm text-gray-400">Average: {averagePercentage}%</p>
            </div>
        </div>
    );
}
function renderSubjectAttendance() {
    return (
        <div className="bg-neutral-800 text-xs">
            {subjectWiseAttendance.map((subject, index) => (
                <div key={index} className="max-w-80">
                    <div className="text-xs font-medium text-gray-200 my-1" >
                        {subject.name} - <span>{subject.totalClasses}/{subject.attendedClasses}</span>
                    </div>
                    <ProgressBar
                        completed={subject.percentage}
                        maxCompleted={100}
                        height="8px"
                        borderRadius="8px"
                        labelAlignment="outside"
                        baseBgColor="#ffffff"
                        labelClassName="text-gray-200"
                        bgColor={
                            subject.percentage >= 75
                                ? "#16a34a" // green
                                : subject.percentage >= 60
                                    ? "#facc15" // yellow
                                    : "#dc2626" // red
                        }
                    />
                </div>
            ))}
        </div>
    );

}



// export default function AttendanceWidget() {
//     const [view, setView] = useState('average');
//     const totalAttendance = subjectData.reduce((sum, subject) => sum + subject.attendance, 0);
//     const averageAttendance = totalAttendance / subjectData.length;

//     function handleViewChange(newView) {
//         setView(newView);
//     }

//     return (

//         <section className='w-full max-w-sm bg-gray-950 text-gray-200 p-4 rounded-xl shadow-md font-sans m-4'>
//             <div className="bg-green-500 hover:bg-red-500 text-white p-4">
//                 Test Widget
//             </div>

//             <div className='flex justify-end gap-4 mb-6'>
//                 <button
//                     onClick={() => handleViewChange("average")}
//                     className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${view === "average"
//                         ? "bg-indigo-600 text-white"
//                         : "bg-gray-900 text-white hover:bg-gray-700"
//                         }`}
//                 >
//                     Average
//                 </button>
//                 <button
//                     onClick={() => handleViewChange("subject")}
//                     className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${view === "subject"
//                         ? "bg-indigo-600 text-white"
//                         : "bg-gray-900 text-white hover:bg-gray-700"
//                         }`}
//                 >
//                     Subject-wise
//                 </button>
//             </div>

//             <p className="text-sm text-gray-500 mb-4">Current view: {view}</p>

//             {/* AnimatePresence adds exit animation support */}
//             <AnimatePresence mode="wait">
//                 {view === 'average' ? (
//                     <motion.div
//                         key="average"
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         exit={{ opacity: 0, x: -20 }}
//                         transition={{ duration: 0.4, ease: "easeInOut" }}
//                     >
//                         {renderAverageAttendance(averageAttendance)}
//                     </motion.div>
//                 ) : (
//                     <motion.div
//                         key="subject"
//                         initial={{ opacity: 0, x: 20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         exit={{ opacity: 0, x: 20 }}
//                         transition={{ duration: 0.4, ease: "easeInOut" }}
//                     >
//                         {renderSubjectAttendance()}
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//         </section>
//     );
// }

// function renderAverageAttendance(averageAttendance) {
//     return (
//         <div className='flex flex-col items-center'>
//             <div className="w-30 h-30">
//                 <CircularProgressbar
//                     value={averageAttendance}
//                     text={`${averageAttendance}%`}
//                     styles={buildStyles({
//                         textSize: '16px',
//                         textColor: '#ffffff',
//                         trailColor: '#374151',
//                         pathColor:
//                             averageAttendance >= 75
//                                 ? '#22c55e' // green (good)
//                                 : averageAttendance >= 50
//                                     ? '#eab308' // yellow (borderline)
//                                     : '#ef4444', // red (bad)
//                     })} />
//             </div>
//             <p className="mt-4 text-gray-700 text-sm font-medium">Overall Attendance</p>
//         </div>
//     );
// }

// function renderSubjectAttendance() {


//     return (
//         <div className='space-y-2 max-h-[400px]'>

//             {subjectData.map((subject, index) => (
//                 <div key={index}>
//                     <div className="text-sm font-medium text-gray-800 mb-1">
//                         {subject.name}
//                     </div>

//                     <ProgressBar
//                         completed={subject.attendance}
//                         maxCompleted={100}
//                         height="8px"
//                         borderRadius="8px"
//                         labelAlignment="outside"
//                         baseBgColor="#ffffff"
//                         labelClassName="text-gray-800"
//                         bgColor={
//                             subject.attendance >= 75
//                                 ? "#16a34a" // green
//                                 : subject.attendance >= 60
//                                     ? "#facc15" // yellow
//                                     : "#dc2626" // red
//                         } />
//                 </div>
//             ))}
//         </div>
//     );
// }




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

