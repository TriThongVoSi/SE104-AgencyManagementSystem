// src/utils/authUtils.js

// Token utilities cho authentication
export const tokenUtils = {
  // Kiểm tra token có hợp lệ không
  isTokenValid() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  // Lấy token từ localStorage
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Lưu token vào localStorage
  setToken(token) {
    localStorage.setItem('authToken', token);
  },

  // Xóa token khỏi localStorage
  removeToken() {
    localStorage.removeItem('authToken');
  },

  // Redirect về login nếu token không hợp lệ
  requireAuth() {
    if (!this.isTokenValid()) {
      this.removeToken();
      window.location.href = '/login';
      return false;
    }
    return true;
  },

  // Lấy user role từ token
  getUserRole() {
    const token = this.getToken();
    if (!token) return [];
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles || [];
    } catch {
      return [];
    }
  },

  // Lấy user info từ token
  getUserInfo() {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId,
        username: payload.username,
        roles: payload.roles || [],
        exp: payload.exp
      };
    } catch {
      return null;
    }
  },

  // Kiểm tra user có role cụ thể không
  hasRole(role) {
    const roles = this.getUserRole();
    return roles.includes(role);
  },

  // Kiểm tra token sắp hết hạn (còn dưới 15 phút)
  isTokenNearExpiry() {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeLeft = expiryTime - currentTime;
      
      // Còn dưới 15 phút (900000ms) thì coi như sắp hết hạn
      return timeLeft < 900000;
    } catch {
      return true;
    }
  }
};

// Permission utilities
export const permissionUtils = {
  // Kiểm tra permission để truy cập sales report
  canAccessSalesReport() {
    const roles = tokenUtils.getUserRole();
    return roles.includes('ADMIN') || roles.includes('MANAGER') || roles.includes('STAFF');
  },

  // Kiểm tra permission để tạo sales report
  canCreateSalesReport() {
    const roles = tokenUtils.getUserRole();
    return roles.includes('ADMIN') || roles.includes('MANAGER');
  },

  // Kiểm tra permission để xóa sales report
  canDeleteSalesReport() {
    const roles = tokenUtils.getUserRole();
    return roles.includes('ADMIN');
  },

  // Kiểm tra permission để xuất excel
  canExportExcel() {
    const roles = tokenUtils.getUserRole();
    return roles.includes('ADMIN') || roles.includes('MANAGER') || roles.includes('STAFF');
  }
};

// API error handler
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message === 'Token expired' || error.status === 401) {
    tokenUtils.removeToken();
    window.location.href = '/login';
    return;
  }
  
  // Return user-friendly error message
  switch (error.status) {
    case 403:
      return 'Bạn không có quyền thực hiện hành động này';
    case 404:
      return 'Không tìm thấy dữ liệu';
    case 500:
      return 'Lỗi hệ thống, vui lòng thử lại sau';
    default:
      return error.message || 'Có lỗi xảy ra, vui lòng thử lại';
  }
};

export default {
  tokenUtils,
  permissionUtils,
  handleApiError
}; 