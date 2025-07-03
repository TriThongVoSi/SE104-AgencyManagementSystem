package org.example.AgentManagementBE.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "SalesReport")
public class SalesReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sales_report_id")
    private Integer salesReportId;

    @Column(name = "month", nullable = false)
    private Integer month;

    @Column(name = "year", nullable = false)
    private Integer year;
    
    @Column(name = "total_revenue", nullable = false)
    private Integer totalRevenue;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "salesReport", cascade = CascadeType.ALL)
    private List<SalesReportDetail> salesReportDetails = new ArrayList<>();

    public SalesReport() {
    }

    public SalesReport(Integer month, Integer year) {
        this.month = month;
        this.year = year;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<SalesReportDetail> getSalesReportDetails() {
        return salesReportDetails;
    }

    public void setSalesReportDetails(List<SalesReportDetail> salesReportDetails) {
        this.salesReportDetails = salesReportDetails;
    }
    public Integer getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Integer totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}