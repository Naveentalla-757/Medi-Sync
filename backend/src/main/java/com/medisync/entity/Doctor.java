package com.medisync.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Link to the user account
    private String username;
    private String name;
    private String specialization;
    
    // Using a simple String for availability e.g. "Mon-Fri 9AM-5PM"
    private String availability;
}
