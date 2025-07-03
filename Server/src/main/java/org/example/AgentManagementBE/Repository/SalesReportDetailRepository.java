package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.SalesReportDetail;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalesReportDetailRepository extends JpaRepository<SalesReportDetail, Integer> {
    // Lấy chi tiết báo cáo theo đại lý
    @Query("SELECT srd FROM SalesReportDetail srd WHERE srd.agent.agentId = :agentId")
    List<SalesReportDetail> findByAgentId(@Param("agentId") int agentId);

    // Lấy chi tiết báo cáo theo báo cáo
    @Query("SELECT srd FROM SalesReportDetail srd WHERE srd.salesReport.salesReportId = :salesReportId")
    List<SalesReportDetail> findBySalesReportId(@Param("salesReportId") int salesReportId);

    // Lấy chi tiết báo cáo theo đại lý và báo cáo
    @Query("SELECT srd FROM SalesReportDetail srd WHERE srd.agent.agentId = :agentId AND srd.salesReport.salesReportId = :salesReportId")
    Optional<SalesReportDetail> findByAgentIdAndSalesReportId(@Param("agentId") int agentId, @Param("salesReportId") int salesReportId);

    // Lấy chi tiết báo cáo theo tháng và năm
    @Query("SELECT srd FROM SalesReportDetail srd " +
           "WHERE srd.salesReport.month = :month " +
           "AND srd.salesReport.year = :year")
    List<SalesReportDetail> findByMonthAndYear(@Param("month") int month, @Param("year") int year);

    // Tạo chi tiết báo cáo cho tất cả đại lý theo tháng và năm
    @Query(value = "INSERT INTO sales_report_detail (agent_id, sales_report_id, quantity_export, total_amount, ratio) " +
           "SELECT a.agent_id, sr.sales_report_id, " +
           "COALESCE(COUNT(er.export_receipt_id), 0), " +
           "COALESCE(SUM(er.total_amount), 0), " +
           "COALESCE(SUM(er.total_amount) * 100.0 / NULLIF((SELECT SUM(total_amount) FROM export_receipt " +
           "WHERE MONTH(create_date) = :month AND YEAR(create_date) = :year), 0), 0) " +
           "FROM agent a " +
           "CROSS JOIN sales_report sr " +
           "LEFT JOIN export_receipt er ON a.agent_id = er.agent_id " +
           "AND MONTH(er.create_date) = :month AND YEAR(er.create_date) = :year " +
           "WHERE sr.month = :month AND sr.year = :year " +
           "GROUP BY a.agent_id, sr.sales_report_id " +
           "RETURNING *", nativeQuery = true)
    List<SalesReportDetail> createSalesReportDetails(@Param("month") int month, @Param("year") int year);
}
