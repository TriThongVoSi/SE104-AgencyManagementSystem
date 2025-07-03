package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.ExportReceipt;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExportReceiptRepository extends JpaRepository<ExportReceipt, Integer> {

    Optional<ExportReceipt> findById(Integer exportReceiptId);

    @Query("SELECT er FROM ExportReceipt er WHERE er.createDate = :createDate")
    List<ExportReceipt> findByCreateDate(@Param("createDate") LocalDate createDate);

    @Query(value = "SELECT * FROM EXPORT_RECEIPT er WHERE MONTH(CREATE_DATE) = :month AND YEAR(CREATE_DATE) = :year", nativeQuery = true)
    List<ExportReceipt> findByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COUNT(er) FROM ExportReceipt er WHERE MONTH(er.createDate) = :month AND YEAR(er.createDate) = :year")
    long countByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COUNT(er) FROM ExportReceipt er WHERE er.agent.agentId = :agentId AND MONTH(er.createDate) = :month AND YEAR(er.createDate) = :year")
    long countByAgentAndMonthAndYear(@Param("agentId") int agentId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(er.totalAmount), 0) FROM ExportReceipt er WHERE er.agent.agentId = :agentId AND MONTH(er.createDate) = :month AND YEAR(er.createDate) = :year")
    Integer getTotalMoneyByAgentAndMonthAndYear(@Param("agentId") int agentId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(er.totalAmount), 0) FROM ExportReceipt er WHERE MONTH(er.createDate) = :month AND YEAR(er.createDate) = :year")
    Integer getTotalMoneyByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT er FROM ExportReceipt er WHERE er.agent.agentId = :agentId")
    List<ExportReceipt> findByAgentId(@Param("agentId") int agentId);

    @Query("SELECT COALESCE(SUM(er.remainingAmount), 0) FROM ExportReceipt er WHERE er.agent.agentId = :agentId AND MONTH(er.createDate) = :month AND YEAR(er.createDate) = :year")
    Integer getTotalRemainAmountByAgentAndMonthAndYear(@Param("agentId") int agentId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(ed.quantityExport * ed.exportPrice), 0) FROM ExportDetail ed WHERE ed.exportReceipt.exportReceiptId = :exportReceiptId")
    Double calculateTotalMoney(@Param("exportReceiptId") Integer exportReceiptId);

    @Query("SELECT COALESCE(SUM(ed.quantityExport), 0) FROM ExportDetail ed " +
           "JOIN ed.exportReceipt er " +
           "WHERE MONTH(er.createDate) = :month AND YEAR(er.createDate) = :year")
    Integer getQuantityExportByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(er.paidAmount), 0) FROM ExportReceipt er WHERE er.agent.agentId = :agentId AND MONTH(er.createDate) = :month AND YEAR(er.createDate) = :year")
    Integer getTotalPaidAmountByAgentAndMonthAndYear(@Param("agentId") int agentId, @Param("month") int month, @Param("year") int year);

}

