import { API_CONFIG } from '../constants/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

class ExportReceiptService {
  // Helper method để lấy token và tạo headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Helper method để xử lý response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔍 Error response data:', errorData);
      
      switch (response.status) {
        case 401:
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn');
        case 403:
          throw new Error('Bạn không có quyền thực hiện thao tác này');
        case 404:
          throw new Error(errorData.message || 'Không tìm thấy phiếu xuất hàng');
        case 400:
          throw new Error(errorData.message || 'Dữ liệu không hợp lệ');
        case 500:
          throw new Error(errorData.message || 'Lỗi hệ thống, vui lòng thử lại sau');
        default:
          throw new Error(errorData.message || 'Có lỗi xảy ra');
      }
    }
    return await response.json();
  }

  // GET /api/export-receipts - Lấy tất cả phiếu xuất
  async getAllExportReceipts() {
    try {
      const response = await fetch(`${API_BASE_URL}/export-receipts`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await this.handleResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error getting all export receipts:', error);
      throw error;
    }
  }

  // GET /api/export-receipts/{id} - Lấy phiếu xuất theo ID
  async getExportReceiptById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/export-receipts/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error getting export receipt by ID:', error);
      throw error;
    }
  }

  // GET /api/export-receipts/by-agent/{agentId} - Lấy phiếu xuất theo đại lý
  async getExportReceiptsByAgent(agentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/export-receipts/by-agent/${agentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await this.handleResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error getting export receipts by agent:', error);
      throw error;
    }
  }

  // POST /api/export-receipts - Tạo phiếu xuất mới
  async createExportReceipt(exportReceiptData) {
    try {
      console.log('🚀 Sending export receipt data:', exportReceiptData);
      console.log('🔑 Auth headers:', this.getAuthHeaders());
      
      // Determine which endpoint to use based on data structure
      let endpoint = 'export-receipts';
      if (exportReceiptData.exportDetails && Array.isArray(exportReceiptData.exportDetails)) {
        endpoint = 'export-receipts/multiple';
        console.log('🔄 Using multiple products endpoint');
      }
      
      const response = await fetch(`${API_BASE_URL}/export-receipts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(exportReceiptData),
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error creating export receipt:', error);
      throw error;
    }
  }

  // POST /api/export-receipts/legacy - Tạo phiếu xuất (legacy method)
  async createExportReceiptLegacy(exportReceiptData) {
    try {
      const response = await fetch(`${API_BASE_URL}/export-receipts/legacy`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(exportReceiptData),
      });
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error creating export receipt (legacy):', error);
      throw error;
    }
  }

  // PUT /api/export-receipts - Cập nhật phiếu xuất
  async updateExportReceipt(exportReceiptData) {
    try {
      const response = await fetch(`${API_BASE_URL}/export-receipts`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(exportReceiptData),
      });
      
      const result = await this.handleResponse(response);
      return {
        success: true,
        data: result.data,
        message: result.message || 'Cập nhật phiếu xuất thành công'
      };
    } catch (error) {
      console.error('Error updating export receipt:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi khi cập nhật phiếu xuất',
        error: error.message
      };
    }
  }

  // PUT /api/export-receipts/with-details - Cập nhật phiếu xuất với chi tiết
  async updateExportReceiptWithDetails(exportReceiptData) {
    try {
      console.log('🔄 Updating export receipt with details:', exportReceiptData);
      
      const response = await fetch(`${API_BASE_URL}/export-receipts/with-details`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(exportReceiptData),
      });
      
      const result = await this.handleResponse(response);
      return {
        success: true,
        data: result.data,
        message: result.message || 'Cập nhật phiếu xuất và chi tiết thành công'
      };
    } catch (error) {
      console.error('Error updating export receipt with details:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi khi cập nhật phiếu xuất',
        error: error.message,
        validationErrors: error.validationErrors || {}
      };
    }
  }

  // DELETE /api/export-receipts/{id} - Xóa phiếu xuất
  async deleteExportReceipt(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/export-receipts/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error deleting export receipt:', error);
      throw error;
    }
  }

  // GET /api/export-receipts/{id}/total-amount - Tính tổng tiền phiếu xuất
  async calculateTotalAmount(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/export-receipts/${id}/total-amount`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error calculating total amount:', error);
      throw error;
    }
  }
}

export default new ExportReceiptService();

/**
 * Helper function để format request tạo phiếu xuất hàng
 * @param {Object} data - Dữ liệu form
 * @param {string} data.date - Ngày tạo phiếu
 * @param {number} data.agentId - ID đại lý
 * @param {number} data.paidAmount - Số tiền đã trả
 * @param {Array} data.exportDetails - Danh sách chi tiết xuất hàng
 * @returns {Object} Request data formatted cho API
 */
export const formatCreateExportReceiptRequest = (data) => {
  return {
    createDate: data.date,
    agentId: parseInt(data.agentId),
    paidAmount: parseFloat(data.paidAmount) || 0,
    exportDetails: data.exportDetails.map(detail => ({
      productID: parseInt(detail.productId),
      quantityExport: parseInt(detail.quantity)
    }))
  };
};

/**
 * Function tạo phiếu xuất hàng với nhiều sản phẩm
 * @param {Object} requestData - Request data đã được format
 * @returns {Promise<Object>} Response với success/error status
 */
export const createMultipleExportReceipt = async (requestData) => {
  try {
    console.log('🚀 Creating export receipt with data:', requestData);
    
    // Import the default export
    const exportReceiptService = (await import('./exportReceiptService.js')).default;
    const result = await exportReceiptService.createExportReceipt(requestData);
    
    return {
      success: true,
      data: result,
      message: 'Tạo phiếu xuất hàng thành công!'
    };
  } catch (error) {
    console.error('❌ Error creating export receipt:', error);
    return {
      success: false,
      message: error.message || 'Có lỗi khi tạo phiếu xuất hàng',
      error: error.message
    };
  }
}; 