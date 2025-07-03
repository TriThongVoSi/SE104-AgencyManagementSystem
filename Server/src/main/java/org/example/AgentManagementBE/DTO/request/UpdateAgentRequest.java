package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public class UpdateAgentRequest {
    
    @Pattern(regexp = "^\\d{10,11}$", message = "Số điện thoại phải có 10-11 chữ số")
    private String phone;

    @Email(message = "Email không đúng định dạng")
    private String email;

    private String address;

    private String agentTypeName;

    private String districtName;

    public UpdateAgentRequest() {
    }

    public UpdateAgentRequest(String phone, String email, String address, String agentTypeName, String districtName) {
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.agentTypeName = agentTypeName;
        this.districtName = districtName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAgentTypeName() {
        return agentTypeName;
    }

    public void setAgentTypeName(String agentTypeName) {
        this.agentTypeName = agentTypeName;
    }

    public String getDistrictName() {
        return districtName;
    }

    public void setDistrictName(String districtName) {
        this.districtName = districtName;
    }

    @Override
    public String toString() {
        return "UpdateAgentRequest{" +
                "phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", address='" + address + '\'' +
                ", agentTypeName='" + agentTypeName + '\'' +
                ", districtName='" + districtName + '\'' +
                '}';
    }
} 