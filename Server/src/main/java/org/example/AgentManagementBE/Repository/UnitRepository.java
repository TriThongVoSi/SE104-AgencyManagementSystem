package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Integer> {

    Optional<Unit> findByUnitName(String unitName);

    boolean existsByUnitName(String unitName);

    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.unit.unitId = :unitId")
    boolean existsByUnitId(@Param("unitId") Integer unitId);
} 
