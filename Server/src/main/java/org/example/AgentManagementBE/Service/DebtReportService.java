package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.DebtReport;
import org.example.AgentManagementBE.Model.Agent;
import org.example.AgentManagementBE.Repository.DebtReportRepository;
import org.example.AgentManagementBE.Repository.AgentRepository;
import org.example.AgentManagementBE.Repository.ExportReceiptRepository;
import org.example.AgentManagementBE.Repository.PaymentReceiptRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

/**
 * Service xử lý logic liên quan đến báo cáo công nợ
 */
@Service
public class DebtReportService {
    private final DebtReportRepository debtReportRepository;
    private final AgentRepository agentRepository;
    private final ExportReceiptRepository exportReceiptRepository;
    private final PaymentReceiptRepository paymentReceiptRepository;

    @Autowired
    public DebtReportService(DebtReportRepository debtReportRepository, 
                           AgentRepository agentRepository,
                           ExportReceiptRepository exportReceiptRepository,
                           PaymentReceiptRepository paymentReceiptRepository) {
        this.debtReportRepository = debtReportRepository;
        this.agentRepository = agentRepository;
        this.exportReceiptRepository = exportReceiptRepository;
        this.paymentReceiptRepository = paymentReceiptRepository;
    }

    /**
     * Cập nhật báo cáo công nợ cho đại lý theo tháng/năm
     * @param agentId ID của đại lý
     * @param monthYear Tháng/năm cần cập nhật
     */
    @Transactional
    public void updateDebtReportForAgent(int agentId, YearMonth monthYear) {
        int month = monthYear.getMonthValue();
        int year = monthYear.getYear();
        
        // Kiểm tra đại lý tồn tại
        Agent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));
        
        // Tìm hoặc tạo báo cáo công nợ cho tháng này
        DebtReport debtReport = debtReportRepository.findByMonthYearAndAgent(month, year, agentId)
            .orElseGet(() -> createDebtReportForMonth(agentId, monthYear));
        
        // Tính arisen_debt = tổng totalAmount từ ExportReceipt - tổng revenue từ PaymentReceipt
        Integer totalExportAmount = exportReceiptRepository.getTotalMoneyByAgentAndMonthAndYear(agentId, month, year);
        Integer totalPaymentRevenue = paymentReceiptRepository.getTotalRevenueByAgentAndMonthAndYear(agentId, month, year);
        
        if (totalExportAmount == null) totalExportAmount = 0;
        if (totalPaymentRevenue == null) totalPaymentRevenue = 0;
        
        Integer arisenDebt = totalExportAmount - totalPaymentRevenue;
        
        // Cập nhật arisen_debt và last_debt
        debtReport.setArisenDebt(arisenDebt);
        debtReport.setLastDebt(debtReport.getFirstDebt() + arisenDebt);
        
        // Lưu báo cáo
        debtReportRepository.save(debtReport);
    }
    
    /**
     * Tạo báo cáo công nợ mới cho tháng cụ thể
     * @param agentId ID của đại lý
     * @param monthYear Tháng/năm cần tạo báo cáo
     * @return DebtReport đã tạo
     */
    @Transactional
    public DebtReport createDebtReportForMonth(int agentId, YearMonth monthYear) {
        int month = monthYear.getMonthValue();
        int year = monthYear.getYear();
        
        // Kiểm tra đại lý tồn tại
        Agent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));
        
        // Tìm báo cáo công nợ tháng trước để lấy last_debt làm first_debt
        YearMonth previousMonth = monthYear.minusMonths(1);
        int prevMonth = previousMonth.getMonthValue();
        int prevYear = previousMonth.getYear();
        
        Integer firstDebt = 0;
        Optional<DebtReport> previousReport = debtReportRepository.findByMonthYearAndAgent(prevMonth, prevYear, agentId);
        if (previousReport.isPresent()) {
            firstDebt = previousReport.get().getLastDebt();
        }
        
        // Tạo báo cáo mới
        DebtReport debtReport = new DebtReport();
        debtReport.setMonth(month);
        debtReport.setYear(year);
        debtReport.setAgent(agent);
        debtReport.setFirstDebt(firstDebt);
        debtReport.setArisenDebt(0);
        debtReport.setLastDebt(firstDebt);
        
        return debtReportRepository.save(debtReport);
    }

    /**
     * Lấy báo cáo công nợ theo tháng, năm và ID đại lý
     */
    public ApiResponse<DebtReport> getDebtReport(Integer month, Integer year, Integer agentId) {
        DebtReport report = debtReportRepository.findByMonthYearAndAgent(month, year, agentId)
            .orElseThrow(() -> new AppException(ErrorCode.DEBT_REPORT_NOT_FOUND));
        return ApiResponse.success("Lấy báo cáo công nợ thành công", report);
    }

    /**
     * Tạo báo cáo công nợ mới
     */
    @Transactional
    public ApiResponse<DebtReport> createDebtReport(DebtReport debtReport) {
        // Kiểm tra đại lý tồn tại
        Agent agent = agentRepository.findById(debtReport.getAgent().getAgentId())
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));

        // Kiểm tra báo cáo đã tồn tại
        if (debtReportRepository.existsByMonthYearAndAgent(
                debtReport.getMonth(),
                debtReport.getYear(),
                debtReport.getAgent().getAgentId())) {
            throw new AppException(ErrorCode.DEBT_REPORT_ALREADY_EXISTS);
        }

        DebtReport savedReport = debtReportRepository.save(debtReport);
        return ApiResponse.created("Tạo báo cáo công nợ thành công", savedReport);
    }

    /**
     * Cập nhật báo cáo công nợ
     */
    @Transactional
    public ApiResponse<DebtReport> updateDebtReport(DebtReport debtReport) {
        // Kiểm tra báo cáo tồn tại
        DebtReport existingReport = debtReportRepository.findByMonthYearAndAgent(
                debtReport.getMonth(),
                debtReport.getYear(),
                debtReport.getAgent().getAgentId())
            .orElseThrow(() -> new AppException(ErrorCode.DEBT_REPORT_NOT_FOUND));

        // Cập nhật thông tin
        existingReport.setFirstDebt(debtReport.getFirstDebt());
        existingReport.setLastDebt(debtReport.getLastDebt());
        existingReport.setArisenDebt(debtReport.getArisenDebt());

        DebtReport updatedReport = debtReportRepository.save(existingReport);
        return ApiResponse.success("Cập nhật báo cáo công nợ thành công", updatedReport);
    }

    /**
     * Xóa báo cáo công nợ
     */
    @Transactional
    public ApiResponse<Void> deleteDebtReport(Integer month, Integer year, Integer agentId) {
        DebtReport report = debtReportRepository.findByMonthYearAndAgent(month, year, agentId)
            .orElseThrow(() -> new AppException(ErrorCode.DEBT_REPORT_NOT_FOUND));
        
        debtReportRepository.delete(report);
        return ApiResponse.success("Xóa báo cáo công nợ thành công", null);
    }

    /**
     * Lấy tất cả báo cáo công nợ
     */
    public ApiResponse<List<DebtReport>> getAllDebtReports() {
        List<DebtReport> reports = debtReportRepository.findAll();
        if (reports.isEmpty()) {
            throw new AppException(ErrorCode.DEBT_REPORT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách báo cáo công nợ thành công", reports);
    }

    /**
     * Tổng hợp báo cáo công nợ theo tháng và năm
     */
    @Transactional
    public ApiResponse<List<DebtReport>> summarizeDebtReports(Integer month, Integer year) {
        List<Agent> agents = agentRepository.findAll();
        if (agents.isEmpty()) {
            throw new AppException(ErrorCode.AGENT_NOT_FOUND);
        }

        YearMonth monthYear = YearMonth.of(year, month);
        List<DebtReport> reports = agents.stream()
            .map(agent -> {
                // Cập nhật báo cáo công nợ cho từng đại lý
                updateDebtReportForAgent(agent.getAgentId(), monthYear);
                return debtReportRepository.findByMonthYearAndAgent(month, year, agent.getAgentId())
                    .orElseThrow(() -> new AppException(ErrorCode.DEBT_REPORT_NOT_FOUND));
            })
            .toList();

        return ApiResponse.success("Tổng hợp báo cáo công nợ thành công", reports);
    }
}