package org.example.AgentManagementBE.DTO.response;

/**
 * Response DTO cho ImportDetail
 * Format dữ liệu giống như trong database table
 */
public class ImportDetailResponse {
    private Integer importDetailId;
    private Integer importReceiptId;
    private Integer productId;
    private Integer quantityImport;
    private Integer importPrice;
    private Integer intoMoney;

    public ImportDetailResponse() {
    }

    public ImportDetailResponse(Integer importDetailId, Integer importReceiptId, Integer productId, 
                               Integer quantityImport, Integer importPrice, Integer intoMoney) {
        this.importDetailId = importDetailId;
        this.importReceiptId = importReceiptId;
        this.productId = productId;
        this.quantityImport = quantityImport;
        this.importPrice = importPrice;
        this.intoMoney = intoMoney;
    }

    public Integer getImportDetailId() {
        return importDetailId;
    }

    public void setImportDetailId(Integer importDetailId) {
        this.importDetailId = importDetailId;
    }

    public Integer getImportReceiptId() {
        return importReceiptId;
    }

    public void setImportReceiptId(Integer importReceiptId) {
        this.importReceiptId = importReceiptId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getQuantityImport() {
        return quantityImport;
    }

    public void setQuantityImport(Integer quantityImport) {
        this.quantityImport = quantityImport;
    }

    public Integer getImportPrice() {
        return importPrice;
    }

    public void setImportPrice(Integer importPrice) {
        this.importPrice = importPrice;
    }

    public Integer getIntoMoney() {
        return intoMoney;
    }

    public void setIntoMoney(Integer intoMoney) {
        this.intoMoney = intoMoney;
    }
} 