package com.medisync;

import com.medisync.entity.ERole;
import com.medisync.entity.User;
import com.medisync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize Default Admin if it doesn't exist
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole(ERole.ROLE_ADMIN);
            
            userRepository.save(admin);
            System.out.println("Default Admin created: admin / admin123");
        }
    }
}
