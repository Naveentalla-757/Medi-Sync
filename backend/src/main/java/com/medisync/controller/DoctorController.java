package com.medisync.controller;

import com.medisync.entity.Doctor;
import com.medisync.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PATIENT') or hasRole('DOCTOR')")
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorService.createDoctor(doctor);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctorDetails) {
        Doctor updatedDoctor = doctorService.updateDoctor(id, doctorDetails);
        return ResponseEntity.ok(updatedDoctor);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok().build();
    }
}
