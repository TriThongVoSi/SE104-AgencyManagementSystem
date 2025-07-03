package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.Unit;
import org.example.AgentManagementBE.Model.Product;
import org.example.AgentManagementBE.Model.Parameter;
import org.example.AgentManagementBE.Repository.UnitRepository;
import org.example.AgentManagementBE.Repository.ProductRepository;
import org.example.AgentManagementBE.Repository.ParameterRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.DTO.request.CreateProductRequest;
import org.example.AgentManagementBE.DTO.request.UpdateImportPriceRequest;
import org.example.AgentManagementBE.DTO.request.UpdateInventoryQuantityRequest;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;
    private final ParameterRepository parameterRepository;

    public ProductService(ProductRepository productRepository, UnitRepository unitRepository, ParameterRepository parameterRepository) {
        this.productRepository = productRepository;
        this.unitRepository = unitRepository;
        this.parameterRepository = parameterRepository;
    }

    public ApiResponse<Product> getProductById(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return ApiResponse.success("Tìm thấy sản phẩm thành công", product);
    }

    public ApiResponse<Integer> getInventoryQuantityByProductName(String productName) {
        if (productName == null || productName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Integer quantity = productRepository.findInventoryQuantityByName(productName)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return ApiResponse.success("Lấy số lượng tồn kho thành công", quantity);
    }

    public ApiResponse<Integer> getInventoryQuantityByProductNameAndUnit(String productName, String unitName) {
        if (productName == null || productName.trim().isEmpty() || unitName == null || unitName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Integer quantity = productRepository.findInventoryQuantityByNameAndUnit(productName, unitName)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, 
                    "Không tìm thấy sản phẩm '" + productName + "' với đơn vị '" + unitName + "'"));

        return ApiResponse.success("Lấy số lượng tồn kho thành công", quantity);
    }

    @Transactional
    public ApiResponse<Product> createProduct(CreateProductRequest request) {
        if (request == null || request.getProductName() == null || request.getProductName().trim().isEmpty()
                || request.getUnitName() == null || request.getUnitName().trim().isEmpty()
                || request.getImportPrice() == null || request.getImportPrice() <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra sản phẩm có cùng tên và cùng đơn vị đã tồn tại chưa
        if (productRepository.existsByProductNameAndUnitName(request.getProductName(), request.getUnitName())) {
            throw new AppException(ErrorCode.PRODUCT_ALREADY_EXISTS, 
                "Sản phẩm '" + request.getProductName() + "' với đơn vị '" + request.getUnitName() + "' đã tồn tại");
        }

        Unit existingUnit = unitRepository.findByUnitName(request.getUnitName())
                .orElseGet(() -> unitRepository.save(new Unit(request.getUnitName())));

        Integer exportPrice = calculateExportPrice(request.getImportPrice());

        Product newProduct = new Product();
        newProduct.setProductName(request.getProductName());
        newProduct.setUnit(existingUnit);
        newProduct.setImportPrice(request.getImportPrice());
        newProduct.setExportPrice(exportPrice);
        newProduct.setInventoryQuantity(0);

        Product savedProduct = productRepository.save(newProduct);
        return ApiResponse.created("Tạo sản phẩm mới thành công", savedProduct);
    }

    /**
     * Tính toán giá xuất dựa trên giá nhập và tỷ lệ export_price_ratio từ parameter
     */
    private Integer calculateExportPrice(Integer importPrice) {
        try {
            // Lấy tỷ lệ export_price_ratio từ parameter
            Parameter exportRatioParam = parameterRepository.findByParamKey("export_price_ratio");
            
            double ratio;
            if (exportRatioParam != null) {
                ratio = Double.parseDouble(exportRatioParam.getParamValue());
            } else {
                // Nếu không tìm thấy parameter, sử dụng giá trị mặc định và tạo parameter mới
                ratio = 1.02; // Giá trị mặc định
                Parameter defaultParam = new Parameter("export_price_ratio", "1.02", "Tỷ lệ đơn giá xuất so với đơn giá nhập");
                parameterRepository.save(defaultParam);
            }
            
            return (int) Math.round(importPrice * ratio);
        } catch (NumberFormatException e) {
            // Nếu parameter có giá trị không hợp lệ, sử dụng giá trị mặc định
            return (int) Math.round(importPrice * 1.02);
        }
    }

    @Transactional
    public ApiResponse<Product> createProduct(Product newProduct) {
        if (newProduct == null || newProduct.getProductName() == null || newProduct.getProductName().trim().isEmpty()
                || newProduct.getUnit() == null || newProduct.getUnit().getUnitName() == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra sản phẩm có cùng tên và cùng đơn vị đã tồn tại chưa
        if (productRepository.existsByProductNameAndUnitName(newProduct.getProductName(), newProduct.getUnit().getUnitName())) {
            throw new AppException(ErrorCode.PRODUCT_ALREADY_EXISTS, 
                "Sản phẩm '" + newProduct.getProductName() + "' với đơn vị '" + newProduct.getUnit().getUnitName() + "' đã tồn tại");
        }

        Unit existingUnit = unitRepository.findByUnitName(newProduct.getUnit().getUnitName())
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));

        newProduct.setUnit(existingUnit);
        
        // Tự động tính exportPrice dựa trên tỷ lệ từ parameter
        if (newProduct.getImportPrice() != null) {
            Integer exportPrice = calculateExportPrice(newProduct.getImportPrice());
            newProduct.setExportPrice(exportPrice);
        }

        Product savedProduct = productRepository.save(newProduct);
        return ApiResponse.created("Tạo sản phẩm mới thành công", savedProduct);
    }

    public ApiResponse<List<Product>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        return ApiResponse.success("Lấy danh sách sản phẩm thành công", products);
    }

    @Transactional
    public ApiResponse<Product> increaseInventory(Integer productId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new AppException(ErrorCode.NUMBER_NEGATIVE);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setInventoryQuantity(product.getInventoryQuantity() + quantity);
        Product updatedProduct = productRepository.save(product);

        return ApiResponse.success("Tăng số lượng tồn kho thành công", updatedProduct);
    }

    @Transactional
    public ApiResponse<Product> decreaseInventory(Integer productId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new AppException(ErrorCode.NUMBER_NEGATIVE);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getInventoryQuantity() < quantity) {
            throw new AppException(ErrorCode.INSUFFICIENT_INVENTORY);
        }

        product.setInventoryQuantity(product.getInventoryQuantity() - quantity);
        Product updatedProduct = productRepository.save(product);

        return ApiResponse.success("Giảm số lượng tồn kho thành công", updatedProduct);
    }

    @Transactional
    public ApiResponse<Product> updateProduct(Integer productId, CreateProductRequest request) {
        if (request == null || request.getProductName() == null || request.getProductName().trim().isEmpty()
                || request.getUnitName() == null || request.getUnitName().trim().isEmpty()
                || request.getImportPrice() == null || request.getImportPrice() <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Kiểm tra tên sản phẩm và đơn vị trùng lặp (trừ sản phẩm hiện tại)
        boolean isDifferentProductName = !existingProduct.getProductName().equals(request.getProductName());
        boolean isDifferentUnit = !existingProduct.getUnit().getUnitName().equals(request.getUnitName());
        
        if ((isDifferentProductName || isDifferentUnit) && 
            productRepository.existsByProductNameAndUnitName(request.getProductName(), request.getUnitName())) {
            throw new AppException(ErrorCode.PRODUCT_ALREADY_EXISTS, 
                "Sản phẩm '" + request.getProductName() + "' với đơn vị '" + request.getUnitName() + "' đã tồn tại");
        }

        Unit existingUnit = unitRepository.findByUnitName(request.getUnitName())
                .orElseGet(() -> unitRepository.save(new Unit(request.getUnitName())));

        // Tự động tính exportPrice dựa trên tỷ lệ từ parameter
        Integer exportPrice = calculateExportPrice(request.getImportPrice());

        existingProduct.setProductName(request.getProductName());
        existingProduct.setUnit(existingUnit);
        existingProduct.setImportPrice(request.getImportPrice());
        existingProduct.setExportPrice(exportPrice);

        Product updatedProduct = productRepository.save(existingProduct);
        return ApiResponse.success("Cập nhật sản phẩm thành công", updatedProduct);
    }

    /**
     * Cập nhật lại tất cả giá xuất của sản phẩm dựa trên tỷ lệ hiện tại
     */
    @Transactional
    public ApiResponse<String> refreshAllProductExportPrices() {
        try {
            List<Product> products = productRepository.findAll();
            
            for (Product product : products) {
                Integer newExportPrice = calculateExportPrice(product.getImportPrice());
                product.setExportPrice(newExportPrice);
            }
            
            productRepository.saveAll(products);
            
            return ApiResponse.success("Cập nhật giá xuất cho tất cả sản phẩm thành công", 
                "Đã cập nhật " + products.size() + " sản phẩm");
                
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật giá xuất: " + e.getMessage());
        }
    }

    /**
     * Lấy tỷ lệ export_price_ratio hiện tại
     */
    public double getCurrentExportPriceRatio() {
        try {
            Parameter exportRatioParam = parameterRepository.findByParamKey("export_price_ratio");
            if (exportRatioParam != null) {
                return Double.parseDouble(exportRatioParam.getParamValue());
            } else {
                return 1.02; // Giá trị mặc định
            }
        } catch (NumberFormatException e) {
            return 1.02; // Giá trị mặc định nếu có lỗi
        }
    }

    /**
     * Xóa sản phẩm
     * Chỉ có thể xóa sản phẩm nếu không có dữ liệu giao dịch liên quan (ImportDetail, ExportDetail)
     */
    @Transactional
    public ApiResponse<String> deleteProduct(Integer productId) {
        if (productId == null || productId <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra sản phẩm có tồn tại không
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Kiểm tra sản phẩm có đang được sử dụng trong các giao dịch không
        if (productRepository.hasImportDetails(productId)) {
            throw new AppException(ErrorCode.FORM_IN_USE, "Không thể xóa sản phẩm đã có phiếu nhập");
        }

        if (productRepository.hasExportDetails(productId)) {
            throw new AppException(ErrorCode.FORM_IN_USE, "Không thể xóa sản phẩm đã có phiếu xuất");
        }

        // Kiểm tra số lượng tồn kho
        if (product.getInventoryQuantity() > 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_INVENTORY, 
                "Không thể xóa sản phẩm còn tồn kho. Số lượng hiện tại: " + product.getInventoryQuantity());
        }

        try {
            productRepository.delete(product);
            return ApiResponse.success("Xóa sản phẩm thành công", 
                "Sản phẩm '" + product.getProductName() + "' đã được xóa");
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, 
                "Lỗi khi xóa sản phẩm: " + e.getMessage());
        }
    }

    /**
     * Cập nhật giá nhập của sản phẩm và tự động tính lại giá xuất
     */
    @Transactional
    public ApiResponse<Product> updateImportPrice(Integer productId, UpdateImportPriceRequest request) {
        if (request == null || request.getImportPrice() == null || request.getImportPrice() <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra sản phẩm có tồn tại không
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Lưu giá nhập cũ để log
        Integer oldImportPrice = product.getImportPrice();
        Integer oldExportPrice = product.getExportPrice();

        // Cập nhật giá nhập mới
        product.setImportPrice(request.getImportPrice());

        // Tự động tính lại giá xuất dựa trên tỷ lệ hiện tại
        Integer newExportPrice = calculateExportPrice(request.getImportPrice());
        product.setExportPrice(newExportPrice);

        // Lưu thay đổi
        Product updatedProduct = productRepository.save(product);

        return ApiResponse.success(
            String.format("Cập nhật giá nhập thành công. Giá nhập: %d → %d, Giá xuất: %d → %d", 
                oldImportPrice, request.getImportPrice(), oldExportPrice, newExportPrice), 
            updatedProduct
        );
    }

    /**
     * Cập nhật trực tiếp số lượng tồn kho
     */
    @Transactional
    public ApiResponse<Product> updateInventoryQuantity(Integer productId, UpdateInventoryQuantityRequest request) {
        if (request == null || request.getInventoryQuantity() == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số lượng tồn kho không được để trống");
        }

        if (request.getInventoryQuantity() < 0) {
            throw new AppException(ErrorCode.NUMBER_NEGATIVE, "Số lượng tồn kho không được âm");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        Integer oldQuantity = product.getInventoryQuantity();
        product.setInventoryQuantity(request.getInventoryQuantity());
        Product updatedProduct = productRepository.save(product);

        return ApiResponse.success(
            String.format("Cập nhật số lượng tồn kho thành công: %d → %d", 
                oldQuantity, request.getInventoryQuantity()), 
            updatedProduct
        );
    }

    public ApiResponse<List<Product>> getProductsByName(String productName) {
        if (productName == null || productName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        List<Product> products = productRepository.findAllByProductName(productName);
        if (products.isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, 
                "Không tìm thấy sản phẩm nào có tên '" + productName + "'");
        }
        
        return ApiResponse.success("Lấy danh sách sản phẩm theo tên thành công", products);
    }
}