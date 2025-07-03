package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.ImportReceipt;
import org.example.AgentManagementBE.Model.ImportDetail;
import org.example.AgentManagementBE.Model.Product;
import org.example.AgentManagementBE.Repository.ImportReceiptRepository;
import org.example.AgentManagementBE.Repository.ImportDetailRepository;
import org.example.AgentManagementBE.Repository.ProductRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.request.CreateImportReceiptRequest;
import org.example.AgentManagementBE.DTO.request.CreateImportReceiptWithMultipleProductsRequest;
import org.example.AgentManagementBE.DTO.request.ImportDetailRequest;
import org.example.AgentManagementBE.DTO.request.UpdateImportReceiptRequest;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

/**
 * Service xử lý logic liên quan đến phiếu nhập hàng
 */
@Service
public class ImportReceiptService {
    private final ImportReceiptRepository importReceiptRepository;
    private final ImportDetailRepository importDetailRepository;
    private final ProductRepository productRepository;

    @Autowired
    public ImportReceiptService(ImportReceiptRepository importReceiptRepository, 
                               ImportDetailRepository importDetailRepository,
                               ProductRepository productRepository) {
        this.importReceiptRepository = importReceiptRepository;
        this.importDetailRepository = importDetailRepository;
        this.productRepository = productRepository;
    }

    /**
     * Lấy tất cả phiếu nhập hàng
     * @return ApiResponse chứa danh sách phiếu nhập hàng
     */
    public ApiResponse<List<ImportReceipt>> getAllImportReceipts() {
        List<ImportReceipt> receipts = importReceiptRepository.findAll();
        if (receipts.isEmpty()) {
            throw new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách phiếu nhập hàng thành công", receipts);
    }

    /**
     * Lấy phiếu nhập hàng theo ID
     * @param importReceiptId ID của phiếu nhập hàng
     * @return ApiResponse chứa phiếu nhập hàng
     */
    public ApiResponse<ImportReceipt> getImportReceiptById(Integer importReceiptId) {
        ImportReceipt receipt = importReceiptRepository.findById(importReceiptId)
            .orElseThrow(() -> new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND));
        return ApiResponse.success("Lấy phiếu nhập hàng thành công", receipt);
    }

    /**
     * Lấy phiếu nhập hàng theo ngày
     * @param dateReceipt Ngày cần tìm (format: yyyy-MM-dd)
     * @return ApiResponse chứa danh sách phiếu nhập hàng
     */
    public ApiResponse<List<ImportReceipt>> getImportReceiptsByDate(String dateReceipt) {
        try {
            // Convert String to LocalDate
            LocalDate localDate = LocalDate.parse(dateReceipt);
            List<ImportReceipt> receipts = importReceiptRepository.findByCreateDate(localDate);
            if (receipts.isEmpty()) {
                throw new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND);
            }
            return ApiResponse.success("Lấy danh sách phiếu nhập hàng theo ngày thành công", receipts);
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw e;
            }
            throw new AppException(ErrorCode.BAD_REQUEST, "Định dạng ngày không hợp lệ. Vui lòng sử dụng format yyyy-MM-dd");
        }
    }

    /**
     * Lấy phiếu nhập hàng theo tháng và năm
     * @param month Tháng cần tìm
     * @param year Năm cần tìm
     * @return ApiResponse chứa danh sách phiếu nhập hàng
     */
    public ApiResponse<List<ImportReceipt>> getImportReceiptsByMonthAndYear(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        List<ImportReceipt> receipts = importReceiptRepository.findByMonthAndYear(month, year);
        if (receipts.isEmpty()) {
            throw new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách phiếu nhập hàng theo tháng và năm thành công", receipts);
    }

    /**
     * Tạo phiếu nhập hàng mới với DTO request
     * @param request DTO request chứa thông tin cần thiết
     * @return ApiResponse chứa phiếu nhập hàng đã tạo
     */
    @Transactional
    public ApiResponse<ImportReceipt> createImportReceiptWithDetails(CreateImportReceiptRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Request không được để trống");
        }

        // Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(request.getProductID())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Lấy import price từ product
        Integer importPrice = product.getImportPrice();
        
        // Tính totalAmount tự động
        Integer totalAmount = request.getQuantityImport() * importPrice;

        // Tạo ImportReceipt
        ImportReceipt importReceipt = new ImportReceipt();
        importReceipt.setCreateDate(request.getCreateDate());
        importReceipt.setTotalAmount(totalAmount);

        // Lưu ImportReceipt trước
        ImportReceipt savedReceipt = importReceiptRepository.save(importReceipt);

        // Tạo ImportDetail
        ImportDetail importDetail = new ImportDetail();
        importDetail.setImportReceipt(savedReceipt);
        importDetail.setProduct(product);
        importDetail.setQuantityImport(request.getQuantityImport());
        importDetail.setImportPrice(importPrice);
        importDetail.setIntoMoney(totalAmount);

        // Lưu ImportDetail
        importDetailRepository.save(importDetail);

        // Cập nhật inventory của Product
        Integer currentInventory = product.getInventoryQuantity();
        product.setInventoryQuantity(currentInventory + request.getQuantityImport());
        productRepository.save(product);

        return ApiResponse.created("Tạo phiếu nhập hàng thành công", savedReceipt);
    }

    /**
     * Tạo phiếu nhập hàng mới (method cũ cho tương thích ngược)
     * @param importReceipt Phiếu nhập hàng cần tạo
     * @return ApiResponse chứa phiếu nhập hàng đã tạo
     */
    @Transactional
    public ApiResponse<ImportReceipt> createImportReceipt(ImportReceipt importReceipt) {
        // Kiểm tra phiếu nhập đã tồn tại
        if (importReceipt.getImportReceiptId() != null && 
            importReceiptRepository.existsById(importReceipt.getImportReceiptId())) {
            throw new AppException(ErrorCode.IMPORT_RECEIPT_ALREADY_EXISTS);
        }
        
        ImportReceipt savedReceipt = importReceiptRepository.save(importReceipt);
        return ApiResponse.created("Tạo phiếu nhập hàng thành công", savedReceipt);
    }

    /**
     * Cập nhật phiếu nhập hàng
     * @param importReceipt Phiếu nhập hàng cần cập nhật
     * @return ApiResponse chứa phiếu nhập hàng đã cập nhật
     */
    @Transactional
    public ApiResponse<ImportReceipt> updateImportReceipt(ImportReceipt importReceipt) {
        ImportReceipt existingReceipt = importReceiptRepository.findById(importReceipt.getImportReceiptId())
            .orElseThrow(() -> new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND));

        // Cập nhật thông tin
        existingReceipt.setCreateDate(importReceipt.getCreateDate());
        existingReceipt.setTotalAmount(importReceipt.getTotalAmount());

        ImportReceipt updatedReceipt = importReceiptRepository.save(existingReceipt);
        return ApiResponse.success("Cập nhật phiếu nhập hàng thành công", updatedReceipt);
    }

    /**
     * Xóa phiếu nhập hàng
     * @param importReceiptId ID của phiếu nhập hàng cần xóa
     * @return ApiResponse chứa thông báo thành công
     */
    @Transactional
    public ApiResponse<Void> deleteImportReceipt(Integer importReceiptId) {
        // Kiểm tra phiếu nhập có tồn tại không
        ImportReceipt receipt = importReceiptRepository.findById(importReceiptId)
            .orElseThrow(() -> new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND));
        
        // Lấy danh sách các ImportDetail để xử lý inventory
        List<ImportDetail> importDetails = importDetailRepository.findByImportReceipt_ImportReceiptId(importReceiptId);
        
        // Trừ lại inventory của các sản phẩm
        for (ImportDetail detail : importDetails) {
            Product product = detail.getProduct();
            Integer currentInventory = product.getInventoryQuantity();
            Integer quantityToSubtract = detail.getQuantityImport();
            
            // Kiểm tra xem có đủ inventory để trừ không
            if (currentInventory < quantityToSubtract) {
                throw new AppException(ErrorCode.BAD_REQUEST, 
                    "Không thể xóa phiếu nhập hàng. Số lượng tồn kho hiện tại của sản phẩm '" 
                    + product.getProductName() + "' (" + currentInventory + ") " +
                    "không đủ để trừ số lượng đã nhập (" + quantityToSubtract + ")");
            }
            
            // Cập nhật inventory
            product.setInventoryQuantity(currentInventory - quantityToSubtract);
            productRepository.save(product);
        }
        
        // Xóa các ImportDetail trước
        importDetailRepository.deleteAll(importDetails);
        
        // Xóa ImportReceipt
        importReceiptRepository.delete(receipt);
        
        return ApiResponse.success("Xóa phiếu nhập hàng thành công", null);
    }

    /**
     * Tính tổng tiền của phiếu nhập hàng
     * @param importReceiptId ID của phiếu nhập hàng
     * @return ApiResponse chứa tổng tiền
     */
    public ApiResponse<Integer> calculateTotalAmount(Integer importReceiptId) {
        ImportReceipt receipt = importReceiptRepository.findById(importReceiptId)
            .orElseThrow(() -> new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND));
            
        Integer totalAmount = importReceiptRepository.calculateTotalMoney(importReceiptId);
        return ApiResponse.success("Tính tổng tiền phiếu nhập hàng thành công", totalAmount);
    }

    /**
     * Lấy tổng tiền nhập hàng theo tháng và năm
     * @param month Tháng cần tìm
     * @param year Năm cần tìm
     * @return ApiResponse chứa tổng tiền
     */
    public ApiResponse<Integer> getTotalMoneyByMonthAndYear(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tháng không hợp lệ");
        }
        if (year == null || year < 1900 || year > 2100) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Năm không hợp lệ");
        }

        Integer totalMoney = importReceiptRepository.getTotalMoneyByMonthAndYear(month, year);
        return ApiResponse.success("Lấy tổng tiền nhập hàng theo tháng và năm thành công", totalMoney);
    }

    /**
     * Cập nhật số lượng nhập của phiếu nhập hàng
     * @param request DTO request chứa importReceiptId và quantityImport mới
     * @return ApiResponse chứa phiếu nhập hàng đã cập nhật
     */
    @Transactional
    public ApiResponse<ImportReceipt> updateImportReceiptQuantity(UpdateImportReceiptRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Request không được để trống");
        }

        // Tìm ImportReceipt để kiểm tra tồn tại
        ImportReceipt existingReceipt = importReceiptRepository.findById(request.getImportReceiptId())
                .orElseThrow(() -> new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND));

        // Tìm ImportDetail theo ImportReceiptId
        List<ImportDetail> importDetails = importDetailRepository.findByImportReceipt_ImportReceiptId(request.getImportReceiptId());
        
        if (importDetails.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy chi tiết phiếu nhập");
        }
        
        // Lấy ImportDetail đầu tiên (giả sử mỗi phiếu nhập chỉ có 1 detail)
        ImportDetail importDetail = importDetails.get(0);

        // Lấy thông tin Product và importPrice
        Product product = importDetail.getProduct();
        Integer importPrice = product.getImportPrice();
        
        // Lưu quantity cũ để cập nhật inventory
        Integer oldQuantity = importDetail.getQuantityImport();
        Integer newQuantity = request.getQuantityImport();
        
        // Tính totalAmount mới
        Integer newTotalAmount = newQuantity * importPrice;

        // Cập nhật ImportDetail
        importDetail.setQuantityImport(newQuantity);
        importDetail.setIntoMoney(newTotalAmount);
        importDetailRepository.save(importDetail);

        // Cập nhật chỉ totalAmount của ImportReceipt bằng query
        importReceiptRepository.updateTotalAmount(request.getImportReceiptId(), newTotalAmount);

        // Cập nhật inventory của Product: trừ quantity cũ, cộng quantity mới
        Integer currentInventory = product.getInventoryQuantity();
        Integer newInventory = currentInventory - oldQuantity + newQuantity;
        product.setInventoryQuantity(newInventory);
        productRepository.save(product);

        // Load lại ImportReceipt sau khi update để trả về response
        ImportReceipt updatedReceipt = importReceiptRepository.findById(request.getImportReceiptId())
                .orElseThrow(() -> new AppException(ErrorCode.IMPORT_RECEIPT_NOT_FOUND));

        return ApiResponse.success("Cập nhật phiếu nhập hàng thành công", updatedReceipt);
    }

    /**
     * Tạo phiếu nhập hàng mới với nhiều mặt hàng
     * @param request DTO request chứa thông tin cần thiết cho nhiều mặt hàng
     * @return ApiResponse chứa phiếu nhập hàng đã tạo
     */
    @Transactional
    public ApiResponse<ImportReceipt> createImportReceiptWithMultipleProducts(CreateImportReceiptWithMultipleProductsRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Request không được để trống");
        }

        if (request.getImportDetails() == null || request.getImportDetails().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Danh sách mặt hàng không được để trống");
        }

        // Tạo ImportReceipt trước
        ImportReceipt importReceipt = new ImportReceipt();
        importReceipt.setCreateDate(request.getCreateDate());
        importReceipt.setTotalAmount(0); // Sẽ tính sau

        // Lưu ImportReceipt trước để có ID
        ImportReceipt savedReceipt = importReceiptRepository.save(importReceipt);

        List<ImportDetail> importDetailList = new ArrayList<>();
        Integer totalAmount = 0;

        // Xử lý từng mặt hàng
        for (ImportDetailRequest detailRequest : request.getImportDetails()) {
            // Kiểm tra sản phẩm tồn tại
            Product product = productRepository.findById(detailRequest.getProductID())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, 
                        "Không tìm thấy sản phẩm với ID: " + detailRequest.getProductID()));

            // Kiểm tra sản phẩm có trùng trong cùng một phiếu nhập không
            boolean isDuplicate = importDetailList.stream()
                    .anyMatch(detail -> detail.getProduct().getProductId().equals(detailRequest.getProductID()));
            
            if (isDuplicate) {
                throw new AppException(ErrorCode.BAD_REQUEST, 
                    "Sản phẩm ID " + detailRequest.getProductID() + " đã tồn tại trong phiếu nhập này");
            }

            // Lấy import price từ product
            Integer importPrice = product.getImportPrice();
            
            // Tính intoMoney cho từng mặt hàng
            Integer intoMoney = detailRequest.getQuantityImport() * importPrice;

            // Tạo ImportDetail
            ImportDetail importDetail = new ImportDetail();
            importDetail.setImportReceipt(savedReceipt);
            importDetail.setProduct(product);
            importDetail.setQuantityImport(detailRequest.getQuantityImport());
            importDetail.setImportPrice(importPrice);
            importDetail.setIntoMoney(intoMoney);

            importDetailList.add(importDetail);
            totalAmount += intoMoney;

            // Cập nhật inventory của Product
            Integer currentInventory = product.getInventoryQuantity();
            product.setInventoryQuantity(currentInventory + detailRequest.getQuantityImport());
            productRepository.save(product);
        }

        // Lưu tất cả ImportDetail
        importDetailRepository.saveAll(importDetailList);

        // Cập nhật totalAmount cho ImportReceipt
        savedReceipt.setTotalAmount(totalAmount);
        ImportReceipt finalReceipt = importReceiptRepository.save(savedReceipt);

        return ApiResponse.created("Tạo phiếu nhập hàng với nhiều mặt hàng thành công", finalReceipt);
    }
}