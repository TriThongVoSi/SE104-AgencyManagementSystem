package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.ExportDetail;
import org.example.AgentManagementBE.Repository.ExportDetailRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý logic liên quan đến chi tiết phiếu xuất hàng
 */
@Service
public class ExportDetailService {
    private final ExportDetailRepository exportDetailRepository;

    @Autowired
    public ExportDetailService(ExportDetailRepository exportDetailRepository) {
        this.exportDetailRepository = exportDetailRepository;
    }

    /**
     * Lấy chi tiết phiếu xuất hàng theo ID phiếu xuất
     * @param exportReceiptId ID phiếu xuất hàng
     * @return ApiResponse chứa danh sách chi tiết phiếu xuất
     */
    public ApiResponse<List<ExportDetail>> getExportDetailsByReceiptId(Integer exportReceiptId) {
        List<ExportDetail> details = exportDetailRepository.findByExportReceipt_ExportReceiptId(exportReceiptId);
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.EXPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy chi tiết phiếu xuất hàng thành công", details);
    }

    /**
     * Lấy chi tiết phiếu xuất hàng theo ID sản phẩm
     * @param productId ID sản phẩm
     * @return ApiResponse chứa danh sách chi tiết phiếu xuất
     */
    public ApiResponse<List<ExportDetail>> getExportDetailsByProductId(Integer productId) {
        List<ExportDetail> details = exportDetailRepository.findByProduct_ProductId(productId);
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.EXPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy chi tiết phiếu xuất hàng theo sản phẩm thành công", details);
    }

    /**
     * Lấy chi tiết phiếu xuất hàng theo ID phiếu xuất và ID sản phẩm
     * @param exportReceiptId ID phiếu xuất hàng
     * @param productId ID sản phẩm
     * @return ApiResponse chứa chi tiết phiếu xuất
     */
    public ApiResponse<ExportDetail> getExportDetailByReceiptAndProduct(Integer exportReceiptId, Integer productId) {
        ExportDetail detail = exportDetailRepository.findByExportReceipt_ExportReceiptIdAndProduct_ProductId(exportReceiptId, productId)
            .orElseThrow(() -> new AppException(ErrorCode.EXPORT_DETAIL_NOT_FOUND));
        return ApiResponse.success("Lấy chi tiết phiếu xuất hàng thành công", detail);
    }

    /**
     * Lấy chi tiết phiếu xuất hàng theo ID phiếu xuất và ID sản phẩm
     * @param exportReceiptId ID phiếu xuất hàng
     * @param productId ID sản phẩm
     * @return ApiResponse chứa chi tiết phiếu xuất
     */
    public ApiResponse<ExportDetail> getExportDetailByExportReceiptIdAndProductId(Integer exportReceiptId, Integer productId) {
        if (exportReceiptId == null || exportReceiptId <= 0 || productId == null || productId <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        ExportDetail detail = exportDetailRepository.findByExportReceipt_ExportReceiptIdAndProduct_ProductId(exportReceiptId, productId)
            .orElseThrow(() -> new AppException(ErrorCode.EXPORT_DETAIL_NOT_FOUND));
        return ApiResponse.success("Lấy chi tiết phiếu xuất hàng thành công", detail);
    }

    /**
     * Tạo chi tiết phiếu xuất hàng mới
     * @param exportDetail Chi tiết phiếu xuất hàng cần tạo
     * @return ApiResponse chứa chi tiết phiếu xuất đã tạo
     */
    @Transactional
    public ApiResponse<ExportDetail> createExportDetail(ExportDetail exportDetail) {
        if (exportDetailRepository.findByExportReceipt_ExportReceiptIdAndProduct_ProductId(
                exportDetail.getExportReceipt().getExportReceiptId(),
                exportDetail.getProduct().getProductId()).isPresent()) {
            throw new AppException(ErrorCode.EXPORT_DETAIL_ALREADY_EXISTS);
        }
        ExportDetail savedDetail = exportDetailRepository.save(exportDetail);
        return ApiResponse.created("Tạo chi tiết phiếu xuất hàng thành công", savedDetail);
    }

    /**
     * Cập nhật chi tiết phiếu xuất hàng
     * @param exportDetail Chi tiết phiếu xuất hàng cần cập nhật
     * @return ApiResponse chứa chi tiết phiếu xuất đã cập nhật
     */
    @Transactional
    public ApiResponse<ExportDetail> updateExportDetail(ExportDetail exportDetail) {
        ExportDetail existingDetail = exportDetailRepository.findByExportReceipt_ExportReceiptIdAndProduct_ProductId(
                exportDetail.getExportReceipt().getExportReceiptId(),
                exportDetail.getProduct().getProductId())
            .orElseThrow(() -> new AppException(ErrorCode.EXPORT_DETAIL_NOT_FOUND));

        existingDetail.setQuantityExport(exportDetail.getQuantityExport());
        existingDetail.setExportPrice(exportDetail.getExportPrice());
        // intoMoney will be calculated automatically in the setter

        ExportDetail updatedDetail = exportDetailRepository.save(existingDetail);
        return ApiResponse.success("Cập nhật chi tiết phiếu xuất hàng thành công", updatedDetail);
    }

    /**
     * Xóa chi tiết phiếu xuất hàng
     * @param exportReceiptId ID phiếu xuất hàng
     * @param productId ID sản phẩm
     * @return ApiResponse chứa thông báo thành công
     */
    @Transactional
    public ApiResponse<Void> deleteExportDetail(Integer exportReceiptId, Integer productId) {
        ExportDetail detail = exportDetailRepository.findByExportReceipt_ExportReceiptIdAndProduct_ProductId(exportReceiptId, productId)
            .orElseThrow(() -> new AppException(ErrorCode.EXPORT_DETAIL_NOT_FOUND));
        
        exportDetailRepository.delete(detail);
        return ApiResponse.success("Xóa chi tiết phiếu xuất hàng thành công", null);
    }
}