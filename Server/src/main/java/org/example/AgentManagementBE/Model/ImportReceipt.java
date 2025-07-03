package org.example.AgentManagementBE.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ImportReceipt")
public class ImportReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "import_receipt_id")
    private Integer importReceiptId;

    @Column(name = "create_date", nullable = false)
    private LocalDate createDate;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @OneToMany(mappedBy = "importReceipt", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ImportDetail> importDetails = new ArrayList<>();

    public ImportReceipt() {
    }

    public ImportReceipt(LocalDate createDate) {
        this.createDate = createDate;
    }

    public Integer getImportReceiptId() {
        return importReceiptId;
    }

    public void setImportReceiptId(Integer importReceiptId) {
        this.importReceiptId = importReceiptId;
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

    public List<ImportDetail> getImportDetails() {
        return importDetails;
    }

    public void setImportDetails(List<ImportDetail> importDetails) {
        this.importDetails = importDetails;
    }
}