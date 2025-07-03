package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.Parameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParameterRepository extends JpaRepository<Parameter, String> {
    // Lấy tất cả tham số
    List<Parameter> findAll();

    // Lấy tham số theo key
    Parameter findByParamKey(String paramKey);
    
    // Lấy tham số theo key (trả về null nếu không tìm thấy)
    @Query("SELECT p FROM Parameter p WHERE p.paramKey = :paramKey")
    Parameter getParameterByName(@Param("paramKey") String paramKey);
    
    // Kiểm tra tham số đã tồn tại theo key
    boolean existsByParamKey(String paramKey);
}
