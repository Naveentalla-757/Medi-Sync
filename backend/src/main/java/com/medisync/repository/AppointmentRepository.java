package com.medisync.repository;

import com.medisync.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByPatientId(Long patientId);
    boolean existsByDoctorIdAndDateAndTime(Long doctorId, java.time.LocalDate date, java.time.LocalTime time);
    List<Appointment> findByDoctorIdAndDateBetween(Long doctorId, java.time.LocalDate startDate, java.time.LocalDate endDate);
}
