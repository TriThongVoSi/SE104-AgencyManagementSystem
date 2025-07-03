package org.example.AgentManagementBE.Model;

import jakarta.persistence.*;
import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "SalesReportDetail")
public class SalesReportDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sales_report_detail_id")
    private Integer salesReportDetailId;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "sales_report_id", nullable = false)
    private SalesReport salesReport;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "agent", nullable = false)
    private Agent agent;

    @Column(name = "export_count")
    private Integer exportCount;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @Column(name = "paid_amount", nullable = false)
    private Integer paidAmount;

    @Column(name = "ratio", precision = 5, scale = 2)
    private Integer ratio;

    public SalesReportDetail() {
    }

    public SalesReportDetail(SalesReport salesReport, Agent agent, Integer exportCount, Integer totalAmount, Integer paidAmount, Integer ratio) {
        this.salesReport = salesReport;
        this.agent = agent;
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

    public SalesReport getSalesReport() {
        return salesReport;
    }

    public void setSalesReport(SalesReport salesReport) {
        this.salesReport = salesReport;
    }

    public Agent getAgent() {
        return agent;
    }

    public void setAgent(Agent agent) {
        this.agent = agent;
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

    public Integer getRatio() {
        return ratio;
    }

    public void setRatio(Integer ratio) {
        this.ratio = ratio;
    }
}
