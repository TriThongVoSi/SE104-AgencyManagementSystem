package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.ImportDetail;
import org.example.AgentManagementBE.Service.ImportDetailService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.response.ImportDetailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các request liên quan đến chi tiết nhập hàng
 */
@RestController
@RequestMapping("/api/import-details")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ImportDetailController {
    private final ImportDetailService importDetailService;

    @Autowired
    public ImportDetailController(ImportDetailService importDetailService) {
        this.importDetailService = importDetailService;
    }

    /**
     * Lấy tất cả chi tiết nhập hàng
     * @return ApiResponse chứa danh sách tất cả chi tiết nhập hàng
     */

    /**
     * Lấy tất cả chi tiết nhập hàng theo ID phiếu nhập
     * @param importReceiptId ID phiếu nhập
     * @return ApiResponse chứa danh sách chi tiết nhập hàng
     */
    @GetMapping("/by-receipt/{importReceiptId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'VIEWER')")
    public ApiResponse<?> getImportDetailsByImportReceiptId(
            @PathVariable Integer importReceiptId) {
        return importDetailService.getImportDetailsByImportReceiptId(importReceiptId);
    }

    /**
     * Lấy tất cả chi tiết nhập hàng theo ID sản phẩm
     * @param productId ID sản phẩm
     * @return ApiResponse chứa danh sách chi tiết nhập hàng
     */
    @GetMapping("/by-product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'VIEWER')")
    public ApiResponse<?> getImportDetailsByProductId(
            @PathVariable Integer productId) {
        return importDetailService.getImportDetailsByProductId(productId);
    }

    /**
     * Lấy chi tiết nhập hàng theo ID phiếu nhập và ID sản phẩm
     * @param importReceiptId ID phiếu nhập
     * @param productId ID sản phẩm
     * @return ApiResponse chứa chi tiết nhập hàng
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'VIEWER')")
    public ApiResponse<?> getImportDetailByImportReceiptIdAndProductId(
            @RequestParam Integer importReceiptId,
            @RequestParam Integer productId) {
        return importDetailService.getImportDetailByImportReceiptIdAndProductId(importReceiptId, productId);
    }

    /**
     * Tạo chi tiết nhập hàng mới
     * @param importDetail Chi tiết nhập hàng cần tạo
     * @return ApiResponse chứa chi tiết nhập hàng đã tạo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ApiResponse<?> createImportDetail(@RequestBody ImportDetail importDetail) {
        return importDetailService.createImportDetail(importDetail);
    }
}