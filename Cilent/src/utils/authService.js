import api from '../utils/api.js';
import { API_CONFIG } from '../constants/api.js';
import { ROLES } from '../contexts/AuthContext.jsx'; // added for role mapping

class AuthService {
  // helper to map backend role string to FE role constant
  mapBackendRole(backendRole) {
    switch (backendRole) {
      case 'ADMIN':
        return ROLES.ADMIN;
      case 'WAREHOUSE_ACCOUNTANT':
      case 'WAREHOUSE':
        return ROLES.WAREHOUSE;
      case 'DEBT_ACCOUNTANT':
      case 'DEBT':
        return ROLES.DEBT;
      case 'VIEWER':
      default:
        return ROLES.VIEWER;
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Payload theo backend (personEmail + passwordHash)
      const payload = {
        personEmail: email,
        passwordHash: password,
      };

      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, payload);

      /**
       * Một số backend trả về ở dạng:
       * {
       *   success: true,
       *   data: {
       *     accessToken: '...',
       *     refreshToken: '...',
       *     user: { ... }
       *   }
       * }
       * Hoặc trực tiếp:
       * {
       *   accessToken: '...',
       *   refreshToken: '...',
       *   user: { ... }
       * }
       */

      const resData = response.data?.data || response.data;

      // Xác định field token + user linh hoạt
      const accessToken = resData.accessToken || resData.token || resData.jwt || resData.access_token || '';
      const refreshToken = resData.refreshToken || resData.refresh_token || '';

      // Build user object
      let user = resData.user || resData.userDTO || resData.person || null;
      if (!user) {
        // If user data scattered in root
        user = {
          id: resData.personId || resData.id,
          email: resData.email || email,
          fullName: resData.fullName || resData.personName || '',
          role: this.mapBackendRole(Array.isArray(resData.roles) ? resData.roles[0] : resData.role),
          roles: resData.roles || [resData.role],
        };
      }

      if (!accessToken || !user) {
        throw new Error('Dữ liệu trả về từ server không hợp lệ');
      }

      // Store tokens and user info
      localStorage.setItem('authToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        data: {
          user,
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Đăng nhập thất bại';
      return {
        success: false,
        error: message,
      };
    }
  }

  // Register user
  async register(userData) {
    try {
      // Transform userData to match backend expectations
      const registerData = {
        personEmail: userData.email,
        passwordHash: userData.password,
        fullName: userData.fullName,
        role: userData.role
      };
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, registerData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy thông tin người dùng',
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get stored user data
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        // Nếu là JSON hợp lệ
        return JSON.parse(userStr);
      } catch (error) {
        // Nếu không phải JSON, xóa key và trả về null
        console.warn('Invalid user data in localStorage, clearing...', error);
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  }

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('authToken');
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      });

      const { accessToken } = response.data;
      localStorage.setItem('authToken', accessToken);

      return {
        success: true,
        data: { accessToken },
      };
    } catch (error) {
      // Clear all tokens on refresh failure
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed',
      };
    }
  }
}

export default new AuthService(); 