package org.example.AgentManagementBE.Controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/example")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ExampleController {
    
    // Chỉ ADMIN mới có thể truy cập
    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminOnly() {
        return "This endpoint is only accessible by ADMIN users";
    }
    
    // ADMIN hoặc WAREHOUSE_ACCOUNTANT có thể truy cập
    @GetMapping("/warehouse-admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT')")
    public String warehouseAdmin() {
        return "This endpoint is accessible by ADMIN and WAREHOUSE_ACCOUNTANT users";
    }
    
    // ADMIN hoặc DEBT_ACCOUNTANT có thể truy cập
    @GetMapping("/debt-admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEBT_ACCOUNTANT')")
    public String debtAdmin() {
        return "This endpoint is accessible by ADMIN and DEBT_ACCOUNTANT users";
    }
    
    // Tất cả user đã đăng nhập có thể truy cập
    @GetMapping("/authenticated")
    @PreAuthorize("isAuthenticated()")
    public String authenticated() {
        return "This endpoint is accessible by any authenticated user";
    }
    
    // Sử dụng SpEL (Spring Expression Language) để kiểm tra điều kiện phức tạp
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.personId")
    public String userSpecific(@PathVariable Integer userId) {
        return "This endpoint is accessible by ADMIN or the user with ID: " + userId;
    }
    
    // Kiểm tra nhiều điều kiện
    @PostMapping("/complex")
    @PreAuthorize("hasRole('ADMIN') and #request.active == true")
    public String complexCheck(@RequestBody Object request) {
        return "Complex authorization check passed";
    }
} 