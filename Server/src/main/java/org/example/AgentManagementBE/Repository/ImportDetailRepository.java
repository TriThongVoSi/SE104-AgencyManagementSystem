package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.ImportDetail;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface cho ImportDetail entity
 */
@Repository
public interface ImportDetailRepository extends JpaRepository<ImportDetail, Integer> {
    
    /**
     * Tìm tất cả chi tiết nhập hàng theo ID phiếu nhập
     * @param importReceiptId ID phiếu nhập
     * @return Danh sách chi tiết nhập hàng
     */
    List<ImportDetail> findByImportReceipt_ImportReceiptId(Integer importReceiptId);

    /**
     * Tìm tất cả chi tiết nhập hàng theo ID sản phẩm
     * @param productId ID sản phẩm
     * @return Danh sách chi tiết nhập hàng
     */
    List<ImportDetail> findByProduct_ProductId(Integer productId);

    /**
     * Tìm chi tiết nhập hàng theo ID phiếu nhập và ID sản phẩm
     * @param importReceiptId ID phiếu nhập
     * @param productId ID sản phẩm
     * @return Optional chứa chi tiết nhập hàng nếu tìm thấy
     */
    Optional<ImportDetail> findByImportReceipt_ImportReceiptIdAndProduct_ProductId(Integer importReceiptId, Integer productId);

    /**
     * Kiểm tra xem chi tiết nhập hàng đã tồn tại chưa
     * @param importReceiptId ID phiếu nhập
     * @param productId ID sản phẩm
     * @return true nếu đã tồn tại, false nếu chưa
     */
    boolean existsByImportReceipt_ImportReceiptIdAndProduct_ProductId(Integer importReceiptId, Integer productId);
}
