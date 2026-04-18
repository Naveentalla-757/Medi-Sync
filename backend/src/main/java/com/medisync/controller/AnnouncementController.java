package com.medisync.controller;

import com.medisync.entity.Announcement;
import com.medisync.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @GetMapping
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Announcement createAnnouncement(@RequestBody Announcement announcement) {
        return announcementRepository.save(announcement);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        announcementRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
