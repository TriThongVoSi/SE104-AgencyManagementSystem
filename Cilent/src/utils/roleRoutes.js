import { ROLES } from '../contexts/AuthContext';

// Định nghĩa route mặc định cho từng role
export const ROLE_DEFAULT_ROUTES = {
  [ROLES.ADMIN]: '/',                    // Admin có thể truy cập dashboard tổng quan
  [ROLES.WAREHOUSE]: '/import-receipts', // Kế toán kho -> Quản lý phiếu nhập
  [ROLES.DEBT]: '/debt',                 // Kế toán công nợ -> Trang công nợ  
  [ROLES.VIEWER]: '/',                   // Người xem -> Dashboard chỉ đọc
};

// Định nghĩa quyền truy cập route cho từng role
export const ROLE_ACCESSIBLE_ROUTES = {
  [ROLES.ADMIN]: [
    '/',
    '/agents',
    '/products', 
    '/import-receipts',
    '/export-receipts',
    '/payment-receipts',
    '/reports',
    '/sales-report',
    '/debt',
    '/settings',
    '/users'
  ],
  [ROLES.WAREHOUSE]: [
    '/',
    '/agents',
    '/products',
    '/import-receipts', 
    '/export-receipts',
    '/reports'
  ],
  [ROLES.DEBT]: [
    '/',
    '/agents',
    '/payment-receipts',
    '/debt',
    '/reports',
    '/sales-report'
  ],
  [ROLES.VIEWER]: [
    '/',
    '/agents',
    '/products',
    '/reports',
    '/sales-report'
  ]
};

/**
 * Lấy route mặc định cho role
 * @param {string} role - Role của user
 * @returns {string} - Default route
 */
export const getDefaultRouteForRole = (role) => {
  return ROLE_DEFAULT_ROUTES[role] || '/';
};

/**
 * Kiểm tra user có quyền truy cập route không
 * @param {string} role - Role của user  
 * @param {string} route - Route cần kiểm tra
 * @returns {boolean} - True nếu có quyền
 */
export const canAccessRoute = (role, route) => {
  const accessibleRoutes = ROLE_ACCESSIBLE_ROUTES[role] || [];
  return accessibleRoutes.includes(route);
};

/**
 * Lấy route chuyển hướng sau login
 * @param {object} user - User object
 * @param {string} intendedRoute - Route user muốn truy cập ban đầu
 * @returns {string} - Route để chuyển hướng
 */
export const getRedirectRoute = (user, intendedRoute = '/') => {
  if (!user || !user.role) {
    return '/login';
  }

  // Nếu có intended route và user có quyền truy cập
  if (intendedRoute !== '/' && canAccessRoute(user.role, intendedRoute)) {
    return intendedRoute;
  }

  // Trả về route mặc định cho role
  return getDefaultRouteForRole(user.role);
};

/**
 * Lấy menu items dựa trên role
 * @param {string} role - Role của user
 * @returns {array} - Danh sách menu items
 */
export const getMenuItemsForRole = (role) => {
  const allMenuItems = [
    { path: '/', label: 'Trang chủ', icon: '🏠', roles: ['ADMIN', 'WAREHOUSE', 'DEBT', 'VIEWER'] },
    { path: '/agents', label: 'Quản lý đại lý', icon: '👥', roles: ['ADMIN', 'WAREHOUSE', 'DEBT', 'VIEWER'] },
    { path: '/products', label: 'Quản lý sản phẩm', icon: '📦', roles: ['ADMIN', 'WAREHOUSE', 'VIEWER'] },
    { path: '/import-receipts', label: 'Phiếu nhập', icon: '📥', roles: ['ADMIN', 'WAREHOUSE'] },
    { path: '/export-receipts', label: 'Phiếu xuất', icon: '📤', roles: ['ADMIN', 'WAREHOUSE'] },
    { path: '/payment-receipts', label: 'Phiếu thu', icon: '💰', roles: ['ADMIN', 'DEBT'] },

    { path: '/reports', label: 'Báo cáo', icon: '📈', roles: ['ADMIN', 'WAREHOUSE', 'DEBT', 'VIEWER'] },

    { path: '/settings', label: 'Cài đặt', icon: '⚙️', roles: ['ADMIN'] },
    { path: '/users', label: 'Quản lý người dùng', icon: '👤', roles: ['ADMIN'] }
  ];

  return allMenuItems.filter(item => item.roles.includes(role));
}; 