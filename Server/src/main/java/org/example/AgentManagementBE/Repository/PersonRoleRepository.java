package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.PersonRole;
import org.example.AgentManagementBE.Model.PersonRoleId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonRoleRepository extends JpaRepository<PersonRole, PersonRoleId> {
    // Find all roles for a specific person
    @Query("SELECT pr FROM PersonRole pr WHERE pr.personId = :personId")
    List<PersonRole> findByPersonId(@Param("personId") Integer personId);
    
    // Find all persons for a specific role
    @Query("SELECT pr FROM PersonRole pr WHERE pr.roleId = :roleId")
    List<PersonRole> findByRoleId(@Param("roleId") Integer roleId);
    
    // Check if a person has a specific role
    @Query("SELECT COUNT(pr) > 0 FROM PersonRole pr WHERE pr.personId = :personId AND pr.roleId = :roleId")
    boolean existsByPersonIdAndRoleId(@Param("personId") Integer personId, @Param("roleId") Integer roleId);
    
    // Delete all roles for a specific person
    @Modifying
    @Query("DELETE FROM PersonRole pr WHERE pr.personId = :personId")
    void deleteByPersonId(@Param("personId") Integer personId);
    
    // Get role names for a specific person
    @Query("SELECT r.roleName FROM PersonRole pr JOIN Role r ON pr.roleId = r.roleId WHERE pr.personId = :personId")
    List<String> findRoleNamesByPersonId(@Param("personId") Integer personId);
    
    // Get person names for a specific role
    @Query("SELECT p.personName FROM PersonRole pr JOIN Person p ON pr.personId = p.personId WHERE pr.roleId = :roleId")
    List<String> findPersonNamesByRoleId(@Param("roleId") Integer roleId);
}
