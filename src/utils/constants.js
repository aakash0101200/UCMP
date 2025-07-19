export const EVENT_TYPES = {
  admin_events: [
    { type: "exam", color: "#FF6B6B", permissions: ["admin", "faculty"] },
    { type: "college_announcement", color: "#4ECDC4", permissions: ["admin"] },
    { type: "holiday", color: "#45B7D1", permissions: ["admin"] },
    { type: "academic_deadline", color: "#F7B731", permissions: ["admin", "faculty"] },
    { type: "faculty_meeting", color: "#5F27CD", permissions: ["faculty"] }
  ],
  student_events: [
    { type: "personal_study", color: "#00D2D3", permissions: ["student"] },
    { type: "assignment", color: "#FF9FF3", permissions: ["student"] },
    { type: "personal_meeting", color: "#54A0FF", permissions: ["student"] },
    { type: "club_activity", color: "#5F27CD", permissions: ["student"] },
    { type: "personal_reminder", color: "#01A3A4", permissions: ["student"] }
  ]
};

export const ROLE_PERMISSIONS = {
  admin: ["create_any_event", "edit_any_event", "delete_any_event", "assign_to_students"],
  faculty: ["create_course_events", "edit_course_events", "assign_to_course_students"],
  student: ["create_personal_events", "edit_personal_events", "view_assigned_events"]
};

export const BRANCHES = ["CSE", "ECE", "ME", "CE", "IT"];
export const SECTIONS = ["A", "B", "C", "D"];
export const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const COURSES = [
  "Data Structures", "Algorithms", "Database Systems", "Software Engineering",
  "Computer Networks", "Operating Systems", "Web Development", "Mobile Development"
];