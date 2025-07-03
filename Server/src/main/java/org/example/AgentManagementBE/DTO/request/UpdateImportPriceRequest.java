package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class UpdateImportPriceRequest {
    
    @NotNull(message = "Giá nhập là bắt buộc")
    @Positive(message = "Giá nhập phải lớn hơn 0")
    private Integer importPrice;

    public UpdateImportPriceRequest() {
    }

    public UpdateImportPriceRequest(Integer importPrice) {
        this.importPrice = importPrice;
    }

    public Integer getImportPrice() {
        return importPrice;
    }

    public void setImportPrice(Integer importPrice) {
        this.importPrice = importPrice;
    }

    @Override
    public String toString() {
        return "UpdateImportPriceRequest{" +
                "importPrice=" + importPrice +
                '}';
    }
} 