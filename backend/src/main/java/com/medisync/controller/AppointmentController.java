package com.medisync.controller;

import com.medisync.entity.Appointment;
import com.medisync.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.medisync.payload.response.MessageResponse;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            Appointment created = appointmentService.createAppointment(appointment);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Appointment appointmentDetails) {
        Appointment updatedAppointment = appointmentService.updateAppointment(id, appointmentDetails);
        return ResponseEntity.ok(updatedAppointment);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok().build();
    }
}
