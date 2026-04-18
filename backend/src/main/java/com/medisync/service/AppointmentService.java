package com.medisync.service;

import com.medisync.entity.Appointment;
import com.medisync.entity.Doctor;
import com.medisync.entity.Patient;
import com.medisync.repository.AppointmentRepository;
import com.medisync.repository.DoctorRepository;
import com.medisync.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private com.medisync.repository.LeaveRequestRepository leaveRequestRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    public Appointment createAppointment(Appointment appointment) {
        // Need to fetch managed entities if only IDs are passed
        if (appointment.getPatient() != null && appointment.getPatient().getId() != null) {
            Patient p = patientRepository.findById(appointment.getPatient().getId()).orElseThrow();
            appointment.setPatient(p);
        }
        if (appointment.getDoctor() != null && appointment.getDoctor().getId() != null) {
            Doctor d = doctorRepository.findById(appointment.getDoctor().getId()).orElseThrow();
            appointment.setDoctor(d);
        }
        
        if (appointment.getDoctor() != null && appointment.getDate() != null && appointment.getTime() != null) {
            // Check for existing overlapping appointment
            boolean exists = appointmentRepository.existsByDoctorIdAndDateAndTime(
                    appointment.getDoctor().getId(), appointment.getDate(), appointment.getTime());
            if (exists) {
                throw new RuntimeException("Doctor already has an appointment at this time");
            }
            
            // Check if doctor is on leave
            boolean onLeave = leaveRequestRepository.isDoctorOnLeave(appointment.getDoctor().getId(), appointment.getDate());
            if (onLeave) {
                throw new RuntimeException("Doctor is on an approved leave on this date");
            }
        }
        
        appointment.setStatus("BOOKED");
        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(Long id, Appointment updatedDetails) {
        return appointmentRepository.findById(id).map(app -> {
            if (updatedDetails.getStatus() != null) {
                app.setStatus(updatedDetails.getStatus());
            }
            if (updatedDetails.getPrescriptionNotes() != null) {
                app.setPrescriptionNotes(updatedDetails.getPrescriptionNotes());
            }
            return appointmentRepository.save(app);
        }).orElseThrow(() -> new RuntimeException("Appointment not found with id " + id));
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}
