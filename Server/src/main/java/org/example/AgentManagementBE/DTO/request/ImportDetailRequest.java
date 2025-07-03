package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO request cho từng mặt hàng trong phiếu nhập
 */
public class ImportDetailRequest {
    @NotNull(message = "Product ID không được để trống")
    private Integer productID;

    @NotNull(message = "Số lượng nhập không được để trống")
    @Positive(message = "Số lượng nhập phải lớn hơn 0")
    private Integer quantityImport;

    public ImportDetailRequest() {
    }

    public ImportDetailRequest(Integer productID, Integer quantityImport) {
        this.productID = productID;
        this.quantityImport = quantityImport;
    }

    public Integer getProductID() {
        return productID;
    }

    public void setProductID(Integer productID) {
        this.productID = productID;
    }

    public Integer getQuantityImport() {
        return quantityImport;
    }

    public void setQuantityImport(Integer quantityImport) {
        this.quantityImport = quantityImport;
    }
} 