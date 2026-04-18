package com.medisync.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Link to the user account
    private String username;
    private String name;
    private Integer age;
    private String gender;
    private String contact;
    
    @Column(columnDefinition = "TEXT")
    private String medicalHistory;
    
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
}
