package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.ExportDetail;
import org.example.AgentManagementBE.Model.Product;
import org.example.AgentManagementBE.Model.ExportReceipt;
import org.example.AgentManagementBE.Service.ExportDetailService;
import org.example.AgentManagementBE.Service.ProductService;
import org.example.AgentManagementBE.Service.ExportReceiptService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller xử lý các request liên quan đến chi tiết xuất hàng
 */
@RestController
@RequestMapping("/api/export-details")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ExportDetailController {
    private final ExportDetailService exportDetailService;
    private final ProductService productService;
    private final ExportReceiptService exportReceiptService;

    @Autowired
    public ExportDetailController(ExportDetailService exportDetailService, ProductService productService, ExportReceiptService exportReceiptService) {
        this.exportDetailService = exportDetailService;
        this.productService = productService;
        this.exportReceiptService = exportReceiptService;
    }

    /**
     * Lấy tất cả chi tiết xuất hàng theo ID phiếu xuất
     * @param exportReceiptId ID phiếu xuất
     * @return ApiResponse chứa danh sách chi tiết xuất hàng
     */
    @GetMapping("/by-receipt/{exportReceiptId}")
    public ApiResponse<?> getExportDetailsByReceiptId(@PathVariable int exportReceiptId) {
        return exportDetailService.getExportDetailsByReceiptId(exportReceiptId);
    }

    /**
     * Lấy tất cả chi tiết xuất hàng theo ID sản phẩm
     * @param productId ID sản phẩm
     * @return ApiResponse chứa danh sách chi tiết xuất hàng
     */
    @GetMapping("/by-product/{productId}")
    public ApiResponse<?> getExportDetailsByProductId(@PathVariable int productId) {
        return exportDetailService.getExportDetailsByProductId(productId);
    }

    /**
     * Lấy chi tiết xuất hàng theo ID phiếu xuất và ID sản phẩm
     * @param exportReceiptId ID phiếu xuất
     * @param productId ID sản phẩm
     * @return ApiResponse chứa chi tiết xuất hàng
     */
    @GetMapping("/search")
    public ApiResponse<?> getExportDetailByReceiptAndProduct(
            @RequestParam int exportReceiptId,
            @RequestParam int productId) {
        return exportDetailService.getExportDetailByReceiptAndProduct(exportReceiptId, productId);
    }

    /**
     * Tạo chi tiết xuất hàng mới
     * @param exportDetails Danh sách chi tiết xuất hàng cần tạo
     * @return ApiResponse chứa chi tiết xuất hàng đã tạo
     */
    @PostMapping
    public ApiResponse<?> createExportDetails(@RequestBody List<ExportDetail> exportDetails) {
        return exportDetailService.createExportDetail(exportDetails.get(0));
    }
}
