import api from './api.js';
import { API_CONFIG } from '../constants/api.js';

/**
 * Import Receipt Service
 * Tương ứng với ImportReceiptController.java
 * 
 * Backend Endpoints:
 * - GET / - Lấy tất cả phiếu nhập hàng
 * - GET /{id} - Lấy phiếu nhập theo ID  
 * - GET /by-date/{date} - Lấy phiếu nhập theo ngày
 * - POST / - Tạo phiếu nhập mới (CreateImportReceiptRequest)
 * - PUT / - Cập nhật phiếu nhập (ImportReceipt)
 * - PUT /quantity - Cập nhật số lượng (UpdateImportReceiptRequest)
 * 
 * Authentication: Bearer Token required
 * Roles: ADMIN, WAREHOUSE_ACCOUNTANT (read/write), VIEWER (read only)
 */

/**
 * Lấy tất cả phiếu nhập hàng
 * @returns {Promise<Object>} - ApiResponse chứa danh sách tất cả phiếu nhập
 */
export const getAllImportReceipts = async () => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.IMPORT_RECEIPTS.BASE);
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi getAllImportReceipts:', error);
    
    // Handle specific error cases
    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'Bạn không có quyền xem danh sách phiếu nhập hàng',
        error: error.response.data
      };
    }

    if (error.response?.status === 404) {
      return {
        success: true,
        data: [],
        message: 'Không có phiếu nhập hàng nào',
        code: 404
      };
    }

    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Không thể lấy danh sách phiếu nhập hàng',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Lấy phiếu nhập theo ID
 * @param {number} id - ID phiếu nhập hàng
 * @returns {Promise<Object>} - ApiResponse chứa thông tin phiếu nhập
 */
export const getImportReceiptById = async (id) => {
  try {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.IMPORT_RECEIPTS.GET_BY_ID}/${id}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi getImportReceiptById:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể lấy thông tin phiếu nhập',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Lấy danh sách phiếu nhập theo ngày
 * @param {string} date - Ngày nhập hàng (YYYY-MM-DD)
 * @returns {Promise<Object>} - ApiResponse chứa danh sách phiếu nhập
 */
export const getImportReceiptsByDate = async (date) => {
  try {
    console.log('🔍 Calling API:', `${API_CONFIG.ENDPOINTS.IMPORT_RECEIPTS.GET_BY_DATE}/${date}`);
    console.log('🔑 Auth token exists:', !!localStorage.getItem('authToken'));
    
    const response = await api.get(`${API_CONFIG.ENDPOINTS.IMPORT_RECEIPTS.GET_BY_DATE}/${date}`);
    
    console.log('✅ API Response:', response);
    console.log('📦 Response data:', response.data);
    
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('❌ Error getImportReceiptsByDate:', error);
    console.error('📄 Error response:', error.response);
    console.error('💾 Error response data:', error.response?.data);
    
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Không thể lấy danh sách phiếu nhập',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Tạo phiếu nhập hàng mới
 * @param {Object} createRequest - CreateImportReceiptRequest
 * @param {string} createRequest.createDate - Ngày tạo phiếu nhập
 * @param {number} createRequest.productID - ID sản phẩm
 * @param {number} createRequest.quantityImport - Số lượng nhập
 * @returns {Promise<Object>} - ApiResponse chứa phiếu nhập đã tạo
 */
export const createImportReceipt = async (createRequest) => {
  try {
    // Validate input - hỗ trợ cả single và multiple products
    if (!createRequest) {
      throw new Error('Thông tin tạo phiếu nhập không đầy đủ');
    }
    
    // Kiểm tra nếu là multiple products
    if (createRequest.importDetails && Array.isArray(createRequest.importDetails)) {
      if (createRequest.importDetails.length === 0) {
        throw new Error('Danh sách sản phẩm không được để trống');
      }
      // Validate từng item
      for (const item of createRequest.importDetails) {
        if (!item.productID || !item.quantityImport) {
          throw new Error('Thông tin sản phẩm không đầy đủ');
        }
      }
    } else {
      // Validate cho single product (backward compatibility)
      if (!createRequest.productID || !createRequest.quantityImport) {
        throw new Error('Thông tin tạo phiếu nhập không đầy đủ');
      }
    }

    const response = await api.post(API_CONFIG.ENDPOINTS.IMPORT_RECEIPTS.CREATE, createRequest);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi createImportReceipt:', error);
    
    // Handle validation errors
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response.data?.message || 'Dữ liệu đầu vào không hợp lệ',
        error: error.response.data,
        validationErrors: error.response.data?.errors
      };
    }

    // Handle forbidden access
    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'Bạn không có quyền tạo phiếu nhập hàng',
        error: error.response.data
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Không thể tạo phiếu nhập hàng',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Cập nhật thông tin phiếu nhập hàng
 * @param {Object} importReceipt - ImportReceipt object
 * @param {number} importReceipt.importReceiptId - ID phiếu nhập
 * @param {string} importReceipt.createDate - Ngày tạo
 * @param {number} importReceipt.totalAmount - Tổng tiền
 * @returns {Promise<Object>} - ApiResponse chứa phiếu nhập đã cập nhật
 */
export const updateImportReceipt = async (importReceipt) => {
  try {
    if (!importReceipt || !importReceipt.importReceiptId) {
      throw new Error('ID phiếu nhập không được để trống');
    }

    const response = await api.put(API_CONFIG.ENDPOINTS.IMPORT_RECEIPTS.UPDATE, importReceipt);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi updateImportReceipt:', error);
    
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Không tìm thấy phiếu nhập cần cập nhật',
        error: error.response.data
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'Bạn không có quyền cập nhật phiếu nhập hàng',
        error: error.response.data
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Không thể cập nhật phiếu nhập hàng',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Cập nhật số lượng nhập của phiếu nhập hàng
 * @param {Object} updateRequest - UpdateImportReceiptRequest
 * @param {number} updateRequest.importReceiptId - ID phiếu nhập
 * @param {number} updateRequest.quantityImport - Số lượng nhập mới
 * @returns {Promise<Object>} - ApiResponse chứa phiếu nhập đã cập nhật
 */
export const updateImportReceiptQuantity = async (updateRequest) => {
  try {
    if (!updateRequest || !updateRequest.importReceiptId || !updateRequest.quantityImport) {
      throw new Error('Thông tin cập nhật số lượng không đầy đủ');
    }

    const response = await api.put(API_CONFIG.ENDPOINTS.IMPORT_RECEIPTS.UPDATE_QUANTITY, updateRequest);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi updateImportReceiptQuantity:', error);
    
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Không tìm thấy phiếu nhập cần cập nhật',
        error: error.response.data
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'Bạn không có quyền cập nhật số lượng phiếu nhập',
        error: error.response.data
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Không thể cập nhật số lượng phiếu nhập',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Xóa phiếu nhập hàng (nếu backend có implement DELETE endpoint)
 * @param {number} importReceiptId - ID phiếu nhập cần xóa
 * @returns {Promise<Object>} - ApiResponse chứa thông báo thành công
 */
export const deleteImportReceipt = async (importReceiptId) => {
  try {
    if (!importReceiptId) {
      throw new Error('ID phiếu nhập không được để trống');
    }

    const response = await api.delete(`${API_CONFIG.ENDPOINTS.IMPORT_RECEIPTS.DELETE}/${importReceiptId}`);
    return {
      success: true,
      message: response.data.message,
      code: response.data.code
    };
  } catch (error) {
    console.error('Lỗi deleteImportReceipt:', error);
    
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Không tìm thấy phiếu nhập cần xóa',
        error: error.response.data
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'Bạn không có quyền xóa phiếu nhập hàng',
        error: error.response.data
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Không thể xóa phiếu nhập hàng',
      error: error.response?.data || error.message
    };
  }
};

/**
 * Helper function để format request cho tạo phiếu nhập
 * Hỗ trợ cả single product và multiple products
 * @param {Object} params
 * @param {number} [params.productId] - ID sản phẩm (cho single product - backward compatibility)
 * @param {number} [params.quantity] - Số lượng nhập (cho single product - backward compatibility)
 * @param {Array} [params.importDetails] - Danh sách chi tiết nhập (cho multiple products)
 * @param {string} params.date - Ngày nhập (optional, default = today)
 * @returns {Object} - CreateImportReceiptRequest
 */
export const formatCreateImportReceiptRequest = (params) => {
  const { productId, quantity, importDetails, date } = params;
  
  // Nếu có importDetails (multiple products), trả về format mới
  if (importDetails && Array.isArray(importDetails) && importDetails.length > 0) {
    return {
      createDate: date || new Date().toISOString().split('T')[0],
      importDetails: importDetails.map(item => ({
        productID: item.productId || item.productID,
        quantityImport: item.quantity || item.quantityImport
      }))
    };
  }
  
  // Nếu không có importDetails, sử dụng format cũ cho single product (backward compatibility)
  return {
    createDate: date || new Date().toISOString().split('T')[0],
    productID: productId,
    quantityImport: quantity
  };
};

/**
 * Helper function để format request cho cập nhật số lượng
 * @param {number} importReceiptId - ID phiếu nhập
 * @param {number} quantityImport - Số lượng nhập mới
 * @returns {Object} - UpdateImportReceiptRequest
 */
export const formatUpdateQuantityRequest = (importReceiptId, quantityImport) => {
  return {
    importReceiptId,
    quantityImport
  };
}; 