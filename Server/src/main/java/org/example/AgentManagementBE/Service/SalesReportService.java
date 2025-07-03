package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.SalesReport;
import org.example.AgentManagementBE.Model.Agent;
import org.example.AgentManagementBE.Repository.SalesReportRepository;
import org.example.AgentManagementBE.Repository.ExportReceiptRepository;
import org.example.AgentManagementBE.Repository.AgentRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.response.SalesReportResponse;
import org.example.AgentManagementBE.DTO.response.SalesReportSummaryResponse;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * Service xử lý logic liên quan đến báo cáo doanh số
 */
@Service
public class SalesReportService {
    private final SalesReportRepository salesReportRepository;
    private final ExportReceiptRepository exportReceiptRepository;
    private final AgentRepository agentRepository;

    @Autowired
    public SalesReportService(SalesReportRepository salesReportRepository, 
                             ExportReceiptRepository exportReceiptRepository,
                             AgentRepository agentRepository) {
        this.salesReportRepository = salesReportRepository;
        this.exportReceiptRepository = exportReceiptRepository;
        this.agentRepository = agentRepository;
    }

    /**
     * Lấy báo cáo doanh số theo tháng và năm
     * @param month Tháng
     * @param year Năm
     * @return ApiResponse chứa báo cáo doanh số
     */
    public ApiResponse<SalesReportResponse> getSalesReportByMonthAndYear(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        SalesReport salesReport = salesReportRepository.findByMonthAndYear(month, year)
            .orElseThrow(() -> new AppException(ErrorCode.SALES_REPORT_NOT_FOUND));
            
        // Tạo response DTO theo format mong muốn
        SalesReportResponse response = new SalesReportResponse(
            salesReport.getSalesReportId(),
            salesReport.getMonth(),
            salesReport.getYear(), 
            salesReport.getTotalRevenue()
        );
        
        return ApiResponse.success("Lấy báo cáo doanh số thành công", response);
    }

    /**
     * Tạo báo cáo doanh số mới theo tháng và năm
     * @param month Tháng
     * @param year Năm
     * @return ApiResponse chứa báo cáo doanh số đã tạo
     */
    @Transactional
    public ApiResponse<SalesReportResponse> createSalesReport(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        if (salesReportRepository.existsByMonthAndYear(month, year)) {
            throw new AppException(ErrorCode.SALES_REPORT_ALREADY_EXISTS);
        }

        // Tính totalRevenue từ tất cả ExportReceipt trong tháng/năm
        Integer totalRevenue = exportReceiptRepository.getTotalMoneyByMonthAndYear(month, year);
        
        SalesReport salesReport = new SalesReport(month, year);
        salesReport.setTotalRevenue(totalRevenue);
        salesReport.setCreatedAt(LocalDateTime.now());

        SalesReport savedReport = salesReportRepository.save(salesReport);
        
        // Tạo response DTO theo format mong muốn
        SalesReportResponse response = new SalesReportResponse(
            savedReport.getSalesReportId(),
            savedReport.getMonth(),
            savedReport.getYear(), 
            savedReport.getTotalRevenue()
        );
        
        return ApiResponse.created("Tạo báo cáo doanh số thành công", response);
    }

    /**
     * Cập nhật báo cáo doanh số
     * @param salesReport Báo cáo doanh số cần cập nhật
     * @return ApiResponse chứa báo cáo doanh số đã cập nhật
     */
    @Transactional
    public ApiResponse<SalesReport> updateSalesReport(SalesReport salesReport) {
        if (salesReport == null || salesReport.getSalesReportId() == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Báo cáo doanh số không được để trống");
        }

        if (salesReport.getMonth() == null || salesReport.getMonth() < 1 || salesReport.getMonth() > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (salesReport.getYear() == null || salesReport.getYear() < 1900 || salesReport.getYear() > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        SalesReport existingReport = salesReportRepository.findById(salesReport.getSalesReportId())
            .orElseThrow(() -> new AppException(ErrorCode.SALES_REPORT_NOT_FOUND));

        // Kiểm tra nếu thay đổi tháng/năm thì không được trùng với báo cáo khác
        if (!existingReport.getMonth().equals(salesReport.getMonth()) || !existingReport.getYear().equals(salesReport.getYear())) {
            if (salesReportRepository.existsByMonthAndYear(salesReport.getMonth(), salesReport.getYear())) {
                throw new AppException(ErrorCode.SALES_REPORT_ALREADY_EXISTS);
            }
        }

        // Cập nhật thông tin
        existingReport.setMonth(salesReport.getMonth());
        existingReport.setYear(salesReport.getYear());

        SalesReport updatedReport = salesReportRepository.save(existingReport);
        return ApiResponse.success("Cập nhật báo cáo doanh số thành công", updatedReport);
    }

    /**
     * Xóa báo cáo doanh số
     * @param salesReportId ID của báo cáo doanh số cần xóa
     * @return ApiResponse chứa thông báo thành công
     */
    @Transactional
    public ApiResponse<Void> deleteSalesReport(Integer salesReportId) {
        if (salesReportId == null || salesReportId <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "ID không hợp lệ");
        }

        SalesReport report = salesReportRepository.findById(salesReportId)
            .orElseThrow(() -> new AppException(ErrorCode.SALES_REPORT_NOT_FOUND));
        
        salesReportRepository.delete(report);
        return ApiResponse.success("Xóa báo cáo doanh số thành công", null);
    }

    /**
     * Lấy tất cả báo cáo doanh số
     * @return ApiResponse chứa danh sách báo cáo doanh số
     */
    public ApiResponse<List<SalesReport>> getAllSalesReports() {
        List<SalesReport> reports = salesReportRepository.findAll();
        if (reports.isEmpty()) {
            throw new AppException(ErrorCode.SALES_REPORT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách báo cáo doanh số thành công", reports);
    }

    /**
     * Tổng hợp báo cáo doanh số theo tháng và năm
     * @param month Tháng
     * @param year Năm
     * @return ApiResponse chứa báo cáo doanh số đã tổng hợp
     */
    @Transactional
    public ApiResponse<SalesReport> summarizeSalesReport(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        if (salesReportRepository.existsByMonthAndYear(month, year)) {
            throw new AppException(ErrorCode.SALES_REPORT_ALREADY_EXISTS);
        }

        SalesReport newReport = new SalesReport(month, year);

        SalesReport savedReport = salesReportRepository.save(newReport);
        return ApiResponse.created("Tổng hợp báo cáo doanh số thành công", savedReport);
    }

    /**
     * Lấy bảng tổng hợp báo cáo doanh số theo tháng và năm
     * @param month Tháng
     * @param year Năm
     * @return ApiResponse chứa bảng tổng hợp báo cáo doanh số
     */
    public ApiResponse<SalesReportSummaryResponse> getSalesReportSummary(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        // Tính tổng doanh thu (tổng tất cả totalAmount của ExportReceipt trong tháng/năm)
        Integer totalRevenue = exportReceiptRepository.getTotalMoneyByMonthAndYear(month, year);
        
        if (totalRevenue == null || totalRevenue == 0) {
            // Nếu không có doanh thu, trả về danh sách rỗng
            return ApiResponse.success("Không có dữ liệu doanh thu trong tháng " + month + "/" + year, 
                new SalesReportSummaryResponse(0, new ArrayList<>()));
        }

        // Lấy tất cả đại lý
        List<Agent> allAgents = agentRepository.findAllWithDetails();
        
        List<SalesReportSummaryResponse.AgentSalesSummary> agentSummaries = new ArrayList<>();
        int stt = 1;

        for (Agent agent : allAgents) {
            // Đếm số phiếu xuất của đại lý trong tháng/năm
            Long exportCountLong = exportReceiptRepository.countByAgentAndMonthAndYear(
                agent.getAgentId(), month, year);
            Integer exportCount = exportCountLong.intValue();

            // Tính tổng trị giá của đại lý trong tháng/năm
            Integer agentTotalAmount = exportReceiptRepository.getTotalMoneyByAgentAndMonthAndYear(
                agent.getAgentId(), month, year);
            
            if (agentTotalAmount == null) {
                agentTotalAmount = 0;
            }

            // Tính tỷ lệ: (Tổng trị giá của đại lý / Tổng doanh thu) * 100
            Double ratio = 0.0;
            if (totalRevenue > 0) {
                ratio = (agentTotalAmount.doubleValue() / totalRevenue.doubleValue()) * 100;
                // Làm tròn đến 2 chữ số thập phân
                ratio = Math.round(ratio * 100.0) / 100.0;
            }

            // Chỉ thêm vào danh sách nếu đại lý có phiếu xuất hoặc có doanh thu
            if (exportCount > 0 || agentTotalAmount > 0) {
                SalesReportSummaryResponse.AgentSalesSummary summary = 
                    new SalesReportSummaryResponse.AgentSalesSummary(
                        stt++,
                        agent.getAgentId(),
                        agent.getAgentName(),
                        exportCount,
                        agentTotalAmount,
                        ratio
                    );
                agentSummaries.add(summary);
            }
        }

        // Sắp xếp theo tổng trị giá giảm dần
        agentSummaries.sort((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()));
        
        // Cập nhật lại STT sau khi sắp xếp
        for (int i = 0; i < agentSummaries.size(); i++) {
            agentSummaries.get(i).setStt(i + 1);
        }

        SalesReportSummaryResponse response = new SalesReportSummaryResponse(totalRevenue, agentSummaries);
        
        return ApiResponse.success("Lấy bảng tổng hợp báo cáo doanh số thành công", response);
    }
}