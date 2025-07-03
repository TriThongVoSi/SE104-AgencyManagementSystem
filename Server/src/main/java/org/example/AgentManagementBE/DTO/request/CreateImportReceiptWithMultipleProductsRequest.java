package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO request cho việc tạo phiếu nhập hàng với nhiều mặt hàng
 */
public class CreateImportReceiptWithMultipleProductsRequest {
    @NotNull(message = "Ngày tạo không được để trống")
    private LocalDate createDate;

    @NotEmpty(message = "Danh sách mặt hàng không được để trống")
    @Valid
    private List<ImportDetailRequest> importDetails;

    public CreateImportReceiptWithMultipleProductsRequest() {
    }

    public CreateImportReceiptWithMultipleProductsRequest(LocalDate createDate, List<ImportDetailRequest> importDetails) {
        this.createDate = createDate;
        this.importDetails = importDetails;
    }

    public LocalDate getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDate createDate) {
        this.createDate = createDate;
    }

    public List<ImportDetailRequest> getImportDetails() {
        return importDetails;
    }

    public void setImportDetails(List<ImportDetailRequest> importDetails) {
        this.importDetails = importDetails;
    }
} 