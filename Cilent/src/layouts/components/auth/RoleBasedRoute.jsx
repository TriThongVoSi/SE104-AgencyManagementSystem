import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { canAccessRoute, getDefaultRouteForRole } from '../../../utils/roleRoutes.js';

const RoleBasedRoute = ({ children, requiredRoles = [], fallbackRoute = null }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Đang loading, hiển thị spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập, chuyển về login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền truy cập route hiện tại
  const currentPath = location.pathname;
  const hasAccess = canAccessRoute(user.role, currentPath);

  // Nếu không có quyền truy cập
  if (!hasAccess) {
    // Nếu có fallbackRoute, chuyển đến đó
    if (fallbackRoute) {
      return <Navigate to={fallbackRoute} replace />;
    }
    
    // Nếu không, chuyển về route mặc định của role
    const defaultRoute = getDefaultRouteForRole(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  // Kiểm tra role cụ thể nếu được yêu cầu
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    const defaultRoute = getDefaultRouteForRole(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  // Có quyền truy cập, render children
  return children;
};

export default RoleBasedRoute; 