package com.medisync.service;

import com.medisync.entity.Patient;
import com.medisync.repository.PatientRepository;
import com.medisync.repository.UserRepository;
import com.medisync.repository.AppointmentRepository;
import com.medisync.entity.Appointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Long id, Patient patientDetails) {
        return patientRepository.findById(id).map(patient -> {
            patient.setName(patientDetails.getName());
            patient.setAge(patientDetails.getAge());
            patient.setGender(patientDetails.getGender());
            patient.setContact(patientDetails.getContact());
            patient.setMedicalHistory(patientDetails.getMedicalHistory());
            return patientRepository.save(patient);
        }).orElseThrow(() -> new RuntimeException("Patient not found with id " + id));
    }

    public void deletePatient(Long id) {
        patientRepository.findById(id).ifPresent(patient -> {
            List<Appointment> apps = appointmentRepository.findByPatientId(id);
            appointmentRepository.deleteAll(apps);
            patientRepository.delete(patient);
            if (patient.getUserId() != null) {
                userRepository.deleteById(patient.getUserId());
            }
        });
    }
}
