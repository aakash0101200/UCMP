import React from "react";

import AssignmentPublisher from "../../../components/Announcements/AssignmentPublisher";

import BottomNavBar from "../../../components/navigation/BottomNavBar";

export default function AssignmentWrapper() {
    return (
        <div className="scroll-style ">

            <h2 className="mb-4 text-2xl font-bold">Assignments: </h2>
            <AssignmentPublisher />

            <BottomNavBar />


        </div>


    );
}