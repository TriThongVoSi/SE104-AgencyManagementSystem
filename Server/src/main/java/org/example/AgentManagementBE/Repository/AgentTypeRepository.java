package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.AgentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgentTypeRepository extends JpaRepository<AgentType, Integer> {
    // Tìm loại đại lý theo tên
    Optional<AgentType> findByAgentTypeName(String agentTypeName);

    // Kiểm tra tên loại đại lý đã tồn tại
    boolean existsByAgentTypeName(String agentTypeName);

    // Tìm loại đại lý theo ID (chuẩn JPA đã có findById)
    // Không cần @Query cho findById, đã có sẵn trong JpaRepository
}
