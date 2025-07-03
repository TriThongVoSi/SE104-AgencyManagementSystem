package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    // Find role by name
    Optional<Role> findByRoleName(String roleName);
    
    // Check if role exists by name
    boolean existsByRoleName(String roleName);
    
    // Get role by name
    @Query("SELECT r FROM Role r WHERE r.roleName = :roleName")
    Role getRoleByName(@Param("roleName") String roleName);
    
    // Find roles by multiple names
    @Query("SELECT r FROM Role r WHERE r.roleName IN :roleNames")
    Iterable<Role> findByRoleNames(@Param("roleNames") Iterable<String> roleNames);
}
