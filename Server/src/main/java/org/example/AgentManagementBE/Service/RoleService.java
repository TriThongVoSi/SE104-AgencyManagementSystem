package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.example.AgentManagementBE.Model.Role;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.Repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    @Autowired
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public ResponseEntity<ApiResponse<Role>> createRole(Role newRole) {
        if (newRole == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        if (newRole.getRoleName() == null || newRole.getRoleName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        if (roleRepository.existsByRoleName(newRole.getRoleName())) {
            throw new AppException(ErrorCode.ROLE_ALREADY_EXISTS);
        }

        Role savedRole = roleRepository.save(newRole);
        return ResponseEntity.ok(ApiResponse.success("Tạo vai trò thành công!", savedRole));
    }

    public ResponseEntity<ApiResponse<Role>> updateRole(Integer roleId, Role updatedRole) {
        if (roleId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        Role existingRole = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        if (updatedRole.getRoleName() != null && !updatedRole.getRoleName().equals(existingRole.getRoleName())) {
            if (roleRepository.existsByRoleName(updatedRole.getRoleName())) {
                throw new AppException(ErrorCode.ROLE_ALREADY_EXISTS);
            }
            existingRole.setRoleName(updatedRole.getRoleName());
        }
        
        Role savedRole = roleRepository.save(existingRole);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vai trò thành công!", savedRole));
    }

    public ResponseEntity<ApiResponse<Void>> deleteRole(Integer roleId) {
        if (roleId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        roleRepository.delete(role);
        return ResponseEntity.ok(ApiResponse.success("Xóa vai trò thành công!", null));
    }

    public ResponseEntity<ApiResponse<List<Role>>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách vai trò thành công!", roles));
    }

    public ResponseEntity<ApiResponse<Role>> getRoleById(Integer roleId) {
        if (roleId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin vai trò thành công!", role));
    }

    public ResponseEntity<ApiResponse<Role>> getRoleByName(String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        Role role = roleRepository.getRoleByName(roleName);
        if (role == null) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin vai trò thành công!", role));
    }

    public Boolean existsByRoleName(String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        return roleRepository.existsByRoleName(roleName);
    }
}
