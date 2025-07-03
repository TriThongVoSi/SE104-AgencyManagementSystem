package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.PaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, Integer> {
    // Lấy phiếu thu theo ID
    Optional<PaymentReceipt> findById(Integer paymentReceiptId);

    // Lấy phiếu thu theo đại lý
    @Query("SELECT pr FROM PaymentReceipt pr WHERE pr.agent.agentId = :agentId")
    List<PaymentReceipt> findByAgentId(@Param("agentId") int agentId);
    
    // Thêm method để tính tổng revenue theo tháng/năm/đại lý để tính arisen_debt
    @Query("SELECT COALESCE(SUM(pr.revenue), 0) FROM PaymentReceipt pr WHERE pr.agent.agentId = :agentId AND MONTH(pr.paymentDate) = :month AND YEAR(pr.paymentDate) = :year")
    Integer getTotalRevenueByAgentAndMonthAndYear(@Param("agentId") int agentId, @Param("month") int month, @Param("year") int year);
}