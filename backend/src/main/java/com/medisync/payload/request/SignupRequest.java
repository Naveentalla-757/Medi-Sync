package com.medisync.payload.request;

import lombok.Data;
import java.util.Set;

@Data
public class SignupRequest {
    private String username;
    private String password;
    private String role;
    private String fullName;
    private Integer age;
    private String gender;
    private String contact;
    private String specialization;
    private String availability;
}
