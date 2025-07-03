package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DistrictRepository extends JpaRepository<District, Integer> {

    // Tìm quận theo tên
    Optional<District> findByDistrictName(String districtName);

    // Kiểm tra tên quận đã tồn tại
    boolean existsByDistrictName(String districtName);
    
    // Kiểm tra xem quận có đại lý nào không
    @Query("SELECT COUNT(a) > 0 FROM Agent a WHERE a.district.districtId = :districtId")
    boolean hasAgents(@Param("districtId") int districtId);
}
