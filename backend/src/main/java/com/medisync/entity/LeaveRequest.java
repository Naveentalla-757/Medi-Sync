package com.medisync.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "leave_requests")
@Data
@NoArgsConstructor
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    private LocalDate startDate;
    private LocalDate endDate;
    
    private String reason;
    
    // PENDING, APPROVED, REJECTED
    private String status = "PENDING";
}
