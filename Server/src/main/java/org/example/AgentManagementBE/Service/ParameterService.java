package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Model.Product;
import org.example.AgentManagementBE.Model.Parameter;
import org.example.AgentManagementBE.Model.District;
import org.example.AgentManagementBE.Repository.ProductRepository;
import org.example.AgentManagementBE.Repository.ParameterRepository;
import org.example.AgentManagementBE.Repository.AgentRepository;
import org.example.AgentManagementBE.Repository.DistrictRepository;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.annotation.Lazy;

import java.util.List;
import java.util.ArrayList;

@Service
public class ParameterService {
    private final ParameterRepository parameterRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final AgentRepository agentRepository;
    private final DistrictRepository districtRepository;
    
    public ParameterService(ParameterRepository parameterRepository, 
                           ProductRepository productRepository,
                           @Lazy ProductService productService,
                           AgentRepository agentRepository,
                           DistrictRepository districtRepository) {
        this.parameterRepository = parameterRepository;
        this.productRepository = productRepository;
        this.productService = productService;
        this.agentRepository = agentRepository;
        this.districtRepository = districtRepository;
    }

    public ApiResponse<Parameter> addParameter(Parameter parameter) {
        if (parameter == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        if (parameter.getParamKey() == null || parameter.getParamKey().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Parameter existingParameter = parameterRepository.findByParamKey(parameter.getParamKey());
        if (existingParameter != null) {
            throw new AppException(ErrorCode.PARAMETER_ALREADY_EXISTS);
        }

        Parameter savedParameter = parameterRepository.save(parameter);
        return ApiResponse.created("Thêm tham số thành công", savedParameter);
    }

    public ApiResponse<Parameter> getParameter(String paramKey) {
        if (paramKey == null || paramKey.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Parameter parameter = parameterRepository.findByParamKey(paramKey);
        if (parameter == null) {
            throw new AppException(ErrorCode.PARAMETER_NOT_FOUND);
        }
        return ApiResponse.success("Lấy thông tin tham số thành công", parameter);
    }

    public ApiResponse<List<Parameter>> getAllParameters() {
        List<Parameter> parameters = parameterRepository.findAll();
        return ApiResponse.success("Lấy danh sách tham số thành công", parameters);
    }

    @Transactional
    public ApiResponse<Parameter> updateParameter(Parameter parameter) {
        if (parameter == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        if (parameter.getParamKey() == null || parameter.getParamKey().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Parameter existingParameter = parameterRepository.findByParamKey(parameter.getParamKey());
        if (existingParameter == null) {
            throw new AppException(ErrorCode.PARAMETER_NOT_FOUND);
        }

        if (parameter.getParamKey().equals("max_agent_per_district")) {
            try {
                int newValue = Integer.parseInt(parameter.getParamValue());
                int oldValue = Integer.parseInt(existingParameter.getParamValue());
                
                // Nếu giảm giới hạn, cần kiểm tra ràng buộc thực tế
                if (newValue < oldValue) {
                    // Lấy tất cả các quận và kiểm tra số đại lý hiện có
                    List<District> allDistricts = districtRepository.findAll();
                    List<String> violatingDistricts = new ArrayList<>();
                    
                    for (District district : allDistricts) {
                        long currentAgentCount = agentRepository.countByDistrictId(district.getDistrictId());
                        if (currentAgentCount > newValue) {
                            violatingDistricts.add(String.format("Quận '%s' hiện có %d đại lý", 
                                district.getDistrictName(), currentAgentCount));
                        }
                    }
                    
                    // Nếu có quận nào vi phạm, báo lỗi với thông tin chi tiết
                    if (!violatingDistricts.isEmpty()) {
                        String errorMessage = String.format(
                            "Không thể giảm giới hạn từ %d xuống %d đại lý/quận. " +
                            "Các quận sau đang vượt quá giới hạn mới: %s. " +
                            "Vui lòng xóa bớt đại lý hoặc tăng giới hạn.",
                            oldValue, newValue, String.join("; ", violatingDistricts)
                        );
                        throw new AppException(ErrorCode.INVALID_PARAMETER_VALUE, errorMessage);
                    }
                }
                
                // Cập nhật giá trị sau khi validate thành công
                existingParameter.setParamValue(parameter.getParamValue());
                if (parameter.getParamDescription() != null) {
                    existingParameter.setParamDescription(parameter.getParamDescription());
                }
                parameterRepository.save(existingParameter);
                
            } catch (NumberFormatException e) {
                throw new AppException(ErrorCode.INVALID_PARAMETER_VALUE, "Giá trị phải là một số nguyên hợp lệ");
            }
        } else if (parameter.getParamKey().equals("export_price_ratio")) {
            try {
                double newRatio = Double.parseDouble(parameter.getParamValue());
                
                if (newRatio <= 0) {
                    throw new AppException(ErrorCode.INVALID_PARAMETER_VALUE, "Tỷ lệ đơn giá xuất phải lớn hơn 0");
                }
                
                existingParameter.setParamValue(parameter.getParamValue());
                if (parameter.getParamDescription() != null) {
                    existingParameter.setParamDescription(parameter.getParamDescription());
                }
                parameterRepository.save(existingParameter);
                
                productService.refreshAllProductExportPrices();
                
            } catch (NumberFormatException e) {
                throw new AppException(ErrorCode.INVALID_PARAMETER_VALUE, "Giá trị tỷ lệ đơn giá xuất không hợp lệ - phải là số");
            }
        } else {
            existingParameter.setParamValue(parameter.getParamValue());
            if (parameter.getParamDescription() != null) {
                existingParameter.setParamDescription(parameter.getParamDescription());
            }
            parameterRepository.save(existingParameter);
        }

        return ApiResponse.success("Cập nhật tham số thành công", existingParameter);
    }

    /**
     * Áp dụng tỷ lệ đơn giá xuất cho tất cả sản phẩm
     */
    @Transactional
    public ApiResponse<String> applyExportPriceRatioToAllProducts() {
        try {
            // Lấy tỷ lệ hiện tại từ parameter
            Parameter exportRatioParam = parameterRepository.findByParamKey("export_price_ratio");
            if (exportRatioParam == null) {
                throw new AppException(ErrorCode.PARAMETER_NOT_FOUND, "Không tìm thấy tham số export_price_ratio");
            }

            double ratio = Double.parseDouble(exportRatioParam.getParamValue());
            
            // Áp dụng cho tất cả sản phẩm
            List<Product> products = productRepository.findAll();
            for (Product product : products) {
                int newExportPrice = (int) Math.round(product.getImportPrice() * ratio);
                product.setExportPrice(newExportPrice);
            }
            
            productRepository.saveAll(products);
            
            return ApiResponse.success("Áp dụng tỷ lệ đơn giá xuất cho " + products.size() + " sản phẩm thành công", 
                "Đã cập nhật " + products.size() + " sản phẩm với tỷ lệ " + ratio);
                
        } catch (NumberFormatException e) {
            throw new AppException(ErrorCode.INVALID_PARAMETER_VALUE, "Giá trị tỷ lệ đơn giá xuất không hợp lệ");
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi khi áp dụng tỷ lệ đơn giá xuất: " + e.getMessage());
        }
    }
}
