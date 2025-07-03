package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.District;
import org.example.AgentManagementBE.Repository.DistrictRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý logic liên quan đến quận/huyện
 */
@Service
public class DistrictService {
    private final DistrictRepository districtRepository;
    
    public DistrictService(DistrictRepository districtRepository) {
        this.districtRepository = districtRepository;
    }
    
    /**
     * Lấy danh sách tất cả quận/huyện
     * @return ApiResponse chứa danh sách quận/huyện
     */
    public ApiResponse<List<District>> getAllDistricts() {
        List<District> districts = districtRepository.findAll();
        if (districts.isEmpty()) {
            throw new AppException(ErrorCode.DISTRICT_NOT_FOUND, "Không có quận/huyện nào trong hệ thống");
        }
        return ApiResponse.success("Lấy danh sách quận thành công", districts);
    }

    /**
     * Thêm quận/huyện mới
     */
    @Transactional
    public ApiResponse<District> addDistrict(District district) {
        if (district == null || district.getDistrictName() == null || district.getDistrictName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        boolean exists = districtRepository.existsByDistrictName(district.getDistrictName());
        if (exists) {
            throw new AppException(ErrorCode.DISTRICT_ALREADY_EXISTS);
        }
        
        District savedDistrict = districtRepository.save(district);
        return ApiResponse.created("Thêm quận thành công!", savedDistrict);
    }

    /**
     * Lấy thông tin quận/huyện theo tên
     */
    public ApiResponse<District> getDistrictByName(String districtName) {
        if (districtName == null || districtName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        District district = districtRepository.findByDistrictName(districtName)
                .orElseThrow(() -> new AppException(ErrorCode.DISTRICT_NOT_FOUND));
        
        return ApiResponse.success("Lấy thông tin quận thành công", district);
    }

    /**
     * Cập nhật thông tin quận/huyện
     */
    @Transactional
    public ApiResponse<District> updateDistrict(String oldDistrictName, District newDistrict) {
        if (oldDistrictName == null || oldDistrictName.trim().isEmpty() ||
            newDistrict == null || newDistrict.getDistrictName() == null || newDistrict.getDistrictName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        District existingDistrict = districtRepository.findByDistrictName(oldDistrictName)
                .orElseThrow(() -> new AppException(ErrorCode.DISTRICT_NOT_FOUND));

        // Kiểm tra tên mới có bị trùng không
        if (!oldDistrictName.equalsIgnoreCase(newDistrict.getDistrictName()) &&
            districtRepository.existsByDistrictName(newDistrict.getDistrictName())) {
            throw new AppException(ErrorCode.DISTRICT_ALREADY_EXISTS);
        }

        existingDistrict.setDistrictName(newDistrict.getDistrictName());
        District updatedDistrict = districtRepository.save(existingDistrict);
        
        return ApiResponse.success("Cập nhật quận thành công", updatedDistrict);
    }

    /**
     * Xóa quận/huyện
     */
    @Transactional
    public ApiResponse<Void> deleteDistrict(String districtName) {
        if (districtName == null || districtName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        District district = districtRepository.findByDistrictName(districtName)
                .orElseThrow(() -> new AppException(ErrorCode.DISTRICT_NOT_FOUND));

        // Kiểm tra xem quận có đại lý nào không
        if (districtRepository.hasAgents(district.getDistrictId())) {
            throw new AppException(ErrorCode.DISTRICT_HAS_AGENTS);
        }

        districtRepository.delete(district);
        return ApiResponse.success("Xóa quận thành công", null);
    }
}
