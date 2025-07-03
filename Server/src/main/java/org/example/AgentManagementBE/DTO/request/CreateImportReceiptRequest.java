package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class CreateImportReceiptRequest {
    
    @NotNull(message = "Ngày tạo không được để trống")
    private LocalDate createDate;
    
    @NotNull(message = "ID sản phẩm không được để trống")
    private Integer productID;
    
    @NotNull(message = "ID đơn vị không được để trống")
    private Integer unitID;
    
    @NotNull(message = "Số lượng nhập không được để trống")
    @Positive(message = "Số lượng nhập phải lớn hơn 0")
    private Integer quantityImport;

    public CreateImportReceiptRequest() {
    }

    public CreateImportReceiptRequest(LocalDate createDate, Integer productID, Integer unitID, Integer quantityImport) {
        this.createDate = createDate;
        this.productID = productID;
        this.unitID = unitID;
        this.quantityImport = quantityImport;
    }

    public LocalDate getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDate createDate) {
        this.createDate = createDate;
    }

    public Integer getProductID() {
        return productID;
    }

    public void setProductID(Integer productID) {
        this.productID = productID;
    }

    public Integer getUnitID() {
        return unitID;
    }

    public void setUnitID(Integer unitID) {
        this.unitID = unitID;
    }

    public Integer getQuantityImport() {
        return quantityImport;
    }

    public void setQuantityImport(Integer quantityImport) {
        this.quantityImport = quantityImport;
    }
} 