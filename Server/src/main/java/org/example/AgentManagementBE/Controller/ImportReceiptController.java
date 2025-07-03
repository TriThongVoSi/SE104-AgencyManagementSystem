package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.ImportReceipt;
import org.example.AgentManagementBE.Service.ImportReceiptService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.request.CreateImportReceiptRequest;
import org.example.AgentManagementBE.DTO.request.CreateImportReceiptWithMultipleProductsRequest;
import org.example.AgentManagementBE.DTO.request.UpdateImportReceiptRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

/**
 * Controller xử lý các request liên quan đến phiếu nhập hàng
 */
@RestController
@RequestMapping("/api/import-receipts")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ImportReceiptController {
    private final ImportReceiptService importReceiptService;

    @Autowired
    public ImportReceiptController(ImportReceiptService importReceiptService) {
        this.importReceiptService = importReceiptService;
    }

    /**
     * Lấy tất cả phiếu nhập hàng
     * @return ApiResponse chứa danh sách tất cả phiếu nhập hàng
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'VIEWER')")
    public ApiResponse<?> getAll() {
        return importReceiptService.getAllImportReceipts();
    }

    /**
     * Lấy thông tin phiếu nhập hàng theo ID
     * @param id ID phiếu nhập hàng
     * @return ApiResponse chứa thông tin phiếu nhập hàng
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'VIEWER')")
    public ApiResponse<?> getById(@PathVariable int id) {
        return importReceiptService.getImportReceiptById(id);
    }

    /**
     * Lấy danh sách phiếu nhập hàng theo ngày
     * @param date Ngày nhập hàng (format: yyyy-MM-dd)
     * @return ApiResponse chứa danh sách phiếu nhập hàng
     */
    @GetMapping("/by-date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'VIEWER')")
    public ApiResponse<?> getByDate(@PathVariable String date) {
        return importReceiptService.getImportReceiptsByDate(date);
    }

    /**
     * Tạo phiếu nhập hàng mới với một mặt hàng (giữ lại cho tương thích ngược)
     * @param request DTO request chứa thông tin cần thiết
     * @return ApiResponse chứa thông tin phiếu nhập hàng đã tạo
     */
    @PostMapping("/single-product")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ApiResponse<?> createSingleProduct(@Valid @RequestBody CreateImportReceiptRequest request) {
        return importReceiptService.createImportReceiptWithDetails(request);
    }

    /**
     * Tạo phiếu nhập hàng mới với nhiều mặt hàng
     * @param request DTO request chứa thông tin cần thiết cho nhiều mặt hàng
     * @return ApiResponse chứa thông tin phiếu nhập hàng đã tạo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ApiResponse<?> createMultipleProducts(@Valid @RequestBody CreateImportReceiptWithMultipleProductsRequest request) {
        return importReceiptService.createImportReceiptWithMultipleProducts(request);
    }

    /**
     * Cập nhật tổng tiền phiếu nhập hàng
     * @param id ID phiếu nhập hàng
     * @param totalPrice Tổng tiền mới
     * @return ApiResponse chứa thông tin phiếu nhập hàng đã cập nhật
     */


    /**
     * Cập nhật thông tin phiếu nhập hàng
     * @param importReceipt Thông tin phiếu nhập hàng cần cập nhật
     * @return ApiResponse chứa thông tin phiếu nhập hàng đã cập nhật
     */
    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ApiResponse<?> update(@RequestBody ImportReceipt importReceipt) {
        return importReceiptService.updateImportReceipt(importReceipt);
    }

    /**
     * Cập nhật số lượng nhập của phiếu nhập hàng
     * @param request DTO request chứa importReceiptId và quantityImport mới
     * @return ApiResponse chứa thông tin phiếu nhập hàng đã cập nhật
     */
    @PutMapping("/quantity")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ApiResponse<?> updateQuantity(@Valid @RequestBody UpdateImportReceiptRequest request) {
        return importReceiptService.updateImportReceiptQuantity(request);
    }

    /**
     * Xóa phiếu nhập hàng theo ID
     * @param id ID phiếu nhập hàng cần xóa
     * @return ApiResponse chứa thông báo thành công
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ApiResponse<?> delete(@PathVariable int id) {
        return importReceiptService.deleteImportReceipt(id);
    }
}