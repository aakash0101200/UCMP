package com.aaditya.attendance_api.model;

public class Subject {
    private String subjectName;
    private int attendancePercentage;

    public Subject(String subjectName, int attendancePercentage) {
        this.subjectName = subjectName;
        this.attendancePercentage = attendancePercentage;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public int getAttendancePercentage() {
        return attendancePercentage;
    }
}
