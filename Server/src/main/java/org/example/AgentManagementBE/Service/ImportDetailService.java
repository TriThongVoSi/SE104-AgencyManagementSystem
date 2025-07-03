package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.ImportDetail;
import org.example.AgentManagementBE.Repository.ImportDetailRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.response.ImportDetailResponse;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý logic liên quan đến chi tiết phiếu nhập hàng
 */
@Service
public class ImportDetailService {
    private final ImportDetailRepository importDetailRepository;

    @Autowired
    public ImportDetailService(ImportDetailRepository importDetailRepository) {
        this.importDetailRepository = importDetailRepository;
    }

    /**
     * Lấy tất cả chi tiết phiếu nhập hàng
     * @return ApiResponse chứa danh sách tất cả chi tiết phiếu nhập (format như database table)
     */
    public ApiResponse<List<ImportDetailResponse>> getAllImportDetails() {
        List<ImportDetail> details = importDetailRepository.findAll();
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.IMPORT_DETAIL_NOT_FOUND);
        }
        
        // Convert to ImportDetailResponse DTO để format giống database table
        List<ImportDetailResponse> responses = details.stream()
                .map(detail -> new ImportDetailResponse(
                        detail.getImportDetailId(),
                        detail.getImportReceipt().getImportReceiptId(),
                        detail.getProduct().getProductId(),
                        detail.getQuantityImport(),
                        detail.getImportPrice(),
                        detail.getIntoMoney()
                ))
                .collect(Collectors.toList());
                
        return ApiResponse.success("Lấy danh sách tất cả chi tiết phiếu nhập hàng thành công", responses);
    }

    /**
     * Lấy chi tiết phiếu nhập hàng theo ID phiếu nhập
     * @param importReceiptId ID phiếu nhập hàng
     * @return ApiResponse chứa danh sách chi tiết phiếu nhập
     */
    public ApiResponse<List<ImportDetail>> getImportDetailsByImportReceiptId(Integer importReceiptId) {
        List<ImportDetail> details = importDetailRepository.findByImportReceipt_ImportReceiptId(importReceiptId);
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.IMPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy chi tiết phiếu nhập hàng thành công", details);
    }

    /**
     * Lấy chi tiết phiếu nhập hàng theo ID sản phẩm
     * @param productId ID sản phẩm
     * @return ApiResponse chứa danh sách chi tiết phiếu nhập
     */
    public ApiResponse<List<ImportDetail>> getImportDetailsByProductId(Integer productId) {
        List<ImportDetail> details = importDetailRepository.findByProduct_ProductId(productId);
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.IMPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy chi tiết phiếu nhập hàng theo sản phẩm thành công", details);
    }

    /**
     * Lấy chi tiết phiếu nhập hàng theo ID phiếu nhập và ID sản phẩm
     * @param importReceiptId ID phiếu nhập hàng
     * @param productId ID sản phẩm
     * @return ApiResponse chứa chi tiết phiếu nhập
     */
    public ApiResponse<ImportDetail> getImportDetailByImportReceiptIdAndProductId(Integer importReceiptId, Integer productId) {
        ImportDetail detail = importDetailRepository.findByImportReceipt_ImportReceiptIdAndProduct_ProductId(importReceiptId, productId)
            .orElseThrow(() -> new AppException(ErrorCode.IMPORT_DETAIL_NOT_FOUND));
        return ApiResponse.success("Lấy chi tiết phiếu nhập hàng thành công", detail);
    }

    /**
     * Tạo chi tiết phiếu nhập hàng mới
     * @param importDetail Chi tiết phiếu nhập hàng cần tạo
     * @return ApiResponse chứa chi tiết phiếu nhập đã tạo
     */
    @Transactional
    public ApiResponse<ImportDetail> createImportDetail(ImportDetail importDetail) {
        if (importDetailRepository.existsByImportReceipt_ImportReceiptIdAndProduct_ProductId(
                importDetail.getImportReceipt().getImportReceiptId(),
                importDetail.getProduct().getProductId())) {
            throw new AppException(ErrorCode.IMPORT_DETAIL_ALREADY_EXISTS);
        }
        ImportDetail savedDetail = importDetailRepository.save(importDetail);
        return ApiResponse.created("Tạo chi tiết phiếu nhập hàng thành công", savedDetail);
    }

    /**
     * Cập nhật chi tiết phiếu nhập hàng
     * @param importDetail Chi tiết phiếu nhập hàng cần cập nhật
     * @return ApiResponse chứa chi tiết phiếu nhập đã cập nhật
     */
    @Transactional
    public ApiResponse<ImportDetail> updateImportDetail(ImportDetail importDetail) {
        ImportDetail existingDetail = importDetailRepository.findByImportReceipt_ImportReceiptIdAndProduct_ProductId(
                importDetail.getImportReceipt().getImportReceiptId(),
                importDetail.getProduct().getProductId())
            .orElseThrow(() -> new AppException(ErrorCode.IMPORT_DETAIL_NOT_FOUND));

        // Cập nhật thông tin
        existingDetail.setQuantityImport(importDetail.getQuantityImport());
        existingDetail.setImportPrice(importDetail.getImportPrice());
        // intoMoney will be calculated automatically in the setter

        ImportDetail updatedDetail = importDetailRepository.save(existingDetail);
        return ApiResponse.success("Cập nhật chi tiết phiếu nhập hàng thành công", updatedDetail);
    }

    /**
     * Xóa chi tiết phiếu nhập hàng
     * @param importReceiptId ID phiếu nhập hàng
     * @param productId ID sản phẩm
     * @return ApiResponse chứa thông báo thành công
     */
    @Transactional
    public ApiResponse<Void> deleteImportDetail(Integer importReceiptId, Integer productId) {
        ImportDetail detail = importDetailRepository.findByImportReceipt_ImportReceiptIdAndProduct_ProductId(importReceiptId, productId)
            .orElseThrow(() -> new AppException(ErrorCode.IMPORT_DETAIL_NOT_FOUND));
        
        importDetailRepository.delete(detail);
        return ApiResponse.success("Xóa chi tiết phiếu nhập hàng thành công", null);
    }
}