import React, { useState } from 'react';
import {
  FaPlusCircle,
  FaFileExport,
  FaMoneyBillWave,
  FaChartBar,
  FaUserShield,
  FaBoxOpen,
  FaBars,
  FaFileImport,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaCalculator,
} from 'react-icons/fa';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, PERMISSIONS } from '../../contexts/AuthContext';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu items với điều kiện quyền
  // Các mục menu với điều kiện quyền truy cập
  const menuItems = [
    {
      path: '/',
      label: 'Trang chủ',
      icon: FaPlusCircle,
      permission: PERMISSIONS.VIEW_DASHBOARD,
      exact: true
    },
    {
      path: '/users',
      label: 'Quản lý người dùng',
      icon: FaUsers,
      permission: PERMISSIONS.MANAGE_USERS
    },
    {
      path: '/agents',
      label: 'Quản lý đại lý',
      icon: FaUserShield,
      permission: PERMISSIONS.FULL_ACCESS
    },
    {
      path: '/import-receipts',
      label: 'Phiếu nhập hàng',
      icon: FaFileImport,
      permission: PERMISSIONS.WAREHOUSE_IMPORT
    },
    {
      path: '/export-receipts',
      label: 'Phiếu xuất hàng',
      icon: FaFileExport,
      permission: PERMISSIONS.WAREHOUSE_EXPORT
    },
    {
      path: '/payment-receipts',
      label: 'Phiếu thu tiền',
      icon: FaMoneyBillWave,
      permission: PERMISSIONS.DEBT_COLLECTION
    },
    {
      path: '/products',
      label: 'Quản lý danh mục',
      icon: FaBoxOpen,
      permission: PERMISSIONS.WAREHOUSE_IMPORT
    },
    {
      path: '/debt',
      label: 'Báo cáo công nợ đại lý',
      icon: FaCalculator,
      permission: PERMISSIONS.DEBT_COLLECTION
    },

    {
      path: '/sales-report',
      label: 'Báo cáo doanh số',
      icon: FaChartBar,
      permission: PERMISSIONS.VIEW_REPORTS
    },
    {
      path: '/settings',
      label: 'Cài đặt hệ thống',
      icon: FaCog,
      permission: PERMISSIONS.SYSTEM_SETTINGS
    }
  ];

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));

  return (
    <div className="flex min-h-screen text-white">
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-4 transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:inset-auto md:z-auto`}
      >
        <div className="text-xl font-bold mb-6 flex items-center justify-between">
          <div>
            <span className="text-purple-500">Agent</span>
            <span className="text-red-500">Management</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden">
            <FaBars className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* User Info */}
        {/* Thông tin người dùng */}
        {user && (
          <div className="mb-6 p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FaUser className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-300 truncate">
                  {user.username}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Menu */}
        {/* Menu động */}
        <ul className="space-y-2 cursor-pointer flex-1">
          {filteredMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
            <NavLink
                  to={item.path}
                  end={item.exact}
              className={({ isActive }) =>
                    `flex items-center p-2 rounded transition-colors duration-200 ${
                      isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
                  <IconComponent className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          </li>
            );
          })}
        </ul>

        {/* Logout Button */}
        {/* Nút đăng xuất */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-2 rounded text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200 group"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3 group-hover:text-white" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;