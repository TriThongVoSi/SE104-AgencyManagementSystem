package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO request cho việc tạo phiếu xuất hàng với nhiều mặt hàng
 */
public class CreateExportReceiptWithMultipleProductsRequest {
    @NotNull(message = "Ngày tạo không được để trống")
    private LocalDate createDate;

    @NotNull(message = "ID đại lý không được để trống")
    private Integer agentId;

    @NotNull(message = "Số tiền đã trả không được để trống")
    @PositiveOrZero(message = "Số tiền đã trả phải lớn hơn hoặc bằng 0")
    private Integer paidAmount;

    @NotEmpty(message = "Danh sách mặt hàng không được để trống")
    @Valid
    private List<ExportDetailRequest> exportDetails;

    public CreateExportReceiptWithMultipleProductsRequest() {
    }

    public CreateExportReceiptWithMultipleProductsRequest(LocalDate createDate, Integer agentId, Integer paidAmount, List<ExportDetailRequest> exportDetails) {
        this.createDate = createDate;
        this.agentId = agentId;
        this.paidAmount = paidAmount;
        this.exportDetails = exportDetails;
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

    public Integer getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Integer paidAmount) {
        this.paidAmount = paidAmount;
    }

    public List<ExportDetailRequest> getExportDetails() {
        return exportDetails;
    }

    public void setExportDetails(List<ExportDetailRequest> exportDetails) {
        this.exportDetails = exportDetails;
    }
} 