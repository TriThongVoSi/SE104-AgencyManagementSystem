package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.*;
import org.example.AgentManagementBE.Repository.*;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.request.UpdateAgentRequest;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

/**
 * Service xử lý logic liên quan đến đại lý
 */
@Service
public class AgentService {
    private final AgentRepository agentRepository;
    private final AgentTypeRepository agentTypeRepository;
    private final DistrictRepository districtRepository;
    private final ParameterRepository parameterRepository;
    private final DebtReportRepository debtReportRepository;
    private final ExportDetailRepository exportDetailRepository;
    private final ExportReceiptRepository exportReceiptRepository;
    private final PaymentReceiptRepository paymentReceiptRepository;
    private final SalesReportDetailRepository salesReportDetailRepository;

    @Autowired
    public AgentService(AgentRepository agentRepository,
                        AgentTypeRepository agentTypeRepository,
                        DistrictRepository districtRepository,
                        ParameterRepository parameterRepository,
                        DebtReportRepository debtReportRepository,
                        ExportDetailRepository exportDetailRepository,
                        ExportReceiptRepository exportReceiptRepository,
                        PaymentReceiptRepository paymentReceiptRepository,
                        SalesReportDetailRepository salesReportDetailRepository) {
        this.agentRepository = agentRepository;
        this.agentTypeRepository = agentTypeRepository;
        this.districtRepository = districtRepository;
        this.parameterRepository = parameterRepository;
        this.debtReportRepository = debtReportRepository;
        this.exportDetailRepository = exportDetailRepository;
        this.exportReceiptRepository = exportReceiptRepository;
        this.paymentReceiptRepository = paymentReceiptRepository;
        this.salesReportDetailRepository = salesReportDetailRepository;
    }

    /**
     * Lấy danh sách tất cả đại lý
     */
    public ApiResponse<List<Agent>> getAllAgents() {
        List<Agent> agents = agentRepository.findAllWithDetails();
        if (agents.isEmpty()) {
            throw new AppException(ErrorCode.AGENT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách đại lý thành công", agents);
    }

    /**
     * Thêm đại lý mới
     */
    @Transactional
    public ApiResponse<Agent> insertAgent(Agent agent) {
        if (agent == null || agent.getAgentName() == null || agent.getAgentName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        if (agentRepository.existsByAgentName(agent.getAgentName())) {
            throw new AppException(ErrorCode.AGENT_ALREADY_EXISTS);
        }

        District existingDistrict = districtRepository.findByDistrictName(agent.getDistrict().getDistrictName())
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_DISTRICT_NOT_FOUND));
        agent.setDistrict(existingDistrict);

        AgentType existingAgentType = agentTypeRepository.findByAgentTypeName(agent.getAgentType().getAgentTypeName())
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_TYPE_NOT_FOUND));
        agent.setAgentType(existingAgentType);

        // Validation số tiền nợ
        if (agent.getDebtMoney() == null) {
            agent.setDebtMoney(0); // Mặc định là 0 nếu null
        }

        if (agent.getDebtMoney() < 0) {
            throw new AppException(ErrorCode.NUMBER_NEGATIVE, "Số tiền nợ không được âm");
        }

        // Kiểm tra số tiền nợ không vượt quá giới hạn của loại đại lý
        if (agent.getDebtMoney() > existingAgentType.getMaximumDebt()) {
            throw new AppException(ErrorCode.AGENT_DEBT_LIMIT_EXCEEDED, 
                String.format("Số tiền nợ %d vượt quá giới hạn tối đa %d của loại đại lý '%s'", 
                    agent.getDebtMoney(), existingAgentType.getMaximumDebt(), existingAgentType.getAgentTypeName()));
        }
        
        Parameter maxAgentParam = parameterRepository.findByParamKey("max_agent_per_district");
        if (maxAgentParam == null) {
            throw new AppException(ErrorCode.PARAMETER_NOT_FOUND);
        }
        
        long n = agentRepository.countByDistrictId(agent.getDistrict().getDistrictId());
        long maxAgents = Long.parseLong(maxAgentParam.getParamValue());
        if (n >= maxAgents) {
            throw new AppException(ErrorCode.AGENT_MAX_LIMIT_REACHED);
        }
        
        Agent savedAgent = agentRepository.save(agent);
        
        LocalDate receptionDate = savedAgent.getReceptionDate();
        int month = receptionDate.getMonthValue();
        int year = receptionDate.getYear();
        
        if (!debtReportRepository.existsByMonthYearAndAgent(month, year, savedAgent.getAgentId())) {
            DebtReport debtReport = new DebtReport(month, year, savedAgent);
            debtReportRepository.save(debtReport);
        }
        
        return ApiResponse.created("Thêm đại lý thành công", savedAgent);
    }

    /**
     * Lấy thông tin đại lý theo ID
     */
    public ApiResponse<Agent> getAgentById(Integer agentId) {
        if (agentId == null || agentId <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Agent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));
        return ApiResponse.success("Lấy thông tin đại lý thành công", agent);
    }

    /**
     * Lấy thông tin đại lý theo tên
     */
    public ApiResponse<Agent> getAgentByName(String agentName) {
        if (agentName == null || agentName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Agent agent = agentRepository.findByAgentName(agentName)
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));
        return ApiResponse.success("Lấy thông tin đại lý thành công", agent);
    }

    /**
     * Cập nhật số tiền nợ của đại lý
     */
    @Transactional
    public ApiResponse<Agent> updateDebtMoney(Integer debtMoney, Integer agentId) {
        if (debtMoney == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số tiền nợ không được null");
        }

        if (debtMoney < 0) {
            throw new AppException(ErrorCode.NUMBER_NEGATIVE, "Số tiền nợ không được âm");
        }

        Agent existingAgent = agentRepository.findAgentWithDebt(agentId)
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));

        AgentType agentType = agentTypeRepository.findById(existingAgent.getAgentType().getAgentTypeId())
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_TYPE_NOT_FOUND));

        // Kiểm tra số tiền nợ mới không vượt quá giới hạn
        if (debtMoney > agentType.getMaximumDebt()) {
            throw new AppException(ErrorCode.AGENT_DEBT_LIMIT_EXCEEDED, 
                String.format("Số tiền nợ %d vượt quá giới hạn tối đa %d của loại đại lý '%s'", 
                    debtMoney, agentType.getMaximumDebt(), agentType.getAgentTypeName()));
        }

        Integer oldDebtMoney = existingAgent.getDebtMoney();
        existingAgent.setDebtMoney(debtMoney);
        Agent updatedAgent = agentRepository.save(existingAgent);
        
        return ApiResponse.success(
            String.format("Cập nhật số tiền nợ thành công: %d → %d", oldDebtMoney, debtMoney), 
            updatedAgent);
    }

    /**
     * Lấy thông tin nợ của đại lý
     */
    public ApiResponse<Integer> getAgentDebtInfo(Integer agentId) {
        Agent agent = agentRepository.findAgentWithDebt(agentId)
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));
        
        Integer maxDebt = agentTypeRepository.findById(agent.getAgentType().getAgentTypeId())
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_TYPE_NOT_FOUND))
            .getMaximumDebt();
        Integer remainingDebt = maxDebt - agent.getDebtMoney();
        
        return ApiResponse.success("Lấy thông tin nợ thành công", remainingDebt);
    }

    /**
     * Cập nhật thông tin đại lý bằng UpdateAgentRequest
     */
    @Transactional
    public ApiResponse<Agent> updateAgentInfo(Integer agentId, UpdateAgentRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Dữ liệu cập nhật không được null");
        }

        Agent existingAgent = agentRepository.findById(agentId)
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));

        // Lưu thông tin cũ để log
        String oldInfo = String.format("Phone: %s, Email: %s, Address: %s, AgentType: %s, District: %s",
            existingAgent.getPhone(), existingAgent.getEmail(), existingAgent.getAddress(),
            existingAgent.getAgentType().getAgentTypeName(), existingAgent.getDistrict().getDistrictName());

        // 1. Cập nhật số điện thoại
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            existingAgent.setPhone(request.getPhone().trim());
        }

        // 2. Cập nhật email
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            existingAgent.setEmail(request.getEmail().trim());
        }

        // 3. Cập nhật địa chỉ
        if (request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
            existingAgent.setAddress(request.getAddress().trim());
        }

        // 4. Cập nhật loại đại lý (cần validate với debtMoney)
        if (request.getAgentTypeName() != null && !request.getAgentTypeName().trim().isEmpty()) {
            AgentType newAgentType = agentTypeRepository.findByAgentTypeName(request.getAgentTypeName().trim())
                .orElseThrow(() -> new AppException(ErrorCode.AGENT_TYPE_NOT_FOUND, 
                    "Không tìm thấy loại đại lý: " + request.getAgentTypeName()));
            
            // Kiểm tra debtMoney với maxDebt của AgentType mới
            if (existingAgent.getDebtMoney() > newAgentType.getMaximumDebt()) {
                throw new AppException(ErrorCode.AGENT_DEBT_LIMIT_EXCEEDED,
                    String.format("Số tiền nợ hiện tại %d vượt quá giới hạn tối đa %d của loại đại lý mới '%s'",
                        existingAgent.getDebtMoney(), newAgentType.getMaximumDebt(), newAgentType.getAgentTypeName()));
            }
            existingAgent.setAgentType(newAgentType);
        }

        // 5. Cập nhật quận (cần validate số lượng agent tối đa)
        if (request.getDistrictName() != null && !request.getDistrictName().trim().isEmpty()) {
            District newDistrict = districtRepository.findByDistrictName(request.getDistrictName().trim())
                .orElseThrow(() -> new AppException(ErrorCode.AGENT_DISTRICT_NOT_FOUND,
                    "Không tìm thấy quận: " + request.getDistrictName()));
            
            // Chỉ validate nếu thay đổi quận
            if (!existingAgent.getDistrict().getDistrictId().equals(newDistrict.getDistrictId())) {
                Parameter maxAgentParam = parameterRepository.findByParamKey("max_agent_per_district");
                if (maxAgentParam != null) {
                    long currentAgentsInNewDistrict = agentRepository.countByDistrictId(newDistrict.getDistrictId());
                    long maxAgents = Long.parseLong(maxAgentParam.getParamValue());
                    
                    if (currentAgentsInNewDistrict >= maxAgents) {
                        throw new AppException(ErrorCode.AGENT_MAX_LIMIT_REACHED,
                            String.format("Quận '%s' đã đạt tối đa %d đại lý", newDistrict.getDistrictName(), maxAgents));
                    }
                }
            }
            existingAgent.setDistrict(newDistrict);
        }

        Agent savedAgent = agentRepository.save(existingAgent);
        
        String newInfo = String.format("Phone: %s, Email: %s, Address: %s, AgentType: %s, District: %s",
            savedAgent.getPhone(), savedAgent.getEmail(), savedAgent.getAddress(),
            savedAgent.getAgentType().getAgentTypeName(), savedAgent.getDistrict().getDistrictName());

        return ApiResponse.success(
            String.format("Cập nhật thông tin đại lý thành công. Thay đổi: %s → %s", oldInfo, newInfo), 
            savedAgent);
    }

    /**
     * Cập nhật thông tin đại lý (method cũ - deprecated)
     */
    @Deprecated
    @Transactional
    public ApiResponse<Agent> updateAgent(Integer agentId, Agent updatedAgent) {
        if (updatedAgent == null || updatedAgent.getAgentName() == null || updatedAgent.getAgentName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Agent existingAgent = agentRepository.findById(agentId)
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));

        // Kiểm tra tên đại lý trùng lặp (trừ chính nó)
        if (!existingAgent.getAgentName().equals(updatedAgent.getAgentName()) &&
            agentRepository.existsByAgentName(updatedAgent.getAgentName())) {
            throw new AppException(ErrorCode.AGENT_ALREADY_EXISTS);
        }

        // Validate và set District
        if (updatedAgent.getDistrict() != null && updatedAgent.getDistrict().getDistrictName() != null) {
            District district = districtRepository.findByDistrictName(updatedAgent.getDistrict().getDistrictName())
                .orElseThrow(() -> new AppException(ErrorCode.AGENT_DISTRICT_NOT_FOUND));
            existingAgent.setDistrict(district);
        }

        // Validate và set AgentType
        if (updatedAgent.getAgentType() != null && updatedAgent.getAgentType().getAgentTypeName() != null) {
            AgentType agentType = agentTypeRepository.findByAgentTypeName(updatedAgent.getAgentType().getAgentTypeName())
                .orElseThrow(() -> new AppException(ErrorCode.AGENT_TYPE_NOT_FOUND));
            
            // Kiểm tra debtMoney với maxDebt của AgentType mới
            if (existingAgent.getDebtMoney() > agentType.getMaximumDebt()) {
                throw new AppException(ErrorCode.AGENT_DEBT_LIMIT_EXCEEDED,
                    String.format("Số tiền nợ hiện tại %d vượt quá giới hạn tối đa %d của loại đại lý mới '%s'",
                        existingAgent.getDebtMoney(), agentType.getMaximumDebt(), agentType.getAgentTypeName()));
            }
            existingAgent.setAgentType(agentType);
        }

        // Cập nhật các thông tin khác
        existingAgent.setAgentName(updatedAgent.getAgentName());
        if (updatedAgent.getPhone() != null) {
            existingAgent.setPhone(updatedAgent.getPhone());
        }
        if (updatedAgent.getEmail() != null) {
            existingAgent.setEmail(updatedAgent.getEmail());
        }
        if (updatedAgent.getAddress() != null) {
            existingAgent.setAddress(updatedAgent.getAddress());
        }
        if (updatedAgent.getReceptionDate() != null) {
            existingAgent.setReceptionDate(updatedAgent.getReceptionDate());
        }

        Agent savedAgent = agentRepository.save(existingAgent);
        return ApiResponse.success("Cập nhật thông tin đại lý thành công", savedAgent);
    }

    /**
     * Xóa đại lý
     */
    @Transactional
    public ApiResponse<Map<String, Object>> deleteAgent(Integer agentId) {
        Agent existingAgent = agentRepository.findById(agentId)
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));

        // Kiểm tra nợ tiền
        if (existingAgent.getDebtMoney() > 0) {
            throw new AppException(ErrorCode.AGENT_HAS_DEBT);
        }

        // Kiểm tra phiếu xuất hàng - Không được xóa nếu có phiếu xuất
        List<ExportReceipt> exportReceipts = exportReceiptRepository.findByAgentId(existingAgent.getAgentId());
        if (!exportReceipts.isEmpty()) {
            throw new AppException(ErrorCode.AGENT_HAS_EXPORT_RECEIPTS, 
                String.format("Không thể xóa đại lý '%s' vì còn tồn tại %d phiếu xuất hàng", 
                    existingAgent.getAgentName(), exportReceipts.size()));
        }

        // Kiểm tra export details liên quan
        List<ExportDetail> exportDetails = exportDetailRepository.findByAgentId(existingAgent.getAgentId());
        if (!exportDetails.isEmpty()) {
            throw new AppException(ErrorCode.AGENT_HAS_EXPORT_RECEIPTS, 
                String.format("Không thể xóa đại lý '%s' vì còn tồn tại %d chi tiết xuất hàng", 
                    existingAgent.getAgentName(), exportDetails.size()));
        }

        // Chỉ xóa các dữ liệu không quan trọng khi không có phiếu xuất
        List<DebtReport> debtReports = debtReportRepository.findByAgentId(existingAgent.getAgentId());
        debtReportRepository.deleteAll(debtReports);

        List<PaymentReceipt> paymentReceipts = paymentReceiptRepository.findByAgentId(existingAgent.getAgentId());
        paymentReceiptRepository.deleteAll(paymentReceipts);

        List<SalesReportDetail> salesReportDetails = salesReportDetailRepository.findByAgentId(existingAgent.getAgentId());
        salesReportDetailRepository.deleteAll(salesReportDetails);

        agentRepository.delete(existingAgent);
        
        Map<String, Object> data = new HashMap<>();
        data.put("agentId", agentId);
        data.put("agentName", existingAgent.getAgentName());
        data.put("deletedAt", new java.util.Date());
        
        return ApiResponse.success("Xóa đại lý thành công", data);
    }

    /**
     * Kiểm tra ràng buộc Agent-ExportReceipt trước khi xóa
     * @param agentId ID của đại lý cần kiểm tra
     * @return ApiResponse chứa thông tin ràng buộc
     */
    public ApiResponse<Map<String, Object>> checkAgentExportReceiptConstraints(Integer agentId) {
        Agent existingAgent = agentRepository.findById(agentId)
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));

        Map<String, Object> constraintInfo = new HashMap<>();
        
        // Kiểm tra nợ tiền
        boolean hasDebt = existingAgent.getDebtMoney() > 0;
        constraintInfo.put("hasDebt", hasDebt);
        constraintInfo.put("debtAmount", existingAgent.getDebtMoney());
        
        // Kiểm tra phiếu xuất hàng
        List<ExportReceipt> exportReceipts = exportReceiptRepository.findByAgentId(agentId);
        boolean hasExportReceipts = !exportReceipts.isEmpty();
        constraintInfo.put("hasExportReceipts", hasExportReceipts);
        constraintInfo.put("exportReceiptCount", exportReceipts.size());
        
        // Kiểm tra chi tiết xuất hàng
        List<ExportDetail> exportDetails = exportDetailRepository.findByAgentId(agentId);
        boolean hasExportDetails = !exportDetails.isEmpty();
        constraintInfo.put("hasExportDetails", hasExportDetails);
        constraintInfo.put("exportDetailCount", exportDetails.size());
        
        // Kiểm tra payment receipts
        List<PaymentReceipt> paymentReceipts = paymentReceiptRepository.findByAgentId(agentId);
        constraintInfo.put("paymentReceiptCount", paymentReceipts.size());
        
        // Kiểm tra debt reports
        List<DebtReport> debtReports = debtReportRepository.findByAgentId(agentId);
        constraintInfo.put("debtReportCount", debtReports.size());
        
        // Kiểm tra sales report details
        List<SalesReportDetail> salesReportDetails = salesReportDetailRepository.findByAgentId(agentId);
        constraintInfo.put("salesReportDetailCount", salesReportDetails.size());
        
        // Xác định có thể xóa hay không
        boolean canDelete = !hasDebt && !hasExportReceipts && !hasExportDetails;
        constraintInfo.put("canDelete", canDelete);
        
        // Danh sách lý do không thể xóa
        List<String> blockingReasons = new ArrayList<>();
        if (hasDebt) {
            blockingReasons.add(String.format("Đại lý còn nợ %d VNĐ", existingAgent.getDebtMoney()));
        }
        if (hasExportReceipts) {
            blockingReasons.add(String.format("Đại lý có %d phiếu xuất hàng", exportReceipts.size()));
        }
        if (hasExportDetails) {
            blockingReasons.add(String.format("Đại lý có %d chi tiết xuất hàng", exportDetails.size()));
        }
        constraintInfo.put("blockingReasons", blockingReasons);
        
        constraintInfo.put("agentInfo", Map.of(
            "agentId", existingAgent.getAgentId(),
            "agentName", existingAgent.getAgentName(),
            "agentType", existingAgent.getAgentType().getAgentTypeName(),
            "district", existingAgent.getDistrict().getDistrictName()
        ));
        
        String message = canDelete ? 
            "Đại lý có thể được xóa" : 
            "Đại lý không thể xóa do vi phạm ràng buộc";
            
        return ApiResponse.success(message, constraintInfo);
    }
}