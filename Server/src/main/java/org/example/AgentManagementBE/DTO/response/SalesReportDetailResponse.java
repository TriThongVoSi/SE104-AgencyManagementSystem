package org.example.AgentManagementBE.DTO.response;

public class SalesReportDetailResponse {
    private Integer salesReportDetailId;
    private Integer salesReportId;
    private Integer agentId;
    private Integer exportCount;
    private Integer totalAmount;
    private Integer paidAmount;
    private Double ratio;

    public SalesReportDetailResponse() {
    }

    public SalesReportDetailResponse(Integer salesReportDetailId, Integer salesReportId, Integer agentId, 
                                   Integer exportCount, Integer totalAmount, Integer paidAmount, Double ratio) {
        this.salesReportDetailId = salesReportDetailId;
        this.salesReportId = salesReportId;
        this.agentId = agentId;
        this.exportCount = exportCount;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.ratio = ratio;
    }

    public Integer getSalesReportDetailId() {
        return salesReportDetailId;
    }

    public void setSalesReportDetailId(Integer salesReportDetailId) {
        this.salesReportDetailId = salesReportDetailId;
    }

    public Integer getSalesReportId() {
        return salesReportId;
    }

    public void setSalesReportId(Integer salesReportId) {
        this.salesReportId = salesReportId;
    }

    public Integer getAgentId() {
        return agentId;
    }

    public void setAgentId(Integer agentId) {
        this.agentId = agentId;
    }

    public Integer getExportCount() {
        return exportCount;
    }

    public void setExportCount(Integer exportCount) {
        this.exportCount = exportCount;
    }

    public Integer getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Integer totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Integer paidAmount) {
        this.paidAmount = paidAmount;
    }

    public Double getRatio() {
        return ratio;
    }

    public void setRatio(Double ratio) {
        this.ratio = ratio;
    }
} 