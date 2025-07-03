import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../utils/authService.js';
import { TEST_USERS } from '../constants/api.js';  

const AuthContext = createContext();

// Định nghĩa các vai trò và quyền hạn
export const ROLES = {
  ADMIN: 'ADMIN',
  WAREHOUSE: 'WAREHOUSE',
  DEBT: 'DEBT',
  DEBT_ACCOUNTANT: 'DEBT_ACCOUNTANT',
  VIEWER: 'VIEWER'
};

export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  SYSTEM_SETTINGS: 'system_settings',
  FULL_ACCESS: 'full_access',
  
  // Warehouse permissions
  WAREHOUSE_IMPORT: 'warehouse_import',
  WAREHOUSE_EXPORT: 'warehouse_export',
  WAREHOUSE_REPORTS: 'warehouse_reports',
  
  // Debt accounting permissions
  DEBT_COLLECTION: 'debt_collection',
  DEBT_REPORTS: 'debt_reports',
  
  // Common permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_REPORTS: 'view_reports'
};

// Định nghĩa quyền hạn cho từng vai trò
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.FULL_ACCESS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.WAREHOUSE_IMPORT,
    PERMISSIONS.WAREHOUSE_EXPORT,
    PERMISSIONS.WAREHOUSE_REPORTS,
    PERMISSIONS.DEBT_COLLECTION,
    PERMISSIONS.DEBT_REPORTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS
  ],
  [ROLES.WAREHOUSE]: [
    PERMISSIONS.WAREHOUSE_IMPORT,
    PERMISSIONS.WAREHOUSE_EXPORT,
    PERMISSIONS.WAREHOUSE_REPORTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS
  ],
  [ROLES.DEBT]: [
    PERMISSIONS.DEBT_COLLECTION,
    PERMISSIONS.DEBT_REPORTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS
  ],
  [ROLES.DEBT_ACCOUNTANT]: [
    PERMISSIONS.DEBT_COLLECTION,
    PERMISSIONS.DEBT_REPORTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS
  ]
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(authService.getStoredToken());

  // Kiểm tra token khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setToken(authService.getStoredToken());
          
          // Optionally verify with server
          const result = await authService.getCurrentUser();
          if (result.success) {
            setUser(result.data);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Đăng nhập
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.data.user);
        setToken(result.data.accessToken);
        return { success: true, user: result.data.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Có lỗi xảy ra khi đăng nhập' };
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng xuất
  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setToken(null);
    setIsLoading(false);
  };

  // Kiểm tra quyền hạn
  const hasPermission = (permission) => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission) || userPermissions.includes(PERMISSIONS.FULL_ACCESS);
  };

  // Kiểm tra vai trò
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // Kiểm tra xem user có thể truy cập route không
  const canAccessRoute = (requiredPermissions = []) => {
    if (!user) return false;
    if (requiredPermissions.length === 0) return true;
    
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
    canAccessRoute,
    isAuthenticated: !!user,
    userRole: user?.role,
    userPermissions: user ? ROLE_PERMISSIONS[user.role] || [] : []
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 