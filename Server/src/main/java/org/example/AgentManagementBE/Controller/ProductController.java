package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.request.CreateProductRequest;
import org.example.AgentManagementBE.DTO.request.UpdateImportPriceRequest;
import org.example.AgentManagementBE.DTO.request.UpdateInventoryQuantityRequest;
import org.example.AgentManagementBE.Model.Product;
import org.example.AgentManagementBE.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Product>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<Product>>> getAllProduct() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable int productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }

    @GetMapping("/inventory/{productName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Integer>> getInventoryQuantityByProductName(@PathVariable String productName) {
        return ResponseEntity.ok(productService.getInventoryQuantityByProductName(productName));
    }

    @GetMapping("/inventory/{productName}/{unitName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Integer>> getInventoryQuantityByProductNameAndUnit(
            @PathVariable String productName, 
            @PathVariable String unitName) {
        return ResponseEntity.ok(productService.getInventoryQuantityByProductNameAndUnit(productName, unitName));
    }

    @GetMapping("/by-name/{productName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<Product>>> getProductsByName(@PathVariable String productName) {
        return ResponseEntity.ok(productService.getProductsByName(productName));
    }

    @PutMapping("/{productId}/increase")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Product>> increaseInventory(
            @PathVariable int productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(productService.increaseInventory(productId, quantity));
    }

    @PutMapping("/{productId}/decrease")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Product>> decreaseInventory(
            @PathVariable int productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(productService.decreaseInventory(productId, quantity));
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable int productId,
            @Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(productId, request));
    }

    @PutMapping("/{productId}/import-price")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Product>> updateImportPrice(
            @PathVariable int productId,
            @Valid @RequestBody UpdateImportPriceRequest request) {
        return ResponseEntity.ok(productService.updateImportPrice(productId, request));
    }

    @PutMapping("/{productId}/inventory")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Product>> updateInventoryQuantity(
            @PathVariable int productId,
            @Valid @RequestBody UpdateInventoryQuantityRequest request) {
        return ResponseEntity.ok(productService.updateInventoryQuantity(productId, request));
    }

    @PostMapping("/refresh-export-prices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> refreshAllProductExportPrices() {
        return ResponseEntity.ok(productService.refreshAllProductExportPrices());
    }

    @GetMapping("/export-price-ratio")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<Double> getCurrentExportPriceRatio() {
        return ResponseEntity.ok(productService.getCurrentExportPriceRatio());
    }

    @GetMapping("/exists/{productName}/{unitName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<Boolean> checkProductExists(
            @PathVariable String productName,
            @PathVariable String unitName) {
        // Sử dụng service để kiểm tra
        try {
            productService.getInventoryQuantityByProductNameAndUnit(productName, unitName);
            return ResponseEntity.ok(true);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable int productId) {
        return ResponseEntity.ok(productService.deleteProduct(productId));
    }
}
