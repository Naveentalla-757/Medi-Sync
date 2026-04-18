package com.medisync.repository;

import com.medisync.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByDoctorId(Long doctorId);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(l) > 0 FROM LeaveRequest l WHERE l.doctor.id = :doctorId AND l.status = 'APPROVED' AND :date >= l.startDate AND :date <= l.endDate")
    boolean isDoctorOnLeave(@org.springframework.data.repository.query.Param("doctorId") Long doctorId, @org.springframework.data.repository.query.Param("date") java.time.LocalDate date);
}
