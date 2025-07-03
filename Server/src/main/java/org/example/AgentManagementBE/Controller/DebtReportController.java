package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.DebtReport;
import org.example.AgentManagementBE.Service.DebtReportService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

/**
 * Controller xử lý các request liên quan đến báo cáo công nợ
 */
@RestController
@RequestMapping("/api/debt-reports")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DebtReportController {
    private final DebtReportService debtReportService;

    @Autowired
    public DebtReportController(DebtReportService debtReportService) {
        this.debtReportService = debtReportService;
    }

    /**
     * Lấy báo cáo công nợ theo tháng và năm
     * @param month Tháng cần lấy báo cáo (1-12)
     * @param year Năm cần lấy báo cáo
     * @param agentId ID đại lý
     * @return ApiResponse chứa báo cáo công nợ
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ApiResponse<?> getDebtReport(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam int agentId) {
        return debtReportService.getDebtReport(month, year, agentId);
    }

    /**
     * Lấy tất cả báo cáo công nợ
     * @return ApiResponse chứa danh sách tất cả báo cáo công nợ
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ApiResponse<?> getAllDebtReports() {
        return debtReportService.getAllDebtReports();
    }

    /**
     * Tạo hoặc cập nhật báo cáo công nợ
     * @param debtReport Thông tin báo cáo công nợ
     * @return ApiResponse chứa thông tin báo cáo đã tạo/cập nhật
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ApiResponse<?> createDebtReport(@RequestBody DebtReport debtReport) {
        return debtReportService.createDebtReport(debtReport);
    }

    /**
     * Cập nhật báo cáo công nợ
     * @param debtReport Thông tin báo cáo công nợ cần cập nhật
     * @return ApiResponse chứa thông tin báo cáo đã cập nhật
     */
    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ApiResponse<?> updateDebtReport(@RequestBody DebtReport debtReport) {
        return debtReportService.updateDebtReport(debtReport);
    }

    /**
     * Xóa báo cáo công nợ
     * @param month Tháng cần xóa báo cáo (1-12)
     * @param year Năm cần xóa báo cáo
     * @param agentId ID đại lý
     * @return ApiResponse chứa thông báo thành công
     */
    @DeleteMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ApiResponse<?> deleteDebtReport(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam int agentId) {
        return debtReportService.deleteDebtReport(month, year, agentId);
    }

    /**
     * Tổng hợp báo cáo công nợ theo tháng và năm
     * @param month Tháng cần tổng hợp báo cáo (1-12)
     * @param year Năm cần tổng hợp báo cáo
     * @return ApiResponse chứa danh sách báo cáo công nợ đã được tổng hợp
     */
    @PostMapping("/summarize")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ApiResponse<?> summarizeDebtReports(
            @RequestParam int month,
            @RequestParam int year) {
        return debtReportService.summarizeDebtReports(month, year);
    }

    /**
     * Cập nhật báo cáo công nợ cho đại lý theo tháng/năm
     * @param agentId ID đại lý
     * @param month Tháng cần cập nhật (1-12)
     * @param year Năm cần cập nhật
     * @return ApiResponse chứa thông báo thành công
     */
    @PostMapping("/update-agent-debt")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ApiResponse<?> updateAgentDebtReport(
            @RequestParam int agentId,
            @RequestParam int month,
            @RequestParam int year) {
        YearMonth monthYear = YearMonth.of(year, month);
        debtReportService.updateDebtReportForAgent(agentId, monthYear);
        return ApiResponse.success("Cập nhật báo cáo công nợ cho đại lý thành công", null);
    }
}