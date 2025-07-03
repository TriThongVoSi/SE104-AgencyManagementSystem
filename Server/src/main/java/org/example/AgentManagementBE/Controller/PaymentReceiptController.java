package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.PaymentReceipt;
import org.example.AgentManagementBE.Service.PaymentReceiptService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các request liên quan đến phiếu thu tiền
 */
@RestController
@RequestMapping("/api/payment-receipts")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PaymentReceiptController {
    private final PaymentReceiptService paymentReceiptService;

    public PaymentReceiptController(PaymentReceiptService paymentReceiptService) {
        this.paymentReceiptService = paymentReceiptService;
    }

    /**
     * Lấy danh sách tất cả phiếu thu tiền
     * @return ApiResponse chứa danh sách phiếu thu tiền
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<PaymentReceipt>>> getAll() {
        return ResponseEntity.ok(paymentReceiptService.getAllPaymentReceipts());
    }

    /**
     * Lấy thông tin phiếu thu tiền theo ID
     * @param id ID phiếu thu tiền
     * @return ApiResponse chứa thông tin phiếu thu tiền
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<PaymentReceipt>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentReceiptService.getPaymentReceiptById(id));
    }

    /**
     * Lấy danh sách phiếu thu tiền theo ID đại lý
     * @param agentId ID đại lý
     * @return ApiResponse chứa danh sách phiếu thu tiền
     */
    @GetMapping("/by-agent/{agentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<PaymentReceipt>>> getByAgentId(@PathVariable Integer agentId) {
        return ResponseEntity.ok(paymentReceiptService.getPaymentReceiptsByAgentId(agentId));
    }

    /**
     * Tạo phiếu thu tiền mới
     * @param paymentReceipt Thông tin phiếu thu tiền cần tạo
     * @return ApiResponse chứa thông tin phiếu thu tiền đã tạo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<PaymentReceipt>> create(@RequestBody PaymentReceipt paymentReceipt) {
        return ResponseEntity.status(201).body(paymentReceiptService.insertPaymentReceipt(paymentReceipt));
    }

    /**
     * Cập nhật phiếu thu tiền
     * @param paymentReceipt Thông tin phiếu thu tiền cần cập nhật
     * @return ApiResponse chứa thông tin phiếu thu tiền đã cập nhật
     */
    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<PaymentReceipt>> update(@RequestBody PaymentReceipt paymentReceipt) {
        return ResponseEntity.ok(paymentReceiptService.updatePaymentReceipt(paymentReceipt));
    }

    /**
     * Xóa phiếu thu tiền
     * @param id ID phiếu thu tiền cần xóa
     * @return ApiResponse chứa thông báo thành công
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentReceiptService.deletePaymentReceipt(id));
    }
}
