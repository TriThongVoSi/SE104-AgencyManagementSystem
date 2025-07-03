package org.example.AgentManagementBE.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Agent")
public class Agent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "agent_id")
    private Integer agentId;

    @NotBlank(message = "Agent name is required")
    @Column(name = "agent_name", nullable = false)
    private String agentName;

    @ManyToOne
    @JoinColumn(name = "agent_type_id", nullable = false)
    private AgentType agentType;

    @Pattern(regexp = "^\\d{10,11}$", message = "Phone number must be 10-11 digits")
    @Column(name = "phone", length = 20)
    private String phone;

    @Email(message = "Invalid email format")
    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "address")
    private String address;

    @ManyToOne
    @JoinColumn(name = "district", nullable = false)
    private District district;

    @Column(name = "reception_date", nullable = false)
    private LocalDate receptionDate;

    @PositiveOrZero(message = "Debt money must be zero or positive")
    @Column(name = "debt_money", nullable = false)
    private Integer debtMoney;

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Person> persons = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ExportReceipt> exportReceipts = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<PaymentReceipt> paymentReceipts = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<DebtReport> debtReports = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<SalesReportDetail> salesReportDetails = new ArrayList<>();

    public Agent() {
    }

    public Agent(String agentName, AgentType agentType, String phone, String email, String address, District district, LocalDate receptionDate) {
        this.agentName = agentName;
        this.agentType = agentType;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.district = district;
        this.receptionDate = receptionDate;
    }

    public Integer getAgentId() {
        return agentId;
    }

    public void setAgentId(Integer agentId) {
        this.agentId = agentId;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public AgentType getAgentType() {
        return agentType;
    }

    public void setAgentType(AgentType agentType) {
        this.agentType = agentType;
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

    public District getDistrict() {
        return district;
    }

    public void setDistrict(District district) {
        this.district = district;
    }

    public LocalDate getReceptionDate() {
        return receptionDate;
    }

    public void setReceptionDate(LocalDate receptionDate) {
        this.receptionDate = receptionDate;
    }

    public Integer getDebtMoney() {
        return debtMoney;
    }

    public void setDebtMoney(Integer debtMoney) {
        this.debtMoney = debtMoney;
    }

    public List<Person> getPersons() {
        return persons;
    }

    public void setPersons(List<Person> persons) {
        this.persons = persons;
    }

    public List<ExportReceipt> getExportReceipts() {
        return exportReceipts;
    }

    public void setExportReceipts(List<ExportReceipt> exportReceipts) {
        this.exportReceipts = exportReceipts;
    }

    public List<PaymentReceipt> getPaymentReceipts() {
        return paymentReceipts;
    }

    public void setPaymentReceipts(List<PaymentReceipt> paymentReceipts) {
        this.paymentReceipts = paymentReceipts;
    }

    public List<DebtReport> getDebtReports() {
        return debtReports;
    }

    public void setDebtReports(List<DebtReport> debtReports) {
        this.debtReports = debtReports;
    }

    public List<SalesReportDetail> getSalesReportDetails() {
        return salesReportDetails;
    }

    public void setSalesReportDetails(List<SalesReportDetail> salesReportDetails) {
        this.salesReportDetails = salesReportDetails;
    }
}
