package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreateProductRequest {
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;
    
    @NotBlank(message = "Tên đơn vị không được để trống")
    private String unitName;
    
    @NotNull(message = "Giá nhập không được để trống")
    @Positive(message = "Giá nhập phải lớn hơn 0")
    private Integer importPrice;

    public CreateProductRequest() {
    }

    public CreateProductRequest(String productName, String unitName, Integer importPrice) {
        this.productName = productName;
        this.unitName = unitName;
        this.importPrice = importPrice;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getUnitName() {
        return unitName;
    }

    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }

    public Integer getImportPrice() {
        return importPrice;
    }

    public void setImportPrice(Integer importPrice) {
        this.importPrice = importPrice;
    }
} 