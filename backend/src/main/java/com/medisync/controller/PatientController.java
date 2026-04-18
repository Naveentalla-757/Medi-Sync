package com.medisync.controller;

import com.medisync.entity.Patient;
import com.medisync.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Patient createPatient(@RequestBody Patient patient) {
        return patientService.createPatient(patient);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patientDetails) {
        Patient updatedPatient = patientService.updatePatient(id, patientDetails);
        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok().build();
    }
}
