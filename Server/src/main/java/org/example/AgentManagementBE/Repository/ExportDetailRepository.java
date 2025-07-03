package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.ExportDetail;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExportDetailRepository extends JpaRepository<ExportDetail, Integer> {
    // Lấy chi tiết xuất hàng theo mã phiếu xuất
    List<ExportDetail> findByExportReceipt_ExportReceiptId(Integer exportReceiptId);

    // Lấy chi tiết xuất hàng theo mã sản phẩm
    List<ExportDetail> findByProduct_ProductId(Integer productId);

    // Lấy chi tiết xuất hàng theo mã phiếu xuất và sản phẩm
    Optional<ExportDetail> findByExportReceipt_ExportReceiptIdAndProduct_ProductId(Integer exportReceiptId, Integer productId);

    // Kiểm tra chi tiết xuất hàng đã tồn tại
    boolean existsByExportReceipt_ExportReceiptIdAndProduct_ProductId(Integer exportReceiptId, Integer productId);

    // Lấy chi tiết xuất theo đại lý
    @Query("SELECT ed FROM ExportDetail ed JOIN ed.exportReceipt er WHERE er.agent.agentId = :agentId")
    List<ExportDetail> findByAgentId(@Param("agentId") Integer agentId);
}
