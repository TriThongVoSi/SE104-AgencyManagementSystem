package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.ExportReceipt;
import org.example.AgentManagementBE.Model.ExportDetail;
import org.example.AgentManagementBE.Model.Agent;
import org.example.AgentManagementBE.Model.Product;
import org.example.AgentManagementBE.Repository.ExportReceiptRepository;
import org.example.AgentManagementBE.Repository.ExportDetailRepository;
import org.example.AgentManagementBE.Repository.AgentRepository;
import org.example.AgentManagementBE.Repository.ProductRepository;

import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.request.CreateExportReceiptRequest;
import org.example.AgentManagementBE.DTO.request.CreateExportReceiptWithMultipleProductsRequest;
import org.example.AgentManagementBE.DTO.request.ExportDetailRequest;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

/**
 * Service xử lý logic liên quan đến phiếu xuất hàng
 */
@Service
public class ExportReceiptService {
    private final ExportReceiptRepository exportReceiptRepository;
    private final ExportDetailRepository exportDetailRepository;
    private final AgentRepository agentRepository;
    private final ProductRepository productRepository;
    private final DebtReportService debtReportService;

    @Autowired
    public ExportReceiptService(ExportReceiptRepository exportReceiptRepository,
                               ExportDetailRepository exportDetailRepository,
                               AgentRepository agentRepository,
                               ProductRepository productRepository,
                               DebtReportService debtReportService) {
        this.exportReceiptRepository = exportReceiptRepository;
        this.exportDetailRepository = exportDetailRepository;
        this.agentRepository = agentRepository;
        this.productRepository = productRepository;
        this.debtReportService = debtReportService;
    }

    /**
     * Lấy tất cả phiếu xuất hàng
     * @return ApiResponse chứa danh sách phiếu xuất hàng
     */
    public ApiResponse<List<ExportReceipt>> getAllExportReceipts() {
        List<ExportReceipt> receipts = exportReceiptRepository.findAll();
        if (receipts.isEmpty()) {
            throw new AppException(ErrorCode.EXPORT_RECEIPT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách phiếu xuất hàng thành công", receipts);
    }

    /**
     * Lấy phiếu xuất hàng theo ID
     * @param exportReceiptId ID của phiếu xuất hàng
     * @return ApiResponse chứa phiếu xuất hàng
     */
    public ApiResponse<ExportReceipt> getExportReceiptById(Integer exportReceiptId) {
        ExportReceipt receipt = exportReceiptRepository.findById(exportReceiptId)
            .orElseThrow(() -> new AppException(ErrorCode.EXPORT_RECEIPT_NOT_FOUND));
        return ApiResponse.success("Lấy phiếu xuất hàng thành công", receipt);
    }

    /**
     * Lấy phiếu xuất hàng theo ngày
     * @param dateReceipt Ngày cần tìm
     * @return ApiResponse chứa danh sách phiếu xuất hàng
     */
    public ApiResponse<List<ExportReceipt>> getExportReceiptsByDate(LocalDate dateReceipt) {
        List<ExportReceipt> receipts = exportReceiptRepository.findByCreateDate(dateReceipt);
        if (receipts.isEmpty()) {
            throw new AppException(ErrorCode.EXPORT_RECEIPT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách phiếu xuất hàng theo ngày thành công", receipts);
    }

    /**
     * Lấy phiếu xuất hàng theo tháng và năm
     * @param month Tháng cần tìm (1-12)
     * @param year Năm cần tìm
     * @return ApiResponse chứa danh sách phiếu xuất hàng
     */
    public ApiResponse<List<ExportReceipt>> getExportReceiptsByMonthAndYear(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        List<ExportReceipt> receipts = exportReceiptRepository.findByMonthAndYear(month, year);
        if (receipts.isEmpty()) {
            throw new AppException(ErrorCode.EXPORT_RECEIPT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách phiếu xuất hàng theo tháng và năm thành công", receipts);
    }

    /**
     * Lấy phiếu xuất hàng theo đại lý
     * @param agentId ID của đại lý
     * @return ApiResponse chứa danh sách phiếu xuất hàng
     */
    public ApiResponse<List<ExportReceipt>> getExportReceiptsByAgentId(Integer agentId) {
        List<ExportReceipt> receipts = exportReceiptRepository.findByAgentId(agentId);
        if (receipts.isEmpty()) {
            throw new AppException(ErrorCode.EXPORT_RECEIPT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách phiếu xuất hàng theo đại lý thành công", receipts);
    }

    /**
     * Tạo phiếu xuất hàng mới với DTO request
     * @param request DTO request chứa thông tin cần thiết
     * @return ApiResponse chứa phiếu xuất hàng đã tạo
     */
    @Transactional
    public ApiResponse<ExportReceipt> createExportReceiptWithDetails(CreateExportReceiptRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Request không được để trống");
        }

        // Kiểm tra Agent tồn tại và validate constraints
        Agent agent = agentRepository.findById(request.getAgentId())
                .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND, 
                    "Không tìm thấy đại lý với ID: " + request.getAgentId()));

        // Kiểm tra Product tồn tại
        Product product = productRepository.findById(request.getProductID())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND,
                    "Không tìm thấy sản phẩm với ID: " + request.getProductID()));

        // Kiểm tra số lượng tồn kho
        if (product.getInventoryQuantity() < request.getQuantityExport()) {
            throw new AppException(ErrorCode.INSUFFICIENT_INVENTORY,
                String.format("Không đủ hàng tồn kho cho sản phẩm '%s'. Tồn kho: %d, Yêu cầu: %d", 
                    product.getProductName(), product.getInventoryQuantity(), request.getQuantityExport()));
        }

        // Lấy export price từ product
        Integer exportPrice = product.getExportPrice();
        
        // Tính totalAmount tự động
        Integer totalAmount = request.getQuantityExport() * exportPrice;
        
        // Tính remainingAmount
        Integer remainingAmount = totalAmount - request.getPaidAmount();
        
        // Kiểm tra paidAmount không vượt quá totalAmount
        if (request.getPaidAmount() > totalAmount) {
            throw new AppException(ErrorCode.BAD_REQUEST, 
                String.format("Số tiền đã trả (%d) không được vượt quá tổng tiền (%d)", 
                    request.getPaidAmount(), totalAmount));
        }

        // Kiểm tra Agent debt limit sau khi thêm remainingAmount
        Integer newTotalDebt = agent.getDebtMoney() + remainingAmount;
        if (agent.getAgentType() != null && newTotalDebt > agent.getAgentType().getMaximumDebt()) {
            Map<String, Object> constraintViolation = new HashMap<>();
            constraintViolation.put("violationType", "AGENT_DEBT_LIMIT_EXCEEDED");
            constraintViolation.put("agentId", agent.getAgentId());
            constraintViolation.put("agentName", agent.getAgentName());
            constraintViolation.put("currentDebt", agent.getDebtMoney());
            constraintViolation.put("additionalDebt", remainingAmount);
            constraintViolation.put("newTotalDebt", newTotalDebt);
            constraintViolation.put("maxAllowedDebt", agent.getAgentType().getMaximumDebt());
            constraintViolation.put("agentTypeName", agent.getAgentType().getAgentTypeName());
            constraintViolation.put("suggestion", "Giảm số lượng xuất hoặc tăng số tiền trả trước");
            
            throw new AppException(ErrorCode.AGENT_DEBT_LIMIT_EXCEEDED,
                String.format("Tạo phiếu xuất sẽ làm nợ của đại lý '%s' vượt quá giới hạn. Nợ hiện tại: %d, Thêm: %d, Tổng: %d, Giới hạn: %d", 
                    agent.getAgentName(), agent.getDebtMoney(), remainingAmount, newTotalDebt, agent.getAgentType().getMaximumDebt()));
        }

        // Tạo ExportReceipt
        ExportReceipt exportReceipt = new ExportReceipt();
        exportReceipt.setAgent(agent);
        exportReceipt.setCreateDate(request.getCreateDate());
        exportReceipt.setTotalAmount(totalAmount);
        exportReceipt.setPaidAmount(request.getPaidAmount());
        exportReceipt.setRemainingAmount(remainingAmount);

        // Lưu ExportReceipt trước
        ExportReceipt savedReceipt = exportReceiptRepository.save(exportReceipt);

        // Tạo ExportDetail
        ExportDetail exportDetail = new ExportDetail();
        exportDetail.setExportReceipt(savedReceipt);
        exportDetail.setProduct(product);
        exportDetail.setQuantityExport(request.getQuantityExport());
        exportDetail.setExportPrice(exportPrice);
        exportDetail.setIntoMoney(totalAmount);

        // Lưu ExportDetail
        exportDetailRepository.save(exportDetail);

        // Cập nhật inventory của Product (giảm đi quantityExport)
        Integer currentInventory = product.getInventoryQuantity();
        product.setInventoryQuantity(currentInventory - request.getQuantityExport());
        productRepository.save(product);

        // Cập nhật debt của Agent (tăng lên remainingAmount)
        Integer currentDebt = agent.getDebtMoney();
        agent.setDebtMoney(currentDebt + remainingAmount);
        agentRepository.save(agent);
        
        // Cập nhật báo cáo công nợ
        YearMonth monthYear = YearMonth.from(request.getCreateDate());
        debtReportService.updateDebtReportForAgent(agent.getAgentId(), monthYear);

        return ApiResponse.created("Tạo phiếu xuất hàng thành công", savedReceipt);
    }

    /**
     * Kiểm tra ràng buộc trước khi tạo ExportReceipt
     */
    public ApiResponse<Map<String, Object>> validateCreateExportReceiptConstraints(CreateExportReceiptRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Request không được để trống");
        }

        Map<String, Object> validation = new HashMap<>();
        validation.put("isValid", true);
        validation.put("errors", new ArrayList<>());
        validation.put("warnings", new ArrayList<>());
        
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // Kiểm tra Agent
        Agent agent = null;
        try {
            agent = agentRepository.findById(request.getAgentId())
                    .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));
            validation.put("agentInfo", Map.of(
                "agentId", agent.getAgentId(),
                "agentName", agent.getAgentName(),
                "currentDebt", agent.getDebtMoney(),
                "maxDebt", agent.getAgentType().getMaximumDebt()
            ));
        } catch (Exception e) {
            errors.add("Agent không tồn tại với ID: " + request.getAgentId());
        }

        // Kiểm tra Product
        Product product = null;
        try {
            product = productRepository.findById(request.getProductID())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
            validation.put("productInfo", Map.of(
                "productId", product.getProductId(),
                "productName", product.getProductName(),
                "inventoryQuantity", product.getInventoryQuantity(),
                "exportPrice", product.getExportPrice()
            ));
        } catch (Exception e) {
            errors.add("Product không tồn tại với ID: " + request.getProductID());
        }

        // Kiểm tra các constraint nếu cả Agent và Product đều hợp lệ
        if (agent != null && product != null) {
            Integer totalAmount = request.getQuantityExport() * product.getExportPrice();
            Integer remainingAmount = totalAmount - request.getPaidAmount();
            Integer newTotalDebt = agent.getDebtMoney() + remainingAmount;

            validation.put("calculatedAmounts", Map.of(
                "totalAmount", totalAmount,
                "paidAmount", request.getPaidAmount(),
                "remainingAmount", remainingAmount,
                "newTotalDebt", newTotalDebt
            ));

            // Kiểm tra inventory
            if (product.getInventoryQuantity() < request.getQuantityExport()) {
                errors.add(String.format("Không đủ hàng tồn kho. Có: %d, Yêu cầu: %d", 
                    product.getInventoryQuantity(), request.getQuantityExport()));
            }

            // Kiểm tra paid amount
            if (request.getPaidAmount() > totalAmount) {
                errors.add("Số tiền trả không được vượt quá tổng tiền");
            }

            // Kiểm tra debt limit
            if (newTotalDebt > agent.getAgentType().getMaximumDebt()) {
                errors.add(String.format("Tổng nợ mới (%d) vượt quá giới hạn (%d)", 
                    newTotalDebt, agent.getAgentType().getMaximumDebt()));
            }

            // Warnings
            if (remainingAmount > 0) {
                warnings.add("Phiếu xuất này sẽ tạo thêm nợ cho đại lý");
            }
            
            if (newTotalDebt > agent.getAgentType().getMaximumDebt() * 0.8) {
                warnings.add("Nợ của đại lý sắp đạt giới hạn cho phép");
            }
        }

        validation.put("errors", errors);
        validation.put("warnings", warnings);
        validation.put("isValid", errors.isEmpty());

        return ApiResponse.success("Kiểm tra ràng buộc ExportReceipt thành công", validation);
    }

    /**
     * Cập nhật phiếu xuất hàng
     * @param exportReceipt Phiếu xuất hàng cần cập nhật
     * @return ApiResponse chứa phiếu xuất hàng đã cập nhật
     */
    @Transactional
    public ApiResponse<ExportReceipt> updateExportReceipt(ExportReceipt exportReceipt) {
        ExportReceipt existingReceipt = exportReceiptRepository.findById(exportReceipt.getExportReceiptId())
            .orElseThrow(() -> new AppException(ErrorCode.EXPORT_RECEIPT_NOT_FOUND));

        // Cập nhật thông tin
        existingReceipt.setCreateDate(exportReceipt.getCreateDate());
        existingReceipt.setAgent(exportReceipt.getAgent());
        existingReceipt.setTotalAmount(exportReceipt.getTotalAmount());
        existingReceipt.setPaidAmount(exportReceipt.getPaidAmount());
        existingReceipt.setRemainingAmount(exportReceipt.getRemainingAmount());

        ExportReceipt updatedReceipt = exportReceiptRepository.save(existingReceipt);
        
        // Cập nhật báo cáo công nợ
        YearMonth monthYear = YearMonth.from(updatedReceipt.getCreateDate());
        debtReportService.updateDebtReportForAgent(updatedReceipt.getAgent().getAgentId(), monthYear);

        return ApiResponse.success("Cập nhật phiếu xuất hàng thành công", updatedReceipt);
    }

    /**
     * Xóa phiếu xuất hàng
     * @param exportReceiptId ID của phiếu xuất hàng cần xóa
     * @return ApiResponse chứa thông báo thành công
     */
    @Transactional
    public ApiResponse<Void> deleteExportReceipt(Integer exportReceiptId) {
        ExportReceipt receipt = exportReceiptRepository.findById(exportReceiptId)
            .orElseThrow(() -> new AppException(ErrorCode.EXPORT_RECEIPT_NOT_FOUND));
        
        // Lưu thông tin để cập nhật báo cáo công nợ sau khi xóa
        Agent agent = receipt.getAgent();
        LocalDate createDate = receipt.getCreateDate();
        
        exportReceiptRepository.delete(receipt);
        
        // Cập nhật báo cáo công nợ
        YearMonth monthYear = YearMonth.from(createDate);
        debtReportService.updateDebtReportForAgent(agent.getAgentId(), monthYear);
        
        return ApiResponse.success("Xóa phiếu xuất hàng thành công", null);
    }

    /**
     * Tính tổng tiền của phiếu xuất hàng
     * @param exportReceiptId ID của phiếu xuất hàng
     * @return ApiResponse chứa tổng tiền
     */
    public ApiResponse<Double> calculateTotalAmount(Integer exportReceiptId) {
        ExportReceipt receipt = exportReceiptRepository.findById(exportReceiptId)
            .orElseThrow(() -> new AppException(ErrorCode.EXPORT_RECEIPT_NOT_FOUND));
            
        Double totalAmount = exportReceiptRepository.calculateTotalMoney(exportReceiptId);
        return ApiResponse.success("Tính tổng tiền phiếu xuất hàng thành công", totalAmount);
    }

    /**
     * Lấy thống kê xuất hàng theo tháng và năm
     * @param month Tháng cần tìm (1-12)
     * @param year Năm cần tìm
     * @return ApiResponse chứa thống kê xuất hàng
     */
    public ApiResponse<Map<String, Object>> getExportStatisticsByMonthAndYear(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalReceipts", exportReceiptRepository.countByMonthAndYear(month, year));
        statistics.put("totalMoney", exportReceiptRepository.getTotalMoneyByMonthAndYear(month, year));
        statistics.put("totalQuantity", exportReceiptRepository.getQuantityExportByMonthAndYear(month, year));

        return ApiResponse.success("Lấy thống kê xuất hàng theo tháng và năm thành công", statistics);
    }

    /**
     * Lấy thống kê xuất hàng theo đại lý, tháng và năm
     * @param agentId ID của đại lý
     * @param month Tháng cần tìm (1-12)
     * @param year Năm cần tìm
     * @return ApiResponse chứa thống kê xuất hàng
     */
    public ApiResponse<Map<String, Object>> getExportStatisticsByAgentAndMonthAndYear(Integer agentId, Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalReceipts", exportReceiptRepository.countByAgentAndMonthAndYear(agentId, month, year));
        statistics.put("totalMoney", exportReceiptRepository.getTotalMoneyByAgentAndMonthAndYear(agentId, month, year));
        statistics.put("totalRemainAmount", exportReceiptRepository.getTotalRemainAmountByAgentAndMonthAndYear(agentId, month, year));

        return ApiResponse.success("Lấy thống kê xuất hàng theo đại lý, tháng và năm thành công", statistics);
    }

    /**
     * Tạo phiếu xuất hàng mới với nhiều mặt hàng
     * @param request DTO request chứa thông tin cần thiết cho nhiều mặt hàng
     * @return ApiResponse chứa phiếu xuất hàng đã tạo
     */
    @Transactional
    public ApiResponse<ExportReceipt> createExportReceiptWithMultipleProducts(CreateExportReceiptWithMultipleProductsRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Request không được để trống");
        }

        if (request.getExportDetails() == null || request.getExportDetails().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Danh sách mặt hàng không được để trống");
        }

        // Kiểm tra Agent tồn tại
        Agent agent = agentRepository.findById(request.getAgentId())
                .orElseThrow(() -> new AppException(ErrorCode.AGENT_NOT_FOUND));

        // Tạo ExportReceipt trước
        ExportReceipt exportReceipt = new ExportReceipt();
        exportReceipt.setAgent(agent);
        exportReceipt.setCreateDate(request.getCreateDate());
        exportReceipt.setTotalAmount(0); // Sẽ tính sau
        exportReceipt.setPaidAmount(request.getPaidAmount());
        exportReceipt.setRemainingAmount(0); // Sẽ tính sau

        // Lưu ExportReceipt trước để có ID
        ExportReceipt savedReceipt = exportReceiptRepository.save(exportReceipt);

        List<ExportDetail> exportDetailList = new ArrayList<>();
        Integer totalAmount = 0;

        // Xử lý từng mặt hàng
        for (ExportDetailRequest detailRequest : request.getExportDetails()) {
            // Kiểm tra sản phẩm tồn tại
            Product product = productRepository.findById(detailRequest.getProductID())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, 
                        "Không tìm thấy sản phẩm với ID: " + detailRequest.getProductID()));

            // Kiểm tra sản phẩm có trùng trong cùng một phiếu xuất không
            boolean isDuplicate = exportDetailList.stream()
                    .anyMatch(detail -> detail.getProduct().getProductId().equals(detailRequest.getProductID()));
            
            if (isDuplicate) {
                throw new AppException(ErrorCode.BAD_REQUEST, 
                    "Sản phẩm ID " + detailRequest.getProductID() + " đã tồn tại trong phiếu xuất này");
            }

            // Kiểm tra số lượng tồn kho
            if (product.getInventoryQuantity() < detailRequest.getQuantityExport()) {
                throw new AppException(ErrorCode.INSUFFICIENT_INVENTORY, 
                    "Không đủ hàng tồn kho cho sản phẩm ID: " + detailRequest.getProductID() + 
                    ". Tồn kho hiện tại: " + product.getInventoryQuantity() + 
                    ", yêu cầu xuất: " + detailRequest.getQuantityExport());
            }

            // Lấy export price từ product
            Integer exportPrice = product.getExportPrice();
            
            // Tính intoMoney cho từng mặt hàng
            Integer intoMoney = detailRequest.getQuantityExport() * exportPrice;

            // Tạo ExportDetail
            ExportDetail exportDetail = new ExportDetail();
            exportDetail.setExportReceipt(savedReceipt);
            exportDetail.setProduct(product);
            exportDetail.setQuantityExport(detailRequest.getQuantityExport());
            exportDetail.setExportPrice(exportPrice);
            exportDetail.setIntoMoney(intoMoney);

            exportDetailList.add(exportDetail);
            totalAmount += intoMoney;

            // Cập nhật inventory của Product (giảm đi quantityExport)
            Integer currentInventory = product.getInventoryQuantity();
            product.setInventoryQuantity(currentInventory - detailRequest.getQuantityExport());
            productRepository.save(product);
        }

        // Kiểm tra paidAmount không vượt quá totalAmount
        if (request.getPaidAmount() > totalAmount) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số tiền đã trả không được vượt quá tổng tiền");
        }

        // Tính remainingAmount
        Integer remainingAmount = totalAmount - request.getPaidAmount();

        // Lưu tất cả ExportDetail
        exportDetailRepository.saveAll(exportDetailList);

        // Cập nhật totalAmount và remainingAmount cho ExportReceipt
        savedReceipt.setTotalAmount(totalAmount);
        savedReceipt.setRemainingAmount(remainingAmount);
        ExportReceipt finalReceipt = exportReceiptRepository.save(savedReceipt);

        // Cập nhật debt của Agent (tăng lên remainingAmount)
        Integer currentDebt = agent.getDebtMoney();
        agent.setDebtMoney(currentDebt + remainingAmount);
        agentRepository.save(agent);
        
        // Cập nhật báo cáo công nợ
        YearMonth monthYear = YearMonth.from(request.getCreateDate());
        debtReportService.updateDebtReportForAgent(agent.getAgentId(), monthYear);

        return ApiResponse.created("Tạo phiếu xuất hàng với nhiều mặt hàng thành công", finalReceipt);
    }

    /**
     * Tạo phiếu xuất hàng mới (method cũ cho tương thích ngược)
     * @param exportReceipt Phiếu xuất hàng cần tạo
     * @return ApiResponse chứa phiếu xuất hàng đã tạo
     */
    @Transactional
    public ApiResponse<ExportReceipt> createExportReceipt(ExportReceipt exportReceipt) {
        // Kiểm tra phiếu xuất đã tồn tại
        if (exportReceipt.getExportReceiptId() != null && 
            exportReceiptRepository.existsById(exportReceipt.getExportReceiptId())) {
            throw new AppException(ErrorCode.EXPORT_RECEIPT_ALREADY_EXISTS);
        }
        
        ExportReceipt savedReceipt = exportReceiptRepository.save(exportReceipt);
        return ApiResponse.created("Tạo phiếu xuất hàng thành công", savedReceipt);
    }
}