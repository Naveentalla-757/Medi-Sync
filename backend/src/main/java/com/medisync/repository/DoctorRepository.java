package com.medisync.repository;

import com.medisync.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    java.util.Optional<Doctor> findByUserId(Long userId);
    java.util.List<Doctor> findBySpecialization(String specialization);
}
