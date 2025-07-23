// import React from "react";

// export default function ProfileCard() {
//   return (
//     <>
//     <section className="bg-[#F0F8FF] border-2 border-black rounded-2xl lg: w-xl">
//         <h2>Profile goes here.. </h2>
//     </section>
//     </>
//   );
// }

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



