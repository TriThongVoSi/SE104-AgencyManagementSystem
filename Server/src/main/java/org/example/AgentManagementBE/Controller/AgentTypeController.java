package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.AgentType;
import org.example.AgentManagementBE.Service.AgentTypeService;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/agent-type")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AgentTypeController {
    private final AgentTypeService agentTypeService;
    
    public AgentTypeController(AgentTypeService agentTypeService) {
        this.agentTypeService = agentTypeService;
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Iterable<AgentType>>> getAllAgentTypes() {
        return ResponseEntity.ok(agentTypeService.getAllAgentTypes());
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AgentType>> createAgentType(@Valid @RequestBody AgentType newAgentType) {
        return ResponseEntity.ok(agentTypeService.addAgentType(newAgentType));
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AgentType>> updateAgentType(@Valid @RequestBody AgentType newAgentType) {
        return ResponseEntity.ok(agentTypeService.updateAgentType(newAgentType));
    }

    @GetMapping("/get")
    public ResponseEntity<ApiResponse<AgentType>> getAgentTypeByName(@RequestParam String agentTypeName) {
        return ResponseEntity.ok(agentTypeService.getAgentTypeByName(agentTypeName));
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAgentType(@RequestParam String agentTypeName) {
        return ResponseEntity.ok(agentTypeService.deleteAgentType(agentTypeName));
    }
}