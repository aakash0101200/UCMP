export interface ActiveSession {
  id: number;
  subjectCode: string;
  subjectName: string;
  sectionName: string;
  sectionId?: number;
  subjectId?: number;
}

export interface Section {
  id: number;
  sectionName: string;
}

export interface Subject {
  id: number;
  subjectCode: string;
  subjectName: string;
  sectionId: number;
}

export interface RosterRecord {
  name: string;
  collegeId: string;
  rollNumber: string;
  markedAt: string;
}

export interface TimetableSlot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  roomName: string;
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  attended: number;
  totalClasses: number;
}

export interface Assignment {
  id: string;
  title: string;
  subjectName: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  content?: string;
  time: string;
  author: string;
}
