// Static mock data for read-only demo sessions
// Protects actual database records and keeps demo experience static and safe.

export const mockAnnouncements = {
  data: [
    {
      id: 101,
      title: "Semester Registration Extended",
      content: "The registration for the upcoming semester has been extended until next Friday. Please complete the form and clear any outstanding dues.",
      postedBy: "Dean Academics",
      type: "ACADEMICS",
      createdAt: "2026-05-20T10:00:00Z"
    },
    {
      id: 102,
      title: "IT Lab Maintenance Schedule",
      content: "CS Lab 1 and 2 will be closed for software upgrades on Saturday from 9 AM to 2 PM. Please plan your lab works accordingly.",
      postedBy: "System Admin",
      type: "FACILITIES",
      createdAt: "2026-05-22T14:30:00Z"
    },
    {
      id: 103,
      title: "Guest Lecture on Cloud Architectures",
      content: "Join us for an interactive session on cloud migration strategies by industry experts from AWS on Monday at 11 AM in the Seminar Hall.",
      postedBy: "HOD CSE",
      type: "EVENT",
      createdAt: "2026-05-23T09:00:00Z"
    }
  ]
};

export const mockProfileData = (collegeId) => {
  const normalizedId = collegeId.toUpperCase();
  if (normalizedId.includes("ADMIN")) {
    return {
      data: {
        collegeId: "DEMO_ADMIN_001",
        name: "Demo Admin User",
        email: "demo.admin@ucmp.edu",
        roles: ["ADMIN"]
      }
    };
  } else if (normalizedId.includes("FACULTY") || normalizedId.includes("CLG00")) {
    return {
      data: {
        collegeId: "DEMO_clg00",
        name: "Demo Faculty User",
        email: "demo.faculty@ucmp.edu",
        roles: ["FACULTY"],
        faculty: {
          department: "Computer Science",
          designation: "Professor",
          sections: [{ id: 1, sectionName: "Section A" }]
        }
      }
    };
  } else {
    return {
      data: {
        collegeId: "DEMO_2025CS001",
        name: "Demo Student User",
        email: "demo.student@ucmp.edu",
        roles: ["STUDENT"],
        student: {
          rollNumber: "DEMO_2025_001",
          year: "3",
          batch: { id: 1, batchName: "B.Tech CS 2026" },
          section: { id: 1, sectionName: "Section A", sectionId: 1 }
        }
      }
    };
  }
};

export const mockUsersData = {
  data: [
    {
      collegeId: "DEMO_ADMIN_001",
      name: "Demo Admin User",
      email: "demo.admin@ucmp.edu",
      role: "ADMIN",
      department: "Administration"
    },
    {
      collegeId: "DEMO_clg00",
      name: "Demo Faculty User",
      email: "demo.faculty@ucmp.edu",
      role: "FACULTY",
      department: "Computer Science",
      sectionIds: [1]
    },
    {
      collegeId: "FAC_101",
      name: "Dr. Alan Smith",
      email: "smith@ucmp.edu",
      role: "FACULTY",
      department: "Computer Science",
      sectionIds: [1]
    },
    {
      collegeId: "DEMO_2025CS001",
      name: "Demo Student User",
      email: "demo.student@ucmp.edu",
      role: "STUDENT",
      rollNumber: "DEMO_2025_001",
      year: "3",
      branch: "B.Tech CS 2026",
      sectionName: "Section A"
    },
    {
      collegeId: "2025CS002",
      name: "John Miller",
      email: "john.miller@example.com",
      role: "STUDENT",
      rollNumber: "2025CS002",
      year: "3",
      branch: "B.Tech CS 2026",
      sectionName: "Section A"
    },
    {
      collegeId: "2025CS003",
      name: "Sophia Watson",
      email: "sophia.watson@example.com",
      role: "STUDENT",
      rollNumber: "2025CS003",
      year: "3",
      branch: "B.Tech CS 2026",
      sectionName: "Section A"
    }
  ]
};

export const mockStatsData = {
  data: {
    totalUsers: 6,
    studentCount: 3,
    facultyCount: 2
  }
};

export const mockTimetableMetrics = {
  data: {
    activeOverridesToday: 0,
    pendingSubstitutions: 0,
    facultyUtilization: 65.5,
    cancelledClasses: 0,
    liveOngoingLectures: 1
  }
};

export const mockRooms = {
  data: [
    { id: 1, name: "Room 101", building: "Main Block", capacity: 60, type: "LECTURE_HALL", status: "AVAILABLE" },
    { id: 2, name: "CS Lab 1", building: "IT Block", capacity: 40, type: "CS_LAB", status: "AVAILABLE" }
  ]
};

export const mockSubjects = {
  data: [
    { id: 1, name: "Data Structures", code: "CS301", credits: 4, weeklyHours: 4, slotDuration: 1, requiredRoomType: "ANY", department: "Computer Science" },
    { id: 2, name: "Operating Systems", code: "CS303", credits: 4, weeklyHours: 4, slotDuration: 1, requiredRoomType: "ANY", department: "Computer Science" }
  ]
};

export const mockSections = {
  data: [
    { id: 1, sectionName: "Section A", batch: { id: 1, batchName: "B.Tech CS 2026" } }
  ]
};

export const mockBatches = {
  data: [
    { id: 1, batchName: "B.Tech CS 2026" }
  ]
};

export const mockScheduleData = {
  data: [
    {
      id: 501,
      dayOfWeek: "MONDAY",
      startTime: "09:00:00",
      endTime: "10:00:00",
      subject: { id: 1, name: "Data Structures", code: "CS301" },
      room: { id: 1, name: "Room 101" },
      faculty: { name: "Demo Faculty User" },
      term: "2026-Spring"
    },
    {
      id: 502,
      dayOfWeek: "WEDNESDAY",
      startTime: "11:00:00",
      endTime: "12:00:00",
      subject: { id: 2, name: "Operating Systems", code: "CS303" },
      room: { id: 2, name: "CS Lab 1" },
      faculty: { name: "Dr. Alan Smith" },
      term: "2026-Spring"
    }
  ]
};

export const mockAssignments = {
  data: []
};

export const mockAttendanceSummary = {
  data: {
    totalLectures: 32,
    attendedLectures: 28,
    attendancePercentage: 87.5
  }
};

export const mockAttendanceHistory = {
  data: [
    { id: 1, date: "2026-05-22", subjectName: "Data Structures", status: "PRESENT" },
    { id: 2, date: "2026-05-20", subjectName: "Operating Systems", status: "PRESENT" }
  ]
};
