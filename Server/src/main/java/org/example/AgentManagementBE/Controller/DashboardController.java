package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DashboardController {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalAgents", 150);
        dashboard.put("totalProducts", 25);
        dashboard.put("totalRevenue", 15000000.0);
        dashboard.put("pendingPayments", 5);
        
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin dashboard thành công!", dashboard));
    }

    @GetMapping("/warehouse")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWarehouseDashboard() {
        Map<String, Object> warehouseData = new HashMap<>();
        warehouseData.put("totalInventory", 5000);
        warehouseData.put("lowStockProducts", 3);
        warehouseData.put("pendingImports", 2);
        warehouseData.put("pendingExports", 8);
        
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin kho thành công!", warehouseData));
    }

    @GetMapping("/finance")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFinanceDashboard() {
        Map<String, Object> financeData = new HashMap<>();
        financeData.put("totalDebt", 5000000.0);
        financeData.put("monthlyRevenue", 2500000.0);
        financeData.put("overduePayments", 3);
        financeData.put("paymentReceipts", 12);
        
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tài chính thành công!", financeData));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard() {
        Map<String, Object> adminData = new HashMap<>();
        adminData.put("totalUsers", 8);
        adminData.put("activeUsers", 6);
        adminData.put("systemHealth", "Good");
        adminData.put("lastBackup", "2024-01-15");
        
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin admin thành công!", adminData));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports() {
        Map<String, Object> reports = new HashMap<>();
        reports.put("salesReport", "sales_report_2024_01.pdf");
        reports.put("debtReport", "debt_report_2024_01.pdf");
        reports.put("inventoryReport", "inventory_report_2024_01.pdf");
        
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách báo cáo thành công!", reports));
    }

    @PostMapping("/export-report")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<String>> exportReport(@RequestParam String reportType) {
        String reportUrl = "reports/" + reportType + "_" + java.time.LocalDate.now() + ".pdf";
        return ResponseEntity.ok(ApiResponse.success("Xuất báo cáo thành công!", reportUrl));
    }
} 