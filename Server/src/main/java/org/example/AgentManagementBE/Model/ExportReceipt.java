package org.example.AgentManagementBE.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ExportReceipt")
public class ExportReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "export_receipt_id")
    private Integer exportReceiptId;

    @ManyToOne
    @JoinColumn(name = "agent", nullable = false)
    private Agent agent;

    @Column(name = "create_date", nullable = false)
    private LocalDate createDate;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @Column(name = "paid_amount", nullable = false)
    private Integer paidAmount;

    @Column(name = "remaining_amount", nullable = false)
    private Integer remainingAmount;

    @OneToMany(mappedBy = "exportReceipt", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ExportDetail> exportDetails = new ArrayList<>();

    public ExportReceipt() {
    }

    public ExportReceipt(Agent agent, LocalDate createDate) {
        this.agent = agent;
        this.createDate = createDate;
    }

    public Integer getExportReceiptId() {
        return exportReceiptId;
    }

    public void setExportReceiptId(Integer exportReceiptId) {
        this.exportReceiptId = exportReceiptId;
    }

    public Agent getAgent() {
        return agent;
    }

    public void setAgent(Agent agent) {
        this.agent = agent;
    }

    public LocalDate getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDate createDate) {
        this.createDate = createDate;
    }

    public Integer getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Integer totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Integer paidAmount) {
        this.paidAmount = paidAmount;
    }

    public Integer getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(Integer remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public List<ExportDetail> getExportDetails() {
        return exportDetails;
    }

    public void setExportDetails(List<ExportDetail> exportDetails) {
        this.exportDetails = exportDetails;
    }
}
