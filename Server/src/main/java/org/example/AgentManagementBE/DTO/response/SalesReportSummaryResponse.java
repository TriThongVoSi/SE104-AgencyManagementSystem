package org.example.AgentManagementBE.DTO.response;

import java.util.List;

/**
 * DTO response cho bảng tổng hợp báo cáo doanh số
 */
public class SalesReportSummaryResponse {
    private Integer totalRevenue; // Tổng doanh thu
    private List<AgentSalesSummary> agentSummaries; // Danh sách tổng hợp theo đại lý

    public SalesReportSummaryResponse() {
    }

    public SalesReportSummaryResponse(Integer totalRevenue, List<AgentSalesSummary> agentSummaries) {
        this.totalRevenue = totalRevenue;
        this.agentSummaries = agentSummaries;
    }

    public Integer getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Integer totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<AgentSalesSummary> getAgentSummaries() {
        return agentSummaries;
    }

    public void setAgentSummaries(List<AgentSalesSummary> agentSummaries) {
        this.agentSummaries = agentSummaries;
    }

    /**
     * DTO cho thông tin tổng hợp của từng đại lý
     */
    public static class AgentSalesSummary {
        private Integer stt; // Số thứ tự
        private Integer agentId; // ID đại lý
        private String agentName; // Tên đại lý
        private Integer exportCount; // Số phiếu xuất
        private Integer totalAmount; // Tổng trị giá
        private Double ratio; // Tỷ lệ (%)

        public AgentSalesSummary() {
        }

        public AgentSalesSummary(Integer stt, Integer agentId, String agentName, 
                               Integer exportCount, Integer totalAmount, Double ratio) {
            this.stt = stt;
            this.agentId = agentId;
            this.agentName = agentName;
            this.exportCount = exportCount;
            this.totalAmount = totalAmount;
            this.ratio = ratio;
        }

        public Integer getStt() {
            return stt;
        }

        public void setStt(Integer stt) {
            this.stt = stt;
        }

        public Integer getAgentId() {
            return agentId;
        }

        public void setAgentId(Integer agentId) {
            this.agentId = agentId;
        }

        public String getAgentName() {
            return agentName;
        }

        public void setAgentName(String agentName) {
            this.agentName = agentName;
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

        public Double getRatio() {
            return ratio;
        }

        public void setRatio(Double ratio) {
            this.ratio = ratio;
        }
    }
} 