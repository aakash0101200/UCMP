

import React from "react";
import profileImg from '../../assets/profile.jpg';

const ProfileCard = () => {
    return (
        <div className="max-w-sm mx-auto overflow-hidden bg-yellow rounded-lg shadow-lg hover:shadow-blue-400">
            <div className="flex justify-center mt-3">
                <img className="rounded-full h-40 w-40 object-cover"
                    src={profileImg}
                    alt="Profile"
                />

            </div>
            <div className="flex flex-col items-center justify-center px-3 py-2">
                <div className="text-xl font-semibold text-gray-800">Aaditya Kumawat</div>
                <p className="text-gray-600">Front-end Developer</p>
            </div>

            <div className="flex flex-wrap justify-around gap-2 px-3 py-2 max-w-sm">
                <div className="px-2 py-1 font-semibold text-teal-900 bg-teal-200 text-xs rounded-full w-1/4">3rd-Yr</div>
                <div className="px-2 py-1 font-semibold text-indigo-900 bg-indigo-200 text-xs rounded-full w-1/4">5th Sem</div>
                <div className="px-2 py-1 font-semibold text-purple-900 bg-purple-200 text-xs rounded-full w-1/4">CSE-A</div>
                <div className="px-2 py-1 font-semibold text-teal-900 bg-teal-200 text-xs rounded-full w-1/4">3rd-Yr</div>
                <div className="px-2 py-1 font-semibold text-indigo-900 bg-indigo-200 text-xs rounded-full w-1/4">5th Sem</div>
                <div className="px-2 py-1 font-semibold text-purple-900 bg-purple-200 text-xs rounded-full w-1/4">CSE-A</div>
            </div>
            <div className="text-center px-6 py-4">
                <a href="#" className="text-blue-500 hover:underline">
                    View Profile
                </a>
            </div>
        </div>
    );
};

export default ProfileCard;



// import React from "react";
// import { profile } from "../../Services/profile"

// const ProfilePage = () => {
//   const user = profile[0];

//   return (
//     <div className="flex flex-col items-center mt-12">
//       <div className="flex items-center bg-[#222248] bg-opacity-95 rounded-2xl shadow-2xl p-10 min-w-[340px] max-w-lg border border-[#35358e]">
//         <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-4xl font-bold text-white mr-10 select-none">
//           {user.name[0]}
//         </div>
//         <div>
//           <h2 className="text-2xl font-semibold text-white mb-4">{user.name}</h2>
//           <div className="flex justify-between mb-2 text-gray-300">
//             <span className="font-medium w-36">College ID:</span>
//             <span className="text-right">{user.collegeId}</span>
//           </div>
//           <div className="flex justify-between mb-2 text-gray-300">
//             <span className="font-medium w-36">Branch:</span>
//             <span className="text-right">{user.branch}</span>
//           </div>
//           <div className="flex justify-between mb-2 text-gray-300">
//             <span className="font-medium w-36">Email:</span>
//             <span className="text-right">{user.email}</span>
//           </div>
//           <div className="flex justify-between mb-2 text-gray-300">
//             <span className="font-medium w-36">Date of Birth:</span>
//             <span className="text-right">{user.dob}</span>
//           </div>
//           <div className="flex justify-between mb-2 text-gray-300">
//             <span className="font-medium w-36">Year:</span>
//             <span className="text-right">{user.year}</span>
//           </div>
//           <div className="flex justify-between mb-2 text-gray-300">
//             <span className="font-medium w-36">Semester:</span>
//             <span className="text-right">{user.sem}</span>
//           </div>
//           <div className="flex justify-between mb-2 text-gray-300">
//             <span className="font-medium w-36">Contact:</span>
//             <span className="text-right">{user.contact}</span>
//           </div>
//         </div>
//       </div>
//       <button
//         className="mt-8 px-8 py-3 text-white rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 shadow-lg hover:from-cyan-600 hover:to-violet-700 transition text-base font-bold"
//       >
//         Edit Profile
//       </button>
//     </div>
//   );
// };

// export default ProfilePage;

