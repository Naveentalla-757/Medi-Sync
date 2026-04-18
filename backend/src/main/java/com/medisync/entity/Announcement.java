package com.medisync.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String category = "NORMAL";
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
