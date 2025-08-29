import React from "react";



import P1 from "@/components/Profile/P1";
import P2 from "@/components/Profile/P2";
import P3 from "@/components/Profile/P3";
import P4 from "@/components/Profile/P4";


import BottomNavBar from "@/components/navigation/BottomNavBar";

export default function MyCoursesPage() {
  return (
    <div className="scroll-style ">

      <h2 className="mb-4 text-2xl font-bold">Courses: </h2>
 
<P1/>
<P2/>
<P3/>
<P4/>



    
<BottomNavBar />


    </div>


  );
}