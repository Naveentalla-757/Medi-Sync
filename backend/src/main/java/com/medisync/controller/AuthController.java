package com.medisync.controller;

import com.medisync.entity.ERole;
import com.medisync.entity.User;
import com.medisync.payload.request.LoginRequest;
import com.medisync.payload.request.SignupRequest;
import com.medisync.payload.response.JwtResponse;
import com.medisync.payload.response.MessageResponse;
import com.medisync.repository.UserRepository;
import com.medisync.security.jwt.JwtUtils;
import com.medisync.security.services.UserDetailsImpl;
import com.medisync.entity.Patient;
import com.medisync.entity.Doctor;
import com.medisync.repository.PatientRepository;
import com.medisync.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                roles));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        String reqRole = signUpRequest.getRole();
        ERole role = ERole.ROLE_PATIENT; // default

        if (reqRole != null) {
            switch (reqRole.toLowerCase()) {
                case "admin":
                    role = ERole.ROLE_ADMIN;
                    break;
                case "doctor":
                    role = ERole.ROLE_DOCTOR;
                    break;
                default:
                    role = ERole.ROLE_PATIENT;
            }
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                encoder.encode(signUpRequest.getPassword()),
                role);

        User savedUser = userRepository.save(user);

        if (role == ERole.ROLE_PATIENT) {
            Patient p = new Patient();
            p.setUserId(savedUser.getId());
            p.setUsername(savedUser.getUsername());
            p.setName(signUpRequest.getFullName() != null ? signUpRequest.getFullName() : savedUser.getUsername());
            p.setAge(signUpRequest.getAge());
            p.setGender(signUpRequest.getGender());
            p.setContact(signUpRequest.getContact());
            patientRepository.save(p);
        } else if (role == ERole.ROLE_DOCTOR) {
            Doctor d = new Doctor();
            d.setUserId(savedUser.getId());
            d.setUsername(savedUser.getUsername());
            d.setName(signUpRequest.getFullName() != null ? signUpRequest.getFullName() : savedUser.getUsername());
            d.setSpecialization(signUpRequest.getSpecialization());
            d.setAvailability(signUpRequest.getAvailability());
            doctorRepository.save(d);
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@RequestBody java.util.Map<String, String> payload) {
        String newPassword = payload.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
             return ResponseEntity.badRequest().body(new MessageResponse("Error: Password must be at least 6 characters."));
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
                
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("Password updated successfully!"));
    }
}
