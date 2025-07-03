package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Service.SalesReportService;
import org.example.AgentManagementBE.Service.SalesReportDetailService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.response.SalesReportResponse;
import org.example.AgentManagementBE.DTO.response.SalesReportSummaryResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller xử lý các request liên quan đến báo cáo doanh số
 */
@RestController
@RequestMapping("/api/sales-reports")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SalesReportController {
    private final SalesReportService salesReportService;
    private final SalesReportDetailService salesReportDetailService;

    @Autowired
    public SalesReportController(SalesReportService salesReportService, SalesReportDetailService salesReportDetailService) {
        this.salesReportService = salesReportService;
        this.salesReportDetailService = salesReportDetailService;
    }

    /**
     * Lấy báo cáo doanh số theo tháng và năm
     * @param month Tháng
     * @param year Năm
     * @return ApiResponse chứa thông tin báo cáo doanh số
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ApiResponse<SalesReportResponse> getByMonthAndYear(
            @RequestParam int month,
            @RequestParam int year) {
        return salesReportService.getSalesReportByMonthAndYear(month, year);
    }

    /**
     * Tạo báo cáo doanh số mới
     * @param request Thông tin tháng và năm cần tạo báo cáo
     * @return ApiResponse chứa thông tin báo cáo doanh số đã tạo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ApiResponse<SalesReportResponse> create(@RequestBody Map<String, Integer> request) {
        int month = request.get("month");
        int year = request.get("year");
        return salesReportService.createSalesReport(month, year);
    }

    /**
     * Lấy bảng tổng hợp báo cáo doanh số theo tháng và năm
     * @param month Tháng
     * @param year Năm
     * @return ApiResponse chứa bảng tổng hợp báo cáo doanh số
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ApiResponse<SalesReportSummaryResponse> getSummary(
            @RequestParam int month,
            @RequestParam int year) {
        return salesReportService.getSalesReportSummary(month, year);
    }
}