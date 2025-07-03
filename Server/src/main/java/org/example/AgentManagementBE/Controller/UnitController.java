package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.Model.Unit;
import org.example.AgentManagementBE.Service.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UnitController {

    private final UnitService unitService;

    @Autowired
    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Unit>> insertUnit(@RequestBody Unit unit) {
        return ResponseEntity.ok(unitService.insertUnit(unit));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<Unit>>> getAllUnit() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }

    @GetMapping("/{unitName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT', 'VIEWER')")
    public ResponseEntity<ApiResponse<Unit>> getUnitByName(@PathVariable String unitName) {
        return ResponseEntity.ok(unitService.getUnitByName(unitName));
    }

    @PutMapping("/{oldUnitName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Unit>> updateUnit(
            @PathVariable String oldUnitName,
            @RequestBody Unit newUnit) {
        return ResponseEntity.ok(unitService.updateUnit(oldUnitName, newUnit));
    }

    @DeleteMapping("/{unitName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUnit(@PathVariable String unitName) {
        return ResponseEntity.ok(unitService.deleteUnit(unitName));
    }
}
