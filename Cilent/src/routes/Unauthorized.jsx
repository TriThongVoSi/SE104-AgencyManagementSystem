import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaHome, FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center transform transition-all duration-1000 ease-out animate-fade-in">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <FaExclamationTriangle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            Truy cập bị từ chối
          </h1>
          <p className="text-xl text-gray-600 font-medium mb-2">
            Bạn không có quyền truy cập trang này
          </p>
          {user && (
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-lg border border-blue-200">
              <FaShieldAlt className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                Đăng nhập với vai trò: <strong>{user.fullName}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 transform transition-all duration-700 ease-out">
          <div className="text-center space-y-6">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700 text-sm leading-relaxed">
                Trang này yêu cầu quyền hạn đặc biệt mà tài khoản của bạn hiện tại không có. 
                Vui lòng liên hệ quản trị viên để được cấp quyền truy cập.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Link
                  to="/"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <FaHome className="h-5 w-5" />
                  <span>Về trang chủ</span>
                </Link>
                
                <button
                  onClick={handleGoBack}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  Quay lại
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>

            {/* Help Info */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">Cần hỗ trợ?</h3>
              <p className="text-xs text-yellow-700 leading-relaxed">
                Nếu bạn tin rằng đây là lỗi, vui lòng liên hệ với quản trị viên hệ thống 
                hoặc thử đăng nhập lại với tài khoản có quyền phù hợp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 