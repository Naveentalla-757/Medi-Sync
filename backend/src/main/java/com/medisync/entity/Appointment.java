package com.medisync.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    private LocalDate date;
    private LocalTime time;

    // BOOKED, CANCELLED, COMPLETED
    private String status;

    @Column(columnDefinition = "TEXT")
    private String prescriptionNotes;
    
    @Column(columnDefinition = "TEXT")
    private String symptoms;
    
    private Boolean emergency = false;
}
