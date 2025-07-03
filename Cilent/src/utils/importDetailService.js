import api from './api.js';
import { API_CONFIG } from '../constants/api.js';

/**
 * Import Detail Service
 * Tương ứng với ImportDetailController.java
 * 
 * Backend Endpoints:
 * - GET /by-receipt/{importReceiptId} - Lấy chi tiết theo phiếu nhập
 * - GET /by-product/{productId} - Lấy chi tiết theo sản phẩm
 * - GET /search?importReceiptId={}&productId={} - Tìm chi tiết theo cả 2 tham số
 * - POST / - Tạo chi tiết nhập mới
 * 
 * Authentication: Bearer Token required
 * CORS: http://localhost:5173 with credentials
 */

/**
 * Lấy tất cả chi tiết nhập hàng theo ID phiếu nhập
 * @param {number} importReceiptId - ID phiếu nhập
 * @returns {Promise<Object>} - ApiResponse chứa danh sách chi tiết nhập hàng
 */
export const getImportDetailsByImportReceiptId = async (importReceiptId) => {
  try {
    if (!importReceiptId) {
      throw new Error('ID phiếu nhập không được để trống');
    }

    const response = await api.get(`${API_CONFIG.ENDPOINTS.IMPORT_DETAILS.GET_BY_RECEIPT}/${importReceiptId}`);
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi getImportDetailsByImportReceiptId:', error);

    if (error.response?.status === 404) {
      return {
        success: false,
        data: [],
        message: 'Không tìm thấy chi tiết phiếu nhập',
        error: error.response.data
      };
    }

    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Không thể lấy danh sách chi tiết nhập hàng',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Lấy tất cả chi tiết nhập hàng theo ID sản phẩm
 * @param {number} productId - ID sản phẩm
 * @returns {Promise<Object>} - ApiResponse chứa danh sách chi tiết nhập hàng
 */
export const getImportDetailsByProductId = async (productId) => {
  try {
    if (!productId) {
      throw new Error('ID sản phẩm không được để trống');
    }

    const response = await api.get(`${API_CONFIG.ENDPOINTS.IMPORT_DETAILS.GET_BY_PRODUCT}/${productId}`);
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi getImportDetailsByProductId:', error);

    if (error.response?.status === 404) {
      return {
        success: false,
        data: [],
        message: 'Không tìm thấy chi tiết nhập hàng cho sản phẩm này',
        error: error.response.data
      };
    }

    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Không thể lấy danh sách chi tiết nhập hàng theo sản phẩm',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Lấy chi tiết nhập hàng theo ID phiếu nhập và ID sản phẩm
 * @param {number} importReceiptId - ID phiếu nhập
 * @param {number} productId - ID sản phẩm
 * @returns {Promise<Object>} - ApiResponse chứa chi tiết nhập hàng
 */
export const getImportDetailByImportReceiptIdAndProductId = async (importReceiptId, productId) => {
  try {
    if (!importReceiptId || !productId) {
      throw new Error('ID phiếu nhập và ID sản phẩm không được để trống');
    }

    const params = new URLSearchParams({
      importReceiptId: importReceiptId.toString(),
      productId: productId.toString()
    });

    const response = await api.get(`${API_CONFIG.ENDPOINTS.IMPORT_DETAILS.SEARCH}?${params}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi getImportDetailByImportReceiptIdAndProductId:', error);

    if (error.response?.status === 404) {
      return {
        success: false,
        data: null,
        message: 'Không tìm thấy chi tiết nhập hàng',
        error: error.response.data
      };
    }

    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Không thể lấy chi tiết nhập hàng',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Tạo chi tiết nhập hàng mới
 * @param {Object} importDetail - Chi tiết nhập hàng cần tạo
 * @param {Object} importDetail.importReceipt - Object phiếu nhập có importReceiptId
 * @param {Object} importDetail.product - Object sản phẩm có productId
 * @param {number} importDetail.quantityImport - Số lượng nhập
 * @param {number} importDetail.importPrice - Giá nhập
 * @returns {Promise<Object>} - ApiResponse chứa chi tiết nhập hàng đã tạo
 */
export const createImportDetail = async (importDetail) => {
  try {
    // Validate input
    if (!importDetail) {
      throw new Error('Thông tin chi tiết nhập hàng không được để trống');
    }

    if (!importDetail.importReceipt?.importReceiptId || !importDetail.product?.productId) {
      throw new Error('ID phiếu nhập và ID sản phẩm không được để trống');
    }

    if (!importDetail.quantityImport || importDetail.quantityImport <= 0) {
      throw new Error('Số lượng nhập phải lớn hơn 0');
    }

    const response = await api.post(API_CONFIG.ENDPOINTS.IMPORT_DETAILS.CREATE, importDetail);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi createImportDetail:', error);

    // Handle validation errors
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response.data?.message || 'Dữ liệu đầu vào không hợp lệ',
        error: error.response.data,
        validationErrors: error.response.data?.errors
      };
    }

    // Handle conflict - chi tiết đã tồn tại
    if (error.response?.status === 409) {
      return {
        success: false,
        message: 'Chi tiết nhập hàng cho sản phẩm này đã tồn tại trong phiếu nhập',
        error: error.response.data
      };
    }

    // Handle forbidden access
    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'Bạn không có quyền tạo chi tiết nhập hàng',
        error: error.response.data
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Không thể tạo chi tiết nhập hàng',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Cập nhật chi tiết nhập hàng (nếu backend có implement PUT endpoint)
 * @param {Object} importDetail - Chi tiết nhập hàng cần cập nhật
 * @returns {Promise<Object>} - ApiResponse chứa chi tiết nhập hàng đã cập nhật
 */
export const updateImportDetail = async (importDetail) => {
  try {
    if (!importDetail || !importDetail.importReceipt?.importReceiptId || !importDetail.product?.productId) {
      throw new Error('Thông tin cập nhật chi tiết nhập hàng không đầy đủ');
    }

    const response = await api.put(API_CONFIG.ENDPOINTS.IMPORT_DETAILS.UPDATE, importDetail);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi updateImportDetail:', error);

    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Không tìm thấy chi tiết nhập hàng cần cập nhật',
        error: error.response.data
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'Bạn không có quyền cập nhật chi tiết nhập hàng',
        error: error.response.data
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Không thể cập nhật chi tiết nhập hàng',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Xóa chi tiết nhập hàng (nếu backend có implement DELETE endpoint)
 * @param {number} importReceiptId - ID phiếu nhập
 * @param {number} productId - ID sản phẩm
 * @returns {Promise<Object>} - ApiResponse chứa thông báo thành công
 */
export const deleteImportDetail = async (importReceiptId, productId) => {
  try {
    if (!importReceiptId || !productId) {
      throw new Error('ID phiếu nhập và ID sản phẩm không được để trống');
    }

    const params = new URLSearchParams({
      importReceiptId: importReceiptId.toString(),
      productId: productId.toString()
    });

    const response = await api.delete(`${API_CONFIG.ENDPOINTS.IMPORT_DETAILS.DELETE}?${params}`);
    return {
      success: true,
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi deleteImportDetail:', error);

    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Không tìm thấy chi tiết nhập hàng cần xóa',
        error: error.response.data
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'Bạn không có quyền xóa chi tiết nhập hàng',
        error: error.response.data
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Không thể xóa chi tiết nhập hàng',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Helper function để format ImportDetail object cho tạo mới
 * @param {Object} params
 * @param {number} params.importReceiptId - ID phiếu nhập
 * @param {number} params.productId - ID sản phẩm
 * @param {number} params.quantityImport - Số lượng nhập
 * @param {number} params.importPrice - Giá nhập (optional, có thể lấy từ product)
 * @returns {Object} - ImportDetail object
 */
export const formatImportDetailRequest = (params) => {
  const { importReceiptId, productId, quantityImport, importPrice } = params;
  
  const importDetail = {
    importReceipt: {
      importReceiptId
    },
    product: {
      productId
    },
    quantityImport
  };

  // Thêm importPrice nếu có
  if (importPrice) {
    importDetail.importPrice = importPrice;
  }

  return importDetail;
};

/**
 * Helper function để tính tổng tiền từ danh sách chi tiết nhập
 * @param {Array} importDetails - Danh sách chi tiết nhập
 * @returns {number} - Tổng tiền
 */
export const calculateTotalAmount = (importDetails) => {
  if (!Array.isArray(importDetails)) {
    return 0;
  }

  return importDetails.reduce((total, detail) => {
    return total + (detail.intoMoney || detail.quantityImport * detail.importPrice || 0);
  }, 0);
};

/**
 * Helper function để validate ImportDetail trước khi gửi request
 * @param {Object} importDetail - Chi tiết nhập hàng
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
export const validateImportDetail = (importDetail) => {
  const errors = [];

  if (!importDetail) {
    errors.push('Thông tin chi tiết nhập hàng không được để trống');
    return { isValid: false, errors };
  }

  if (!importDetail.importReceipt?.importReceiptId) {
    errors.push('ID phiếu nhập không được để trống');
  }

  if (!importDetail.product?.productId) {
    errors.push('ID sản phẩm không được để trống');
  }

  if (!importDetail.quantityImport || importDetail.quantityImport <= 0) {
    errors.push('Số lượng nhập phải lớn hơn 0');
  }

  if (importDetail.importPrice && importDetail.importPrice < 0) {
    errors.push('Giá nhập không được âm');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 