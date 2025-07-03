package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreateSalesReportDetailRequest {
    
    @NotNull(message = "ID báo cáo doanh số không được để trống")
    @Positive(message = "ID báo cáo doanh số phải lớn hơn 0")
    private Integer salesReportId;
    
    @NotNull(message = "ID đại lý không được để trống")
    @Positive(message = "ID đại lý phải lớn hơn 0")
    private Integer agentId;

    public CreateSalesReportDetailRequest() {
    }

    public CreateSalesReportDetailRequest(Integer salesReportId, Integer agentId) {
        this.salesReportId = salesReportId;
        this.agentId = agentId;
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
} 