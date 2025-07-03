package org.example.AgentManagementBE.DTO.response;

import java.util.List;

public class JwtResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private Integer personId;
    private String personName;
    private String fullName;
    private String email;
    private List<String> roles;
    
    public JwtResponse() {
    }
    
    public JwtResponse(String token, String refreshToken, Integer personId, String personName, 
                      String fullName, String email, List<String> roles) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.personId = personId;
        this.personName = personName;
        this.fullName = fullName;
        this.email = email;
        this.roles = roles;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public Integer getPersonId() {
        return personId;
    }
    
    public void setPersonId(Integer personId) {
        this.personId = personId;
    }
    
    public String getPersonName() {
        return personName;
    }
    
    public void setPersonName(String personName) {
        this.personName = personName;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public List<String> getRoles() {
        return roles;
    }
    
    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
} 