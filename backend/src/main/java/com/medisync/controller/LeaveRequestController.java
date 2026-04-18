package com.medisync.controller;

import com.medisync.entity.LeaveRequest;
import com.medisync.entity.Appointment;
import com.medisync.entity.Doctor;
import com.medisync.repository.LeaveRequestRepository;
import com.medisync.repository.AppointmentRepository;
import com.medisync.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<LeaveRequest> getAllLeaves() {
        return leaveRequestRepository.findAll();
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public List<LeaveRequest> getLeavesByDoctor(@PathVariable Long doctorId) {
        return leaveRequestRepository.findByDoctorId(doctorId);
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public LeaveRequest createLeaveRequest(@RequestBody LeaveRequest leaveRequest) {
        leaveRequest.setStatus("PENDING");
        return leaveRequestRepository.save(leaveRequest);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateLeaveStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        return leaveRequestRepository.findById(id).map(leave -> {
            String newStatus = payload.get("status");
            leave.setStatus(newStatus);
            LeaveRequest savedLeave = leaveRequestRepository.save(leave);

            if ("APPROVED".equals(newStatus)) {
                reassignAppointments(leave);
            }

            return ResponseEntity.ok(savedLeave);
        }).orElseThrow(() -> new RuntimeException("Leave Request not found"));
    }

    private void reassignAppointments(LeaveRequest leave) {
        Doctor leaveDoctor = leave.getDoctor();
        if (leaveDoctor == null) return;

        LocalDate start = leave.getStartDate();
        LocalDate end = leave.getEndDate();

        List<Appointment> affectedAppointments = appointmentRepository.findByDoctorIdAndDateBetween(leaveDoctor.getId(), start, end);
        List<Doctor> alternativeDoctors = doctorRepository.findBySpecialization(leaveDoctor.getSpecialization());

        for (Appointment app : affectedAppointments) {
            if ("BOOKED".equals(app.getStatus())) {
                boolean reassigned = false;
                for (Doctor altDoc : alternativeDoctors) {
                    if (altDoc.getId().equals(leaveDoctor.getId())) continue;

                    boolean conflict = appointmentRepository.existsByDoctorIdAndDateAndTime(altDoc.getId(), app.getDate(), app.getTime());
                    boolean onLeave = leaveRequestRepository.isDoctorOnLeave(altDoc.getId(), app.getDate());

                    if (!conflict && !onLeave) {
                        app.setDoctor(altDoc);
                        appointmentRepository.save(app);
                        reassigned = true;
                        break;
                    }
                }

                if (!reassigned) {
                    app.setStatus("CANCELLED");
                    app.setPrescriptionNotes("Automatically cancelled due to doctor leave. No alternative doctor available.");
                    appointmentRepository.save(app);
                }
            }
        }
    }
}
