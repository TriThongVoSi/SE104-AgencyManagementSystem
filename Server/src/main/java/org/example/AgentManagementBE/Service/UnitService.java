package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.example.AgentManagementBE.Model.Unit;
import org.example.AgentManagementBE.Repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý logic liên quan đến đơn vị
 */
@Service
public class UnitService {

    private final UnitRepository unitRepository;

    public UnitService(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    /**
     * Thêm đơn vị mới
     */
    @Transactional
    public ApiResponse<Unit> insertUnit(Unit unit) {
        // Validate input
        if (unit == null || unit.getUnitName() == null || unit.getUnitName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tên đơn vị không được để trống");
        }

        // Kiểm tra đơn vị đã tồn tại
        if (unitRepository.existsByUnitName(unit.getUnitName())) {
            throw new AppException(ErrorCode.UNIT_ALREADY_EXISTS);
        }

        Unit savedUnit = unitRepository.save(unit);
        return ApiResponse.created("Thêm đơn vị thành công!", savedUnit);
    }

    /**
     * Lấy danh sách tất cả đơn vị
     */
    public ApiResponse<List<Unit>> getAllUnits() {
        List<Unit> units = unitRepository.findAll();
        if (units.isEmpty()) {
            throw new AppException(ErrorCode.UNIT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách đơn vị thành công", units);
    }

    /**
     * Lấy thông tin đơn vị theo tên
     */
    public ApiResponse<Unit> getUnitByName(String unitName) {
        if (unitName == null || unitName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tên đơn vị không được để trống");
        }

        Unit unit = unitRepository.findByUnitName(unitName)
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));
        return ApiResponse.success("Lấy thông tin đơn vị thành công", unit);
    }

    /**
     * Cập nhật thông tin đơn vị
     */
    @Transactional
    public ApiResponse<Unit> updateUnit(String oldUnitName, Unit newUnit) {
        // Validate input
        if (oldUnitName == null || oldUnitName.trim().isEmpty() || 
            newUnit == null || newUnit.getUnitName() == null || newUnit.getUnitName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tên đơn vị không được để trống");
        }

        Unit existingUnit = unitRepository.findByUnitName(oldUnitName)
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));

        // Kiểm tra trùng tên đơn vị mới với đơn vị khác
        if (!oldUnitName.equalsIgnoreCase(newUnit.getUnitName()) &&
            unitRepository.existsByUnitName(newUnit.getUnitName())) {
            throw new AppException(ErrorCode.UNIT_ALREADY_EXISTS, "Tên đơn vị đã được dùng cho đơn vị khác!");
        }

        existingUnit.setUnitName(newUnit.getUnitName());
        Unit updatedUnit = unitRepository.save(existingUnit);

        return ApiResponse.success("Cập nhật đơn vị thành công", updatedUnit);
    }

    /**
     * Xóa đơn vị
     */
    @Transactional
    public ApiResponse<Void> deleteUnit(String unitName) {
        if (unitName == null || unitName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tên đơn vị không được để trống");
        }

        Unit unit = unitRepository.findByUnitName(unitName)
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));

        // Kiểm tra xem đơn vị có được sử dụng trong sản phẩm nào không
        if (unitRepository.existsByUnitId(unit.getUnitId())) {
            throw new AppException(ErrorCode.UNIT_IN_USE, "Không thể xóa đơn vị đang được sử dụng trong sản phẩm");
        }

        unitRepository.delete(unit);
        return ApiResponse.success("Xóa đơn vị thành công", null);
    }
}
