package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Integer> {
    // Find agent by ID with optional return
    Optional<Agent> findById(Integer agentId);
    
    // Find agent by name
    Optional<Agent> findByAgentName(String agentName);
    
    // Find agent by address
    Optional<Agent> findByAddress(String address);
    
    // Find agents by agent type ID
    @Query("SELECT a FROM Agent a LEFT JOIN FETCH a.agentType LEFT JOIN FETCH a.district WHERE a.agentType.agentTypeId = :agentTypeId")
    List<Agent> findByAgentTypeId(@Param("agentTypeId") int agentTypeId);
    
    // Get all agents with their type and district information
    @Query("SELECT DISTINCT a FROM Agent a LEFT JOIN FETCH a.agentType LEFT JOIN FETCH a.district")
    List<Agent> findAllWithDetails();
    
    // Count agents by district
    @Query("SELECT COUNT(a) FROM Agent a WHERE a.district.districtId = :districtId")
    int countByDistrictId(@Param("districtId") int districtId);
    
    // Get agent debt information
    @Query("SELECT a FROM Agent a WHERE a.agentId = :agentId")
    Optional<Agent> findAgentWithDebt(@Param("agentId") int agentId);
    
    // Check if agent exists by name
    boolean existsByAgentName(String agentName);
}
