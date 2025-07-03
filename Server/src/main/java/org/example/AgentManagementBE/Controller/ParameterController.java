package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.Parameter;
import org.example.AgentManagementBE.Service.ParameterService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parameters")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ParameterController {
    private final ParameterService parameterService;

    public ParameterController(ParameterService parameterService) {
        this.parameterService = parameterService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Parameter>> createParameter(@RequestBody Parameter parameter) {
        return ResponseEntity.status(201).body(parameterService.addParameter(parameter));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Parameter>> updateParameter(@RequestBody Parameter parameter) {
        return ResponseEntity.ok(parameterService.updateParameter(parameter));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Parameter>> getParameter(@RequestParam String paramKey) {
        return ResponseEntity.ok(parameterService.getParameter(paramKey));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<Parameter>>> getAllParameters() {
        return ResponseEntity.ok(parameterService.getAllParameters());
    }

    @PostMapping("/apply-export-price-ratio")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> applyExportPriceRatioToAllProducts() {
        return ResponseEntity.ok(parameterService.applyExportPriceRatioToAllProducts());
    }
}
