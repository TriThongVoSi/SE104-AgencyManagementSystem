import React from 'react';
import { FaTimes, FaUser, FaEnvelope, FaUserTag, FaCalendar, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ROLES } from '../../../contexts/AuthContext';

const ViewUserPopup = ({ user, onClose }) => {
  const getRoleLabel = (role) => {
    const roleLabels = {
      [ROLES.ADMIN]: 'Quản trị viên',
      [ROLES.ACCOUNTING_WAREHOUSE]: 'Kế toán kho',
      [ROLES.ACCOUNTING_DEBT]: 'Kế toán công nợ',
      [ROLES.VIEWER]: 'Người xem'
    };
    return roleLabels[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      [ROLES.ADMIN]: 'bg-purple-100 text-purple-800 border-purple-200',
      [ROLES.ACCOUNTING_WAREHOUSE]: 'bg-green-100 text-green-800 border-green-200',
      [ROLES.ACCOUNTING_DEBT]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [ROLES.VIEWER]: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa đăng nhập';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissions = (role) => {
    const permissions = {
      [ROLES.ADMIN]: [
        'Toàn quyền hệ thống',
        'Quản lý người dùng',
        'Cấu hình hệ thống',
        'Quản lý đại lý',
        'Nhập/Xuất hàng',
        'Thu tiền',
        'Xem tất cả báo cáo'
      ],
      [ROLES.ACCOUNTING_WAREHOUSE]: [
        'Phiếu nhập hàng',
        'Phiếu xuất hàng',
        'Quản lý hàng hóa',
        'Báo cáo kho',
        'Xem dashboard'
      ],
      [ROLES.ACCOUNTING_DEBT]: [
        'Phiếu thu tiền',
        'Báo cáo công nợ',
        'Quản lý debt',
        'Xem dashboard'
      ],
      [ROLES.VIEWER]: [
        'Xem dashboard',
        'Xem báo cáo',
        'Chỉ đọc'
      ]
    };
    return permissions[role] || [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaUser className="mr-3 text-blue-600" />
            Thông tin người dùng
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Avatar & Basic Info */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <FaUser className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{user.fullName}</h3>
              <p className="text-gray-600 flex items-center mt-1">
                <FaUser className="w-4 h-4 mr-2" />
                @{user.username}
              </p>
              <p className="text-gray-600 flex items-center mt-1">
                <FaEnvelope className="w-4 h-4 mr-2" />
                {user.email}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
              <div className="mt-2">
                {user.status === 'active' ? (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                    <FaCheckCircle className="w-3 h-3 mr-1" />
                    Hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                    <FaTimesCircle className="w-3 h-3 mr-1" />
                    Không hoạt động
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="w-5 h-5 mr-2 text-blue-600" />
                Thông tin tài khoản
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium">#{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên đăng nhập:</span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="font-medium">{user.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-blue-600">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Activity Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaClock className="w-5 h-5 mr-2 text-green-600" />
                Hoạt động
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="font-medium flex items-center">
                    <FaCalendar className="w-4 h-4 mr-1 text-gray-400" />
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đăng nhập cuối:</span>
                  <span className="font-medium flex items-center">
                    <FaClock className="w-4 h-4 mr-1 text-gray-400" />
                    {formatDateTime(user.lastLogin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`font-medium ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUserTag className="w-5 h-5 mr-2 text-purple-600" />
              Quyền hạn và chức năng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getPermissions(user.role).map((permission, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <FaCheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">{permission}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          {user.role === ROLES.ADMIN && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <FaUserTag className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Quản trị viên hệ thống</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Người dùng này có toàn quyền truy cập và quản lý hệ thống. Hãy cẩn thận khi thay đổi thông tin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserPopup; 