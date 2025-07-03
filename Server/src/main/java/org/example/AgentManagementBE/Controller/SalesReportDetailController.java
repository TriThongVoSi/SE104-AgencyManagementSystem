package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Service.SalesReportDetailService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.request.CreateSalesReportDetailRequest;
import org.example.AgentManagementBE.DTO.response.SalesReportDetailResponse;
import org.example.AgentManagementBE.Model.SalesReportDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller xử lý các request liên quan đến chi tiết báo cáo doanh số
 */
@RestController
@RequestMapping("/api/sales-report-details")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SalesReportDetailController {
    private final SalesReportDetailService salesReportDetailService;

    public SalesReportDetailController(SalesReportDetailService salesReportDetailService) {
        this.salesReportDetailService = salesReportDetailService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalesReportDetail>>> getAll() {
        return ResponseEntity.ok(salesReportDetailService.getAllSalesReportDetails());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesReportDetail>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(salesReportDetailService.getById(id));
    }

    @GetMapping("/by-agent/{agentId}")
    public ResponseEntity<ApiResponse<List<SalesReportDetail>>> getByAgentId(@PathVariable Integer agentId) {
        return ResponseEntity.ok(salesReportDetailService.getByAgentId(agentId));
    }

    @GetMapping("/by-report/{salesReportId}")
    public ResponseEntity<ApiResponse<List<SalesReportDetail>>> getBySalesReportId(@PathVariable Integer salesReportId) {
        return ResponseEntity.ok(salesReportDetailService.getBySalesReportId(salesReportId));
    }

    @GetMapping("/by-agent-and-report")
    public ResponseEntity<ApiResponse<SalesReportDetail>> getByAgentIdAndReportId(
            @RequestParam Integer agentId,
            @RequestParam Integer salesReportId) {
        return ResponseEntity.ok(salesReportDetailService.getByAgentIdAndSalesReportId(agentId, salesReportId));
    }

    @GetMapping("/by-month-year")
    public ResponseEntity<ApiResponse<List<SalesReportDetail>>> getByMonthAndYear(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(salesReportDetailService.getSalesReportDetail(month, year));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<SalesReportDetail>>> create(@RequestBody Map<String, Integer> request) {
        Integer month = request.get("month");
        Integer year = request.get("year");
        return ResponseEntity.status(201).body(salesReportDetailService.createSalesReportDetail(month, year));
    }

    @PostMapping("/save")
    public ResponseEntity<ApiResponse<SalesReportDetail>> save(@RequestBody SalesReportDetail detail) {
        return ResponseEntity.ok(salesReportDetailService.save(detail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteById(@PathVariable Integer id) {
        return ResponseEntity.ok(salesReportDetailService.deleteById(id));
    }

    @DeleteMapping("/by-agent-and-report")
    public ResponseEntity<ApiResponse<Void>> deleteByAgentIdAndReportId(
            @RequestParam Integer agentId,
            @RequestParam Integer salesReportId) {
        return ResponseEntity.ok(salesReportDetailService.deleteByAgentIdAndSalesReportId(agentId, salesReportId));
    }

    /**
     * Tạo chi tiết báo cáo doanh số cho một đại lý cụ thể
     * @param request DTO chứa salesReportId và agentId
     * @return ApiResponse chứa chi tiết báo cáo doanh số đã tạo
     */
    @PostMapping("/create-for-agent")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<SalesReportDetailResponse>> createForAgent(
            @RequestBody CreateSalesReportDetailRequest request) {
        return ResponseEntity.status(201).body(salesReportDetailService.createSalesReportDetailForAgent(request));
    }
}