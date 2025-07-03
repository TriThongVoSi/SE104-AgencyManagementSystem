package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.example.AgentManagementBE.Model.Person;
import org.example.AgentManagementBE.Model.PersonRole;
import org.example.AgentManagementBE.Model.PersonRoleId;
import org.example.AgentManagementBE.Model.Role;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.Repository.PersonRepository;
import org.example.AgentManagementBE.Repository.PersonRoleRepository;
import org.example.AgentManagementBE.Repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PersonRoleService {

    private final PersonRoleRepository personRoleRepository;
    private final PersonRepository personRepository;
    private final RoleRepository roleRepository;

    @Autowired
    public PersonRoleService(PersonRoleRepository personRoleRepository, 
                           PersonRepository personRepository, 
                           RoleRepository roleRepository) {
        this.personRoleRepository = personRoleRepository;
        this.personRepository = personRepository;
        this.roleRepository = roleRepository;
    }

    public ResponseEntity<ApiResponse<PersonRole>> assignRoleToPerson(Integer personId, Integer roleId) {
        if (personId == null || roleId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Check if person exists
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Check if role exists
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        // Check if assignment already exists
        if (personRoleRepository.existsByPersonIdAndRoleId(personId, roleId)) {
            throw new AppException(ErrorCode.ROLE_ALREADY_ASSIGNED);
        }

        PersonRoleId id = new PersonRoleId(personId, roleId);
        PersonRole personRole = new PersonRole(id, person, role);
        
        PersonRole savedPersonRole = personRoleRepository.save(personRole);
        return ResponseEntity.ok(ApiResponse.success("Gán vai trò thành công!", savedPersonRole));
    }

    public ResponseEntity<ApiResponse<Void>> removeRoleFromPerson(Integer personId, Integer roleId) {
        if (personId == null || roleId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        PersonRoleId id = new PersonRoleId(personId, roleId);
        
        if (!personRoleRepository.existsById(id)) {
            throw new AppException(ErrorCode.ROLE_NOT_ASSIGNED);
        }

        personRoleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa vai trò thành công!", null));
    }

    public ResponseEntity<ApiResponse<List<String>>> getRolesByPersonId(Integer personId) {
        if (personId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Check if person exists
        if (!personRepository.existsById(personId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        List<String> roleNames = personRoleRepository.findRoleNamesByPersonId(personId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách vai trò thành công!", roleNames));
    }

    public ResponseEntity<ApiResponse<List<String>>> getPersonsByRoleId(Integer roleId) {
        if (roleId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Check if role exists
        if (!roleRepository.existsById(roleId)) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        List<String> personNames = personRoleRepository.findPersonNamesByRoleId(roleId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công!", personNames));
    }

    public ResponseEntity<ApiResponse<List<PersonRole>>> getPersonRolesByPersonId(Integer personId) {
        if (personId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Check if person exists
        if (!personRepository.existsById(personId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        List<PersonRole> personRoles = personRoleRepository.findByPersonId(personId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin vai trò thành công!", personRoles));
    }

    public ResponseEntity<ApiResponse<List<PersonRole>>> getPersonRolesByRoleId(Integer roleId) {
        if (roleId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Check if role exists
        if (!roleRepository.existsById(roleId)) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        List<PersonRole> personRoles = personRoleRepository.findByRoleId(roleId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công!", personRoles));
    }

    public ResponseEntity<ApiResponse<Void>> removeAllRolesFromPerson(Integer personId) {
        if (personId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Check if person exists
        if (!personRepository.existsById(personId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        personRoleRepository.deleteByPersonId(personId);
        return ResponseEntity.ok(ApiResponse.success("Xóa tất cả vai trò thành công!", null));
    }

    public ResponseEntity<ApiResponse<Boolean>> hasRole(Integer personId, Integer roleId) {
        if (personId == null || roleId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        boolean hasRole = personRoleRepository.existsByPersonIdAndRoleId(personId, roleId);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra vai trò thành công!", hasRole));
    }

    public ResponseEntity<ApiResponse<Boolean>> hasRoleByName(Integer personId, String roleName) {
        if (personId == null || roleName == null || roleName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Role role = roleRepository.getRoleByName(roleName);
        if (role == null) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        boolean hasRole = personRoleRepository.existsByPersonIdAndRoleId(personId, role.getRoleId());
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra vai trò thành công!", hasRole));
    }
}
