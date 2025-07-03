package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class CreateExportReceiptRequest {
    
    @NotNull(message = "Ngày tạo không được để trống")
    private LocalDate createDate;
    
    @NotNull(message = "ID đại lý không được để trống")
    private Integer agentId;
    
    @NotNull(message = "ID sản phẩm không được để trống")
    private Integer productID;
    
    @NotNull(message = "ID đơn vị không được để trống")
    private Integer unitID;
    
    @NotNull(message = "Số lượng xuất không được để trống")
    @Positive(message = "Số lượng xuất phải lớn hơn 0")
    private Integer quantityExport;
    
    @NotNull(message = "Số tiền đã trả không được để trống")
    @PositiveOrZero(message = "Số tiền đã trả phải lớn hơn hoặc bằng 0")
    private Integer paidAmount;

    public CreateExportReceiptRequest() {
    }

    public CreateExportReceiptRequest(LocalDate createDate, Integer agentId, Integer productID, Integer unitID, Integer quantityExport, Integer paidAmount) {
        this.createDate = createDate;
        this.agentId = agentId;
        this.productID = productID;
        this.unitID = unitID;
        this.quantityExport = quantityExport;
        this.paidAmount = paidAmount;
    }

    public LocalDate getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDate createDate) {
        this.createDate = createDate;
    }

    public Integer getAgentId() {
        return agentId;
    }

    public void setAgentId(Integer agentId) {
        this.agentId = agentId;
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

    public Integer getQuantityExport() {
        return quantityExport;
    }

    public void setQuantityExport(Integer quantityExport) {
        this.quantityExport = quantityExport;
    }

    public Integer getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Integer paidAmount) {
        this.paidAmount = paidAmount;
    }
} 