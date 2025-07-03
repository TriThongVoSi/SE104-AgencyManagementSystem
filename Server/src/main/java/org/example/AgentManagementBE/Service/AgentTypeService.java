package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.Agent;
import org.example.AgentManagementBE.Model.AgentType;
import org.example.AgentManagementBE.Repository.AgentRepository;
import org.example.AgentManagementBE.Repository.AgentTypeRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý logic liên quan đến loại đại lý
 */
@Service
public class AgentTypeService {
    private final AgentTypeRepository agentTypeRepository;
    private final AgentRepository agentRepository;
    
    public AgentTypeService(AgentTypeRepository agentTypeRepository, AgentRepository agentRepository) {
        this.agentTypeRepository = agentTypeRepository;
        this.agentRepository = agentRepository;
    }

    /**
     * Lấy danh sách tất cả loại đại lý
     * @return ApiResponse chứa danh sách loại đại lý
     */
    public ApiResponse<Iterable<AgentType>> getAllAgentTypes() {
        Iterable<AgentType> agentTypes = agentTypeRepository.findAll();
        if (!agentTypes.iterator().hasNext()) {
            throw new AppException(ErrorCode.AGENT_TYPE_NOT_FOUND, "Không có loại đại lý nào trong hệ thống");
        }
        return ApiResponse.success("Lấy danh sách loại đại lý thành công", agentTypes);
    }

    /**
     * Thêm loại đại lý mới
     */
    @Transactional
    public ApiResponse<AgentType> addAgentType(AgentType newAgentType) {
        // Validate input
        if (newAgentType == null || newAgentType.getAgentTypeName() == null || newAgentType.getAgentTypeName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra loại đại lý đã tồn tại
        if (agentTypeRepository.existsByAgentTypeName(newAgentType.getAgentTypeName())) {
            throw new AppException(ErrorCode.AGENT_TYPE_ALREADY_EXISTS);
        }

        // Kiểm tra số tiền nợ tối đa
        if (newAgentType.getMaximumDebt() == null || newAgentType.getMaximumDebt() <= 0) {
            throw new AppException(ErrorCode.NUMBER_NEGATIVE);
        }

        AgentType savedAgentType = agentTypeRepository.save(newAgentType);
        return ApiResponse.created("Thêm loại đại lý thành công", savedAgentType);
    }

    /**
     * Cập nhật thông tin loại đại lý
     */
    @Transactional
    public ApiResponse<AgentType> updateAgentType(AgentType newAgentType) {
        // Validate input
        if (newAgentType == null || newAgentType.getAgentTypeName() == null || newAgentType.getAgentTypeName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra loại đại lý tồn tại
        AgentType existingAgentType = agentTypeRepository.findByAgentTypeName(newAgentType.getAgentTypeName())
                .orElseThrow(() -> new AppException(ErrorCode.AGENT_TYPE_NOT_FOUND));

        // Kiểm tra số tiền nợ tối đa
        if (newAgentType.getMaximumDebt() == null || newAgentType.getMaximumDebt() <= 0) {
            throw new AppException(ErrorCode.NUMBER_NEGATIVE);
        }

        // Kiểm tra các đại lý đang nợ không vượt quá giới hạn mới
        List<Agent> existingAgents = agentRepository.findByAgentTypeId(existingAgentType.getAgentTypeId());
        for (Agent agent : existingAgents) {
            if (agent.getDebtMoney() > newAgentType.getMaximumDebt()) {
                throw new AppException(ErrorCode.AGENT_DEBT_EXCEEDS_LIMIT, 
                    String.format("Không thể cập nhật vì đại lý '%s' đang nợ %d vượt quá giới hạn mới %d", 
                        agent.getAgentName(), agent.getDebtMoney(), newAgentType.getMaximumDebt()));
            }
        }

        existingAgentType.setMaximumDebt(newAgentType.getMaximumDebt());
        AgentType updatedAgentType = agentTypeRepository.save(existingAgentType);
        return ApiResponse.success("Cập nhật loại đại lý thành công", updatedAgentType);
    }

    /**
     * Lấy thông tin loại đại lý theo tên
     */
    public ApiResponse<AgentType> getAgentTypeByName(String agentTypeName) {
        if (agentTypeName == null || agentTypeName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        AgentType agentType = agentTypeRepository.findByAgentTypeName(agentTypeName)
                .orElseThrow(() -> new AppException(ErrorCode.AGENT_TYPE_NOT_FOUND));
        
        return ApiResponse.success("Lấy thông tin loại đại lý thành công", agentType);
    }

    /**
     * Xóa loại đại lý
     */
    @Transactional
    public ApiResponse<Void> deleteAgentType(String agentTypeName) {
        if (agentTypeName == null || agentTypeName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        AgentType existingAgentType = agentTypeRepository.findByAgentTypeName(agentTypeName)
                .orElseThrow(() -> new AppException(ErrorCode.AGENT_TYPE_NOT_FOUND));

        // Kiểm tra có đại lý đang sử dụng không
        List<Agent> agents = agentRepository.findByAgentTypeId(existingAgentType.getAgentTypeId());
        if (!agents.isEmpty()) {
            throw new AppException(ErrorCode.AGENT_TYPE_IN_USE);
        }

        agentTypeRepository.delete(existingAgentType);
        return ApiResponse.success("Xóa loại đại lý thành công", null);
    }
}
