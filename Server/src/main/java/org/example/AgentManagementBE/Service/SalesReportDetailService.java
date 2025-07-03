package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.SalesReportDetail;
import org.example.AgentManagementBE.Model.SalesReport;
import org.example.AgentManagementBE.Model.Agent;
import org.example.AgentManagementBE.Repository.SalesReportDetailRepository;
import org.example.AgentManagementBE.Repository.SalesReportRepository;
import org.example.AgentManagementBE.Repository.AgentRepository;
import org.example.AgentManagementBE.Repository.ExportReceiptRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.request.CreateSalesReportDetailRequest;
import org.example.AgentManagementBE.DTO.response.SalesReportDetailResponse;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SalesReportDetailService {

    @Autowired
    private SalesReportDetailRepository salesReportDetailRepository;
    
    @Autowired
    private SalesReportRepository salesReportRepository;
    
    @Autowired
    private AgentRepository agentRepository;
    
    @Autowired
    private ExportReceiptRepository exportReceiptRepository;

    // Lấy tất cả chi tiết báo cáo doanh số
    public ApiResponse<List<SalesReportDetail>> getAllSalesReportDetails() {
        List<SalesReportDetail> details = salesReportDetailRepository.findAll();
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách chi tiết báo cáo doanh số thành công", details);
    }

    // Lấy chi tiết báo cáo doanh số theo agentId
    public ApiResponse<List<SalesReportDetail>> getByAgentId(Integer agentId) {
        List<SalesReportDetail> details = salesReportDetailRepository.findByAgentId(agentId);
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy chi tiết báo cáo doanh số theo đại lý thành công", details);
    }

    // Lấy chi tiết báo cáo doanh số theo salesReportId
    public ApiResponse<List<SalesReportDetail>> getBySalesReportId(Integer salesReportId) {
        List<SalesReportDetail> details = salesReportDetailRepository.findBySalesReportId(salesReportId);
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy chi tiết báo cáo doanh số theo báo cáo thành công", details);
    }

    // Lấy chi tiết báo cáo doanh số theo agentId và salesReportId
    public ApiResponse<SalesReportDetail> getByAgentIdAndSalesReportId(Integer agentId, Integer salesReportId) {
        Optional<SalesReportDetail> detail = salesReportDetailRepository.findByAgentIdAndSalesReportId(agentId, salesReportId);
        if (detail.isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy chi tiết báo cáo doanh số thành công", detail.get());
    }

    // Lấy theo ID chính
    public ApiResponse<SalesReportDetail> getById(Integer salesReportDetailId) {
        Optional<SalesReportDetail> detail = salesReportDetailRepository.findById(salesReportDetailId);
        if (detail.isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy chi tiết báo cáo doanh số thành công", detail.get());
    }

    // Tạo mới hoặc cập nhật chi tiết báo cáo
    public ApiResponse<SalesReportDetail> save(SalesReportDetail detail) {
        SalesReportDetail savedDetail = salesReportDetailRepository.save(detail);
        return ApiResponse.success("Lưu chi tiết báo cáo doanh số thành công", savedDetail);
    }

    // Xoá chi tiết báo cáo theo ID
    public ApiResponse<Void> deleteById(Integer salesReportDetailId) {
        if (!salesReportDetailRepository.existsById(salesReportDetailId)) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_NOT_FOUND);
        }
        salesReportDetailRepository.deleteById(salesReportDetailId);
        return ApiResponse.success("Xóa chi tiết báo cáo doanh số thành công", null);
    }

    // Xoá tất cả chi tiết báo cáo theo agentId và salesReportId
    public ApiResponse<Void> deleteByAgentIdAndSalesReportId(Integer agentId, Integer salesReportId) {
        Optional<SalesReportDetail> detail = salesReportDetailRepository.findByAgentIdAndSalesReportId(agentId, salesReportId);
        if (detail.isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_NOT_FOUND);
        }
        salesReportDetailRepository.delete(detail.get());
        return ApiResponse.success("Xóa chi tiết báo cáo doanh số thành công", null);
    }

    /**
     * Lấy chi tiết báo cáo doanh số theo ID đại lý
     * @param agentId ID đại lý
     * @return ApiResponse chứa danh sách chi tiết báo cáo
     */
    public ApiResponse<List<SalesReportDetail>> getSalesReportDetailByAgentId(Integer agentId) {
        if (agentId == null || agentId <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "ID đại lý không hợp lệ");
        }

        List<SalesReportDetail> details = salesReportDetailRepository.findByAgentId(agentId);
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy chi tiết báo cáo doanh số theo đại lý thành công", details);
    }

    /**
     * Lấy chi tiết báo cáo doanh số theo tháng và năm
     * @param month Tháng
     * @param year Năm
     * @return ApiResponse chứa danh sách chi tiết báo cáo
     */
    public ApiResponse<List<SalesReportDetail>> getSalesReportDetail(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        List<SalesReportDetail> details = salesReportDetailRepository.findByMonthAndYear(month, year);
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_NOT_FOUND);
        }
        return ApiResponse.success("Lấy chi tiết báo cáo doanh số theo tháng và năm thành công", details);
    }

    /**
     * Tạo chi tiết báo cáo doanh số theo tháng và năm
     * @param month Tháng
     * @param year Năm
     * @return ApiResponse chứa danh sách chi tiết báo cáo đã tạo
     */
    @Transactional
    public ApiResponse<List<SalesReportDetail>> createSalesReportDetail(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        // Kiểm tra xem đã có chi tiết báo cáo cho tháng và năm này chưa
        if (!salesReportDetailRepository.findByMonthAndYear(month, year).isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_ALREADY_EXISTS);
        }

        // Tạo chi tiết báo cáo cho tất cả đại lý
        List<SalesReportDetail> details = salesReportDetailRepository.createSalesReportDetails(month, year);
        if (details.isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_CREATION_FAILED);
        }

        return ApiResponse.created("Tạo chi tiết báo cáo doanh số thành công", details);
    }

    /**
     * Tạo chi tiết báo cáo doanh số cho một đại lý cụ thể
     * @param request DTO chứa salesReportId và agentId
     * @return ApiResponse chứa chi tiết báo cáo doanh số đã tạo
     */
    @Transactional
    public ApiResponse<SalesReportDetailResponse> createSalesReportDetailForAgent(CreateSalesReportDetailRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Request không được để trống");
        }

        // Kiểm tra SalesReport tồn tại
        SalesReport salesReport = salesReportRepository.findById(request.getSalesReportId())
                .orElseThrow(() -> new AppException(ErrorCode.SALES_REPORT_NOT_FOUND));

        // Kiểm tra Agent tồn tại
        Agent agent = agentRepository.findById(request.getAgentId())
                .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));

        // Kiểm tra đã tồn tại chi tiết báo cáo cho agent và sales report này chưa
        Optional<SalesReportDetail> existingDetail = salesReportDetailRepository
                .findByAgentIdAndSalesReportId(request.getAgentId(), request.getSalesReportId());
        if (existingDetail.isPresent()) {
            throw new AppException(ErrorCode.SALES_REPORT_DETAIL_ALREADY_EXISTS);
        }

        // Lấy tháng và năm từ salesReport
        Integer month = salesReport.getMonth();
        Integer year = salesReport.getYear();

        // Tính toán các giá trị:
        // 1. exportCount: đếm số lượng ExportReceipt của agent trong tháng/năm
        Long exportCount = exportReceiptRepository.countByAgentAndMonthAndYear(
                request.getAgentId(), month, year);

        // 2. totalAmount: tổng totalAmount từ ExportReceipt của agent trong tháng/năm
        Integer totalAmount = exportReceiptRepository.getTotalMoneyByAgentAndMonthAndYear(
                request.getAgentId(), month, year);

        // 3. paidAmount: tổng paidAmount từ ExportReceipt của agent trong tháng/năm
        Integer paidAmount = exportReceiptRepository.getTotalPaidAmountByAgentAndMonthAndYear(
                request.getAgentId(), month, year);

        // 4. ratio: totalAmount / totalRevenue * 100
        Double ratio = 0.0;
        if (salesReport.getTotalRevenue() != null && salesReport.getTotalRevenue() > 0) {
            ratio = (totalAmount.doubleValue() / salesReport.getTotalRevenue().doubleValue()) * 100;
        }

        // Tạo SalesReportDetail
        SalesReportDetail salesReportDetail = new SalesReportDetail();
        salesReportDetail.setSalesReport(salesReport);
        salesReportDetail.setAgent(agent);
        salesReportDetail.setExportCount(exportCount.intValue());
        salesReportDetail.setTotalAmount(totalAmount);
        salesReportDetail.setPaidAmount(paidAmount);
        salesReportDetail.setRatio(ratio.intValue()); // Convert to Integer as per model

        // Lưu vào database
        SalesReportDetail savedDetail = salesReportDetailRepository.save(salesReportDetail);

        // Tạo response DTO
        SalesReportDetailResponse response = new SalesReportDetailResponse(
                savedDetail.getSalesReportDetailId(),
                savedDetail.getSalesReport().getSalesReportId(),
                savedDetail.getAgent().getAgentId(), // Lấy agentId thay vì Agent object
                savedDetail.getExportCount(),
                savedDetail.getTotalAmount(),
                savedDetail.getPaidAmount(),
                ratio // Keep ratio as Double in response
        );

        return ApiResponse.created("Tạo chi tiết báo cáo doanh số thành công", response);
    }
} 
