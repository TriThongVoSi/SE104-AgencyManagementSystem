import { API_CONFIG } from '../constants/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

class ExportDetailService {
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
          throw new Error('Không tìm thấy chi tiết phiếu xuất');
        case 400:
          throw new Error(errorData.message || 'Dữ liệu không hợp lệ');
        case 500:
          throw new Error('Lỗi hệ thống, vui lòng thử lại sau');
        default:
          throw new Error(errorData.message || 'Có lỗi xảy ra');
      }
    }
    return await response.json();
  }

  // GET /api/export-details/by-receipt/{exportReceiptId} - Lấy chi tiết theo phiếu xuất
  async getExportDetailsByReceiptId(exportReceiptId) {
    try {
      console.log('🔗 Calling API:', `${API_BASE_URL}/export-details/by-receipt/${exportReceiptId}`);
      
      const response = await fetch(`${API_BASE_URL}/export-details/by-receipt/${exportReceiptId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      console.log('📡 API Response status:', response.status);
      
      const result = await this.handleResponse(response);
      console.log('📋 API Response data:', result);
      
      return {
        success: true,
        data: result.data || result || [] // Handle both wrapped and direct response
      };
    } catch (error) {
      console.error('❌ Export Detail Service Error:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi khi lấy chi tiết phiếu xuất',
        data: []
      };
    }
  }

  // PUT /api/export-details - Cập nhật export detail
  async updateExportDetail(exportDetailData) {
    try {
      const response = await fetch(`${API_BASE_URL}/export-details`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(exportDetailData),
      });
      
      const result = await this.handleResponse(response);
      return {
        success: true,
        data: result.data,
        message: result.message || 'Cập nhật chi tiết thành công'
      };
    } catch (error) {
      console.error('Error updating export detail:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi khi cập nhật chi tiết'
      };
    }
  }

  // GET /api/export-details/by-product/{productId} - Lấy chi tiết theo sản phẩm
  async getExportDetailsByProductId(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/export-details/by-product/${productId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await this.handleResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error getting export details by product ID:', error);
      throw error;
    }
  }

  // GET /api/export-details/search - Tìm chi tiết theo phiếu xuất và sản phẩm
  async searchExportDetail(exportReceiptId, productId) {
    try {
      const params = new URLSearchParams({
        exportReceiptId: exportReceiptId.toString(),
        productId: productId.toString()
      });
      
      const response = await fetch(`${API_BASE_URL}/export-details/search?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error searching export detail:', error);
      throw error;
    }
  }

  // POST /api/export-details - Tạo chi tiết xuất mới
  async createExportDetail(exportDetailData) {
    try {
      const response = await fetch(`${API_BASE_URL}/export-details`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify([exportDetailData]), // API expects array
      });
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error creating export detail:', error);
      throw error;
    }
  }

  // POST /api/export-details - Tạo nhiều chi tiết xuất cùng lúc
  async createMultipleExportDetails(exportDetailsArray) {
    try {
      const response = await fetch(`${API_BASE_URL}/export-details`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(exportDetailsArray),
      });
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error creating multiple export details:', error);
      throw error;
    }
  }
}

export default new ExportDetailService(); 