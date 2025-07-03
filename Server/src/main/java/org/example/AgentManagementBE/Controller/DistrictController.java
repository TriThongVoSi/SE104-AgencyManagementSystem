package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.District;
import org.example.AgentManagementBE.Service.DistrictService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/district")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DistrictController {
    private final DistrictService districtService;

    public DistrictController(DistrictService districtService) {
        this.districtService = districtService;
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<District>>> getAllDistricts() {
        return ResponseEntity.ok(districtService.getAllDistricts());
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<District>> createDistrict(@RequestBody District district) {
        return ResponseEntity.status(201).body(districtService.addDistrict(district));
    }

    @GetMapping("/get") // fix quyền
    public ResponseEntity<ApiResponse<District>> getDistrictByName(@RequestParam String districtName) {
        return ResponseEntity.ok(districtService.getDistrictByName(districtName));
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<District>> updateDistrict(
            @RequestParam String oldDistrictName,
            @RequestBody District district) {
        return ResponseEntity.ok(districtService.updateDistrict(oldDistrictName, district));
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDistrict(@RequestParam String districtName) {
        return ResponseEntity.ok(districtService.deleteDistrict(districtName));
    }
}
