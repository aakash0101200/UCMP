package com.aaditya.attendance_api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import com.aaditya.attendance_api.model.Subject;

@RestController
public class AttendanceController {

    @GetMapping("/api/attendance")
    public List<Subject> getAttendanceData() {
        return List.of(
            new Subject("Math", 80),
            new Subject("OOPs", 70),
            new Subject("Networking", 60)
        );
    }
}
