package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.ExportReceipt;
import org.example.AgentManagementBE.Model.ExportDetail;
import org.example.AgentManagementBE.Model.Agent;
import org.example.AgentManagementBE.Model.Product;
import org.example.AgentManagementBE.Service.ExportReceiptService;
import org.example.AgentManagementBE.Service.ExportDetailService;
import org.example.AgentManagementBE.Service.ProductService;
import org.example.AgentManagementBE.Repository.AgentRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.request.CreateExportReceiptRequest;
import org.example.AgentManagementBE.DTO.request.CreateExportReceiptWithMultipleProductsRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.sql.Date;
import java.time.LocalDate;

/**
 * Controller xử lý các request liên quan đến phiếu xuất hàng
 */
@RestController
@RequestMapping("/api/export-receipts")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ExportReceiptController {
    private final ExportReceiptService exportReceiptService;
    private final ExportDetailService exportDetailService;
    private final ProductService productService;
    private final AgentRepository agentRepository;

    @Autowired
    public ExportReceiptController(ExportReceiptService exportReceiptService, 
                                 ExportDetailService exportDetailService,
                                 ProductService productService,
                                 AgentRepository agentRepository) {
        this.exportReceiptService = exportReceiptService;
        this.exportDetailService = exportDetailService;
        this.productService = productService;
        this.agentRepository = agentRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<ExportReceipt>>> getAll() {
        return ResponseEntity.ok(exportReceiptService.getAllExportReceipts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<ExportReceipt>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(exportReceiptService.getExportReceiptById(id));
    }

    @GetMapping("/by-date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<ExportReceipt>>> getByDate(@PathVariable LocalDate date) {
        return ResponseEntity.ok(exportReceiptService.getExportReceiptsByDate(date));
    }

    @GetMapping("/by-month-year")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<ExportReceipt>>> getByMonthAndYear(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(exportReceiptService.getExportReceiptsByMonthAndYear(month, year));
    }

    @GetMapping("/by-agent/{agentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<ExportReceipt>>> getByAgentId(@PathVariable Integer agentId) {
        return ResponseEntity.ok(exportReceiptService.getExportReceiptsByAgentId(agentId));
    }

    /**
     * Tạo phiếu xuất hàng mới với một mặt hàng (giữ lại cho tương thích ngược)
     * @param request DTO request chứa thông tin cần thiết
     * @return ApiResponse chứa thông tin phiếu xuất hàng đã tạo
     */
    @PostMapping("/single-product")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<ExportReceipt>> createSingleProduct(@Valid @RequestBody CreateExportReceiptRequest request) {
        return ResponseEntity.status(201).body(exportReceiptService.createExportReceiptWithDetails(request));
    }

    /**
     * Tạo phiếu xuất hàng mới với nhiều mặt hàng
     * @param request DTO request chứa thông tin cần thiết cho nhiều mặt hàng
     * @return ApiResponse chứa thông tin phiếu xuất hàng đã tạo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<ExportReceipt>> createMultipleProducts(@Valid @RequestBody CreateExportReceiptWithMultipleProductsRequest request) {
        return ResponseEntity.status(201).body(exportReceiptService.createExportReceiptWithMultipleProducts(request));
    }

    /**
     * Validate ràng buộc trước khi tạo phiếu xuất hàng
     * @param request DTO request chứa thông tin cần kiểm tra
     * @return ApiResponse chứa kết quả validation
     */
    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCreateExportReceipt(@Valid @RequestBody CreateExportReceiptRequest request) {
        return ResponseEntity.ok(exportReceiptService.validateCreateExportReceiptConstraints(request));
    }

    @PostMapping("/legacy")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<ExportReceipt>> createLegacy(@RequestBody ExportReceipt exportReceipt) {
        return ResponseEntity.status(201).body(exportReceiptService.createExportReceipt(exportReceipt));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<ExportReceipt>> update(@RequestBody ExportReceipt exportReceipt) {
        return ResponseEntity.ok(exportReceiptService.updateExportReceipt(exportReceipt));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(exportReceiptService.deleteExportReceipt(id));
    }

    @GetMapping("/{id}/total-amount")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Double>> calculateTotalAmount(@PathVariable Integer id) {
        return ResponseEntity.ok(exportReceiptService.calculateTotalAmount(id));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(exportReceiptService.getExportStatisticsByMonthAndYear(month, year));
    }

    @GetMapping("/statistics/agent")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatisticsByAgent(
            @RequestParam Integer agentId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(exportReceiptService.getExportStatisticsByAgentAndMonthAndYear(agentId, month, year));
    }
}
