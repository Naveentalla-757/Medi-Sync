package com.medisync.service;

import com.medisync.entity.Doctor;
import com.medisync.repository.DoctorRepository;
import com.medisync.repository.UserRepository;
import com.medisync.repository.AppointmentRepository;
import com.medisync.repository.LeaveRequestRepository;
import com.medisync.entity.Appointment;
import com.medisync.entity.LeaveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, Doctor doctorDetails) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setName(doctorDetails.getName());
            doctor.setSpecialization(doctorDetails.getSpecialization());
            doctor.setAvailability(doctorDetails.getAvailability());
            return doctorRepository.save(doctor);
        }).orElseThrow(() -> new RuntimeException("Doctor not found with id " + id));
    }

    public void deleteDoctor(Long id) {
        doctorRepository.findById(id).ifPresent(doctor -> {
            List<Appointment> apps = appointmentRepository.findByDoctorId(id);
            appointmentRepository.deleteAll(apps);
            
            List<LeaveRequest> leaves = leaveRequestRepository.findByDoctorId(id);
            leaveRequestRepository.deleteAll(leaves);
            
            doctorRepository.delete(doctor);
            
            if (doctor.getUserId() != null) {
                userRepository.deleteById(doctor.getUserId());
            }
        });
    }
}
