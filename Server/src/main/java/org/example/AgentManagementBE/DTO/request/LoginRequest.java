package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String personEmail;
    
    @NotBlank(message = "Password is required")
    private String passwordHash; // Plain text password from client, will be hashed for comparison
    
    public LoginRequest() {
    }
    
    public LoginRequest(String personEmail, String passwordHash) {
        this.personEmail = personEmail;
        this.passwordHash = passwordHash;
    }
    
    public String getPersonEmail() {
        return personEmail;
    }
    
    public void setPersonEmail(String personEmail) {
        this.personEmail = personEmail;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
} 