package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO request cho từng mặt hàng trong phiếu xuất
 */
public class ExportDetailRequest {
    @NotNull(message = "Product ID không được để trống")
    private Integer productID;

    @NotNull(message = "Số lượng xuất không được để trống")
    @Positive(message = "Số lượng xuất phải lớn hơn 0")
    private Integer quantityExport;

    public ExportDetailRequest() {
    }

    public ExportDetailRequest(Integer productID, Integer quantityExport) {
        this.productID = productID;
        this.quantityExport = quantityExport;
    }

    public Integer getProductID() {
        return productID;
    }

    public void setProductID(Integer productID) {
        this.productID = productID;
    }

    public Integer getQuantityExport() {
        return quantityExport;
    }

    public void setQuantityExport(Integer quantityExport) {
        this.quantityExport = quantityExport;
    }
} 