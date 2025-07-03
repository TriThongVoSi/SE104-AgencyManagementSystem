import api from './api.js';
import { API_CONFIG } from '../constants/api.js';

/**
 * Service xử lý các API liên quan đến phiếu thu tiền
 */
class PaymentReceiptService {
  
  /**
   * Lấy danh sách tất cả phiếu thu tiền
   * @returns {Promise<Object>} ApiResponse với danh sách phiếu thu
   */
  async getAllPaymentReceipts() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.PAYMENT_RECEIPTS.LIST);
      return {
        success: true,
        data: response.data?.data || [],
        message: response.data?.message || 'Lấy danh sách phiếu thu tiền thành công'
      };
    } catch (error) {
      console.error('Error getAllPaymentReceipts:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy danh sách phiếu thu tiền',
        data: []
      };
    }
  }

  /**
   * Lấy phiếu thu tiền theo ID
   * @param {number} paymentId - ID phiếu thu tiền
   * @returns {Promise<Object>} ApiResponse với thông tin phiếu thu
   */
  async getPaymentReceiptById(paymentId) {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.PAYMENT_RECEIPTS.GET_BY_ID}/${paymentId}`);
      return {
        success: true,
        data: response.data?.data || null,
        message: response.data?.message || 'Lấy thông tin phiếu thu tiền thành công'
      };
    } catch (error) {
      console.error('Error getPaymentReceiptById:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy thông tin phiếu thu tiền',
        data: null
      };
    }
  }

  /**
   * Lấy danh sách phiếu thu tiền theo ID đại lý
   * @param {number} agentId - ID đại lý
   * @returns {Promise<Object>} ApiResponse với danh sách phiếu thu
   */
  async getPaymentReceiptsByAgentId(agentId) {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.PAYMENT_RECEIPTS.GET_BY_AGENT}/${agentId}`);
      return {
        success: true,
        data: response.data?.data || [],
        message: response.data?.message || 'Lấy danh sách phiếu thu tiền theo đại lý thành công'
      };
    } catch (error) {
      console.error('Error getPaymentReceiptsByAgentId:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy danh sách phiếu thu tiền theo đại lý',
        data: []
      };
    }
  }

  /**
   * Tạo phiếu thu tiền mới
   * @param {Object} paymentReceiptData - Dữ liệu phiếu thu tiền
   * @param {Object} paymentReceiptData.agent - Thông tin đại lý
   * @param {number} paymentReceiptData.agent.agentId - ID đại lý
   * @param {string} paymentReceiptData.paymentDate - Ngày thu tiền (YYYY-MM-DD)
   * @param {number} paymentReceiptData.revenue - Số tiền thu
   * @returns {Promise<Object>} ApiResponse với thông tin phiếu thu đã tạo
   */
  async createPaymentReceipt(paymentReceiptData) {
    try {
      // Validate input
      if (!paymentReceiptData) {
        throw new Error('Dữ liệu phiếu thu tiền không được để trống');
      }

      if (!paymentReceiptData.agent || !paymentReceiptData.agent.agentId) {
        throw new Error('Đại lý không được để trống');
      }

      if (!paymentReceiptData.revenue || paymentReceiptData.revenue <= 0) {
        throw new Error('Số tiền thu phải lớn hơn 0');
      }

      if (!paymentReceiptData.paymentDate) {
        throw new Error('Ngày thu tiền không được để trống');
      }

      // Format data theo yêu cầu của backend
      const requestData = {
        agent: {
          agentId: parseInt(paymentReceiptData.agent.agentId)
        },
        paymentDate: paymentReceiptData.paymentDate,
        revenue: parseInt(paymentReceiptData.revenue)
      };

      const response = await api.post(API_CONFIG.ENDPOINTS.PAYMENT_RECEIPTS.CREATE, requestData);
      
      return {
        success: true,
        data: response.data?.data || null,
        message: response.data?.message || 'Tạo phiếu thu tiền thành công'
      };
    } catch (error) {
      console.error('Error createPaymentReceipt:', error);
      
      // Handle specific error messages
      let errorMessage = 'Không thể tạo phiếu thu tiền';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền tạo phiếu thu tiền';
      } else if (error.response?.status === 404) {
        errorMessage = 'Đại lý không tồn tại';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi hệ thống, vui lòng thử lại sau';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  }

  /**
   * Lọc phiếu thu tiền theo từ khóa tìm kiếm
   * @param {Array} receipts - Danh sách phiếu thu tiền
   * @param {string} searchTerm - Từ khóa tìm kiếm
   * @returns {Array} Danh sách phiếu thu tiền đã lọc
   */
  filterReceipts(receipts, searchTerm) {
    if (!searchTerm || !receipts || receipts.length === 0) {
      return receipts;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    
    return receipts.filter(receipt => {
      // Tìm kiếm theo tên đại lý
      const agentName = receipt.agent?.agentName?.toLowerCase() || '';
      
      // Tìm kiếm theo ngày thanh toán
      const paymentDate = receipt.paymentDate || '';
      
      // Tìm kiếm theo số tiền (chuyển về string)
      const revenue = receipt.revenue?.toString() || '';
      
      // Tìm kiếm theo ID phiếu thu
      const paymentId = receipt.paymentId?.toString() || '';

      return agentName.includes(lowercaseSearch) ||
             paymentDate.includes(lowercaseSearch) ||
             revenue.includes(lowercaseSearch) ||
             paymentId.includes(lowercaseSearch);
    });
  }

  /**
   * Lọc phiếu thu tiền theo khoảng thời gian
   * @param {Array} receipts - Danh sách phiếu thu tiền
   * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
   * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD)
   * @returns {Array} Danh sách phiếu thu tiền đã lọc
   */
  filterReceiptsByDateRange(receipts, startDate, endDate) {
    if (!startDate || !endDate || !receipts || receipts.length === 0) {
      return receipts;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return receipts.filter(receipt => {
      const receiptDate = new Date(receipt.paymentDate);
      return receiptDate >= start && receiptDate <= end;
    });
  }

  /**
   * Tính tổng tiền thu từ danh sách phiếu thu
   * @param {Array} receipts - Danh sách phiếu thu tiền
   * @returns {number} Tổng tiền thu
   */
  calculateTotalRevenue(receipts) {
    if (!receipts || receipts.length === 0) {
      return 0;
    }

    return receipts.reduce((total, receipt) => {
      return total + (receipt.revenue || 0);
    }, 0);
  }

  /**
   * Format currency với đơn vị VND
   * @param {number} amount - Số tiền
   * @returns {string} Số tiền đã format
   */
  formatCurrency(amount) {
    if (typeof amount !== 'number') {
      return '0 ₫';
    }

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format ngày theo định dạng Việt Nam
   * @param {string} dateString - Chuỗi ngày (YYYY-MM-DD)
   * @returns {string} Ngày đã format (DD/MM/YYYY)
   */
  formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Kiểm tra quyền tạo phiếu thu tiền
   * @param {string} userRole - Role của user hiện tại
   * @returns {boolean} True nếu có quyền
   */
  canCreatePaymentReceipt(userRole) {
    const allowedRoles = ['ADMIN', 'DEBT_ACCOUNTANT'];
    return allowedRoles.includes(userRole);
  }

  /**
   * Kiểm tra quyền xem phiếu thu tiền
   * @param {string} userRole - Role của user hiện tại
   * @returns {boolean} True nếu có quyền
   */
  canViewPaymentReceipts(userRole) {
    const allowedRoles = ['ADMIN', 'DEBT_ACCOUNTANT', 'VIEWER'];
    return allowedRoles.includes(userRole);
  }
}

// Export singleton instance
export default new PaymentReceiptService(); 