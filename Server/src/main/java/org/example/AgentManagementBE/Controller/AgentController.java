package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.Agent;
import org.example.AgentManagementBE.Model.AgentType;
import org.example.AgentManagementBE.Service.AgentService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.request.UpdateAgentRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Controller xử lý các request liên quan đến Agent
 */
@RestController
@RequestMapping("/api/agents")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AgentController {
    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    /**
     * Lấy danh sách tất cả đại lý
     * @return ApiResponse chứa danh sách đại lý
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<Agent>>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

    /**
     * Tạo đại lý mới
     * @param agent Thông tin đại lý cần tạo
     * @return ApiResponse chứa thông tin đại lý đã tạo
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Agent>> createAgent(@Valid @RequestBody Agent agent) {
        return ResponseEntity.status(201).body(agentService.insertAgent(agent));
    }

    /**
     * Lấy thông tin đại lý theo ID
     * @param id ID của đại lý
     * @return ApiResponse chứa thông tin đại lý
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Agent>> getAgentById(@PathVariable Integer id) {
        return ResponseEntity.ok(agentService.getAgentById(id));
    }

    /**
     * Tìm đại lý theo tên
     * @param name Tên đại lý cần tìm
     * @return ApiResponse chứa danh sách đại lý tìm được
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Agent>> getAgentByName(@RequestParam String name) {
        return ResponseEntity.ok(agentService.getAgentByName(name));
    }

    /**
     * Cập nhật số tiền nợ của đại lý
     * @param id ID của đại lý
     * @param debtMoney Số tiền nợ mới (phải <= maxDebt của loại đại lý)
     * @return ApiResponse chứa thông tin cập nhật
     */
    @PutMapping("/{id}/debt")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Agent>> updateDebt(
            @PathVariable Integer id,
            @RequestParam Integer debtMoney) {
        return ResponseEntity.ok(agentService.updateDebtMoney(debtMoney, id));
    }

    @GetMapping("/{id}/debt-info")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Integer>> getAgentDebtInfo(@PathVariable Integer id) {
        return ResponseEntity.ok(agentService.getAgentDebtInfo(id));
    }

    /**
     * Cập nhật thông tin đại lý (địa chỉ, số điện thoại, email, loại đại lý, quận)
     * @param id ID của đại lý cần cập nhật
     * @param request Thông tin cập nhật
     * @return ApiResponse chứa thông tin đại lý đã cập nhật
     */
    @PutMapping(value = "/{id}/info", consumes = "application/json", produces = "application/json")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Agent>> updateAgentInfo(
            @PathVariable Integer id, 
            @Valid @RequestBody UpdateAgentRequest request) {
        return ResponseEntity.ok(agentService.updateAgentInfo(id, request));
    }

    /**
     * Cập nhật thông tin đại lý (method cũ - deprecated)
     * @param id ID của đại lý cần cập nhật
     * @param agent Thông tin đại lý cập nhật
     * @return ApiResponse chứa thông tin đại lý đã cập nhật
     */
    @Deprecated
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Agent>> updateAgent(
            @PathVariable Integer id, 
            @Valid @RequestBody Agent agent) {
        return ResponseEntity.ok(agentService.updateAgent(id, agent));
    }

    /**
     * Xóa đại lý
     * @param id ID của đại lý cần xóa
     * @return ApiResponse chứa kết quả xóa
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteAgent(@PathVariable Integer id) {
        return ResponseEntity.ok(agentService.deleteAgent(id));
    }

    /**
     * Kiểm tra ràng buộc Agent-ExportReceipt trước khi xóa
     * @param id ID của đại lý cần kiểm tra
     * @return ApiResponse chứa thông tin ràng buộc
     */
    @GetMapping("/{id}/delete-constraints")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkDeleteConstraints(@PathVariable Integer id) {
        return ResponseEntity.ok(agentService.checkAgentExportReceiptConstraints(id));
    }

    /**
     * Test endpoint để kiểm tra API hoạt động
     * @return Thông tin test
     */
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testApi() {
        Map<String, Object> testData = new HashMap<>();
        testData.put("status", "API is working");
        testData.put("timestamp", new java.util.Date());
        testData.put("endpoint", "/api/agents/test");
        return ResponseEntity.ok(ApiResponse.success("Test API thành công", testData));
    }
}