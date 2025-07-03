package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.Role;
import org.example.AgentManagementBE.Service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")

public class RoleController {

    private final RoleService roleService;

    @Autowired
    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createRole(@RequestBody Role newRole) {
        return roleService.createRole(newRole);
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(@PathVariable Integer roleId, @RequestBody Role updatedRole) {
        return roleService.updateRole(roleId, updatedRole);
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRole(@PathVariable Integer roleId) {
        return roleService.deleteRole(roleId);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<?> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/{roleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<?> getRoleById(@PathVariable Integer roleId) {
        return roleService.getRoleById(roleId);
    }

    @GetMapping("/name/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<?> getRoleByName(@PathVariable String roleName) {
        return roleService.getRoleByName(roleName);
    }

    @GetMapping("/check-name")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> existsByRoleName(@RequestParam String roleName) {
        Boolean exists = roleService.existsByRoleName(roleName);
        return ResponseEntity.ok(exists);
    }
}
