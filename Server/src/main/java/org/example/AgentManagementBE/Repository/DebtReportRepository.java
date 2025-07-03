package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.DebtReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DebtReportRepository extends JpaRepository<DebtReport, Long> {
    // Lấy báo cáo công nợ theo tháng và năm
    @Query("SELECT dr FROM DebtReport dr WHERE dr.month = :month AND dr.year = :year")
    List<DebtReport> findByMonthAndYear(@Param("month") int month, @Param("year") int year);

    // Lấy báo cáo công nợ theo tháng, năm và đại lý
    @Query("SELECT dr FROM DebtReport dr WHERE dr.month = :month AND dr.year = :year AND dr.agent.agentId = :agentId")
    Optional<DebtReport> findByMonthYearAndAgent(@Param("month") int month, @Param("year") int year, @Param("agentId") int agentId);

    // Lấy tất cả báo cáo công nợ của một đại lý
    @Query("SELECT dr FROM DebtReport dr WHERE dr.agent.agentId = :agentId")
    List<DebtReport> findByAgentId(@Param("agentId") int agentId);
    
    // Kiểm tra báo cáo công nợ đã tồn tại
    @Query("SELECT COUNT(dr) > 0 FROM DebtReport dr WHERE dr.month = :month AND dr.year = :year AND dr.agent.agentId = :agentId")
    boolean existsByMonthYearAndAgent(@Param("month") int month, @Param("year") int year, @Param("agentId") int agentId);
    
    // Lấy báo cáo công nợ tháng trước để tính first_debt cho tháng mới
    @Query("SELECT dr FROM DebtReport dr WHERE dr.agent.agentId = :agentId " +
           "AND ((dr.month = :previousMonth AND dr.year = :year) OR " +
           "(dr.month = 12 AND dr.year = :previousYear AND :previousMonth = 0)) " +
           "ORDER BY dr.year DESC, dr.month DESC")
    Optional<DebtReport> findPreviousMonthReport(@Param("agentId") int agentId, 
                                               @Param("previousMonth") int previousMonth, 
                                               @Param("year") int year, 
                                               @Param("previousYear") int previousYear);
}