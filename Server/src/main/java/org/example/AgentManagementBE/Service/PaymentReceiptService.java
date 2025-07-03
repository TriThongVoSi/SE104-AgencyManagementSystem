package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.DebtReport;
import org.example.AgentManagementBE.Model.Agent;
import org.example.AgentManagementBE.Model.PaymentReceipt;
import org.example.AgentManagementBE.Repository.DebtReportRepository;
import org.example.AgentManagementBE.Repository.AgentRepository;
import org.example.AgentManagementBE.Repository.PaymentReceiptRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * Service xử lý logic liên quan đến phiếu thu tiền
 */
@Service
public class PaymentReceiptService {
    private final PaymentReceiptRepository paymentReceiptRepository;
    private final AgentRepository agentRepository;
    private final AgentService agentService;
    private final DebtReportRepository debtReportRepository;
    private final DebtReportService debtReportService;

    public PaymentReceiptService(PaymentReceiptRepository paymentReceiptRepository, 
                               AgentRepository agentRepository, 
                               AgentService agentService, 
                               DebtReportRepository debtReportRepository,
                               DebtReportService debtReportService) {
        this.paymentReceiptRepository = paymentReceiptRepository;
        this.agentRepository = agentRepository;
        this.agentService = agentService;
        this.debtReportRepository = debtReportRepository;
        this.debtReportService = debtReportService;
    }

    /**
     * Lấy danh sách tất cả phiếu thu tiền
     * @return ApiResponse chứa danh sách phiếu thu tiền
     */
    public ApiResponse<List<PaymentReceipt>> getAllPaymentReceipts() {
        List<PaymentReceipt> receipts = paymentReceiptRepository.findAll();
        if (receipts.isEmpty()) {
            throw new AppException(ErrorCode.PAYMENT_RECEIPT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách phiếu thu tiền thành công", receipts);
    }

    /**
     * Lấy phiếu thu tiền theo ID
     * @param paymentId ID phiếu thu tiền
     * @return ApiResponse chứa thông tin phiếu thu tiền
     */
    public ApiResponse<PaymentReceipt> getPaymentReceiptById(Integer paymentId) {
        PaymentReceipt receipt = paymentReceiptRepository.findById(paymentId)
            .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_RECEIPT_NOT_FOUND));
        return ApiResponse.success("Lấy thông tin phiếu thu tiền thành công", receipt);
    }

    /**
     * Lấy danh sách phiếu thu tiền theo ID đại lý
     * @param agentId ID đại lý
     * @return ApiResponse chứa danh sách phiếu thu tiền
     */
    public ApiResponse<List<PaymentReceipt>> getPaymentReceiptsByAgentId(Integer agentId) {
        // Kiểm tra đại lý tồn tại
        if (!agentRepository.existsById(agentId)) {
            throw new AppException(ErrorCode.AGENT_NOT_FOUND);
        }

        List<PaymentReceipt> receipts = paymentReceiptRepository.findByAgentId(agentId);
        if (receipts.isEmpty()) {
            throw new AppException(ErrorCode.PAYMENT_RECEIPT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách phiếu thu tiền theo đại lý thành công", receipts);
    }

    /**
     * Tạo phiếu thu tiền mới
     * @param paymentReceipt Thông tin phiếu thu tiền cần tạo
     * @return ApiResponse chứa thông tin phiếu thu tiền đã tạo
     */
    @Transactional
    public ApiResponse<PaymentReceipt> insertPaymentReceipt(PaymentReceipt paymentReceipt) {
        if (paymentReceipt == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Phiếu thu tiền không được để trống");
        }

        if (paymentReceipt.getAgent() == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Đại lý không được để trống");
        }

        if (paymentReceipt.getRevenue() == null || paymentReceipt.getRevenue() <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số tiền thu phải lớn hơn 0");
        }

        // Kiểm tra đại lý tồn tại
        Agent existingAgent = agentRepository.findById(paymentReceipt.getAgent().getAgentId())
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));

        Integer paymentAmount = paymentReceipt.getRevenue();
        Integer oldDebtMoney = existingAgent.getDebtMoney();
        
        if (oldDebtMoney < paymentAmount) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số tiền thu vượt quá số tiền nợ hiện tại");
        }

        // Cập nhật số tiền nợ của đại lý
        existingAgent.setDebtMoney(oldDebtMoney - paymentAmount);
        agentRepository.save(existingAgent);

        // Lưu phiếu thu tiền
        PaymentReceipt savedReceipt = paymentReceiptRepository.save(paymentReceipt);

        // Cập nhật báo cáo công nợ theo tháng/năm của phiếu thu
        LocalDate receiptDate = paymentReceipt.getPaymentDate();
        YearMonth monthYear = YearMonth.from(receiptDate);
        debtReportService.updateDebtReportForAgent(paymentReceipt.getAgent().getAgentId(), monthYear);

        return ApiResponse.created("Tạo phiếu thu tiền thành công", savedReceipt);
    }

    /**
     * Cập nhật phiếu thu tiền
     * @param paymentReceipt Thông tin phiếu thu tiền cần cập nhật
     * @return ApiResponse chứa thông tin phiếu thu tiền đã cập nhật
     */
    @Transactional
    public ApiResponse<PaymentReceipt> updatePaymentReceipt(PaymentReceipt paymentReceipt) {
        if (paymentReceipt == null || paymentReceipt.getPaymentId() == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Thông tin phiếu thu không hợp lệ");
        }

        // Kiểm tra phiếu thu tồn tại
        PaymentReceipt existingReceipt = paymentReceiptRepository.findById(paymentReceipt.getPaymentId())
            .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_RECEIPT_NOT_FOUND));

        if (paymentReceipt.getRevenue() == null || paymentReceipt.getRevenue() <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số tiền thu phải lớn hơn 0");
        }

        // Kiểm tra đại lý tồn tại
        Agent agent = agentRepository.findById(paymentReceipt.getAgent().getAgentId())
            .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));

        // Tính toán sự thay đổi trong số tiền thu
        Integer oldRevenue = existingReceipt.getRevenue();
        Integer newRevenue = paymentReceipt.getRevenue();
        Integer revenueChange = newRevenue - oldRevenue;

        // Cập nhật số tiền nợ của đại lý
        Integer currentDebt = agent.getDebtMoney();
        if (currentDebt < revenueChange) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số tiền thu vượt quá số tiền nợ hiện tại");
        }
        agent.setDebtMoney(currentDebt - revenueChange);
        agentRepository.save(agent);

        // Cập nhật thông tin phiếu thu
        existingReceipt.setPaymentDate(paymentReceipt.getPaymentDate());
        existingReceipt.setRevenue(paymentReceipt.getRevenue());
        existingReceipt.setAgent(paymentReceipt.getAgent());

        PaymentReceipt updatedReceipt = paymentReceiptRepository.save(existingReceipt);

        // Cập nhật báo cáo công nợ theo tháng/năm của phiếu thu
        LocalDate receiptDate = updatedReceipt.getPaymentDate();
        YearMonth monthYear = YearMonth.from(receiptDate);
        debtReportService.updateDebtReportForAgent(updatedReceipt.getAgent().getAgentId(), monthYear);

        return ApiResponse.success("Cập nhật phiếu thu tiền thành công", updatedReceipt);
    }

    /**
     * Xóa phiếu thu tiền
     * @param paymentId ID phiếu thu tiền cần xóa
     * @return ApiResponse chứa thông báo thành công
     */
    @Transactional
    public ApiResponse<Void> deletePaymentReceipt(Integer paymentId) {
        PaymentReceipt receipt = paymentReceiptRepository.findById(paymentId)
            .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_RECEIPT_NOT_FOUND));

        // Cập nhật lại số tiền nợ của đại lý (tăng lên vì xóa phiếu thu)
        Agent agent = receipt.getAgent();
        Integer currentDebt = agent.getDebtMoney();
        agent.setDebtMoney(currentDebt + receipt.getRevenue());
        agentRepository.save(agent);

        // Xóa phiếu thu
        paymentReceiptRepository.delete(receipt);

        // Cập nhật báo cáo công nợ theo tháng/năm của phiếu thu
        LocalDate receiptDate = receipt.getPaymentDate();
        YearMonth monthYear = YearMonth.from(receiptDate);
        debtReportService.updateDebtReportForAgent(agent.getAgentId(), monthYear);

        return ApiResponse.success("Xóa phiếu thu tiền thành công", null);
    }
}