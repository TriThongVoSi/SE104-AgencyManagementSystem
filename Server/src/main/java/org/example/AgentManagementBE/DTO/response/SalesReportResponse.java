package org.example.AgentManagementBE.DTO.response;

public class SalesReportResponse {
    private Integer salesReportId;
    private Integer month;
    private Integer year;
    private Integer totalRevenue;

    public SalesReportResponse() {
    }

    public SalesReportResponse(Integer salesReportId, Integer month, Integer year, Integer totalRevenue) {
        this.salesReportId = salesReportId;
        this.month = month;
        this.year = year;
        this.totalRevenue = totalRevenue;
    }

    public Integer getSalesReportId() {
        return salesReportId;
    }

    public void setSalesReportId(Integer salesReportId) {
        this.salesReportId = salesReportId;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Integer totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
} 