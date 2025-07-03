package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class UpdateImportReceiptRequest {
    
    @NotNull(message = "ID phiếu nhập không được để trống")
    private Integer importReceiptId;
    
    @NotNull(message = "Số lượng nhập không được để trống")
    @Positive(message = "Số lượng nhập phải lớn hơn 0")
    private Integer quantityImport;

    public UpdateImportReceiptRequest() {
    }

    public UpdateImportReceiptRequest(Integer importReceiptId, Integer quantityImport) {
        this.importReceiptId = importReceiptId;
        this.quantityImport = quantityImport;
    }

    public Integer getImportReceiptId() {
        return importReceiptId;
    }

    public void setImportReceiptId(Integer importReceiptId) {
        this.importReceiptId = importReceiptId;
    }

    public Integer getQuantityImport() {
        return quantityImport;
    }

    public void setQuantityImport(Integer quantityImport) {
        this.quantityImport = quantityImport;
    }
} 