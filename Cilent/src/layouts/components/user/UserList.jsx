import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaUserTag, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import userService from '../../../utils/userService';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await userService.getPersons();
      
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.error || 'Không thể tải danh sách người dùng');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Có lỗi xảy ra khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FaUser className="mr-2 text-blue-500" />
          Danh sách người dùng ({users.length})
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div key={user.personId} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.personName.charAt(0).toUpperCase()}
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                {/* Name */}
                <div className="flex items-center mb-2">
                  <FaUser className="text-gray-400 mr-2 text-sm" />
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {user.fullName || user.personName}
                  </h3>
                  {user.fullName && (
                    <span className="ml-2 text-sm text-gray-500">(@{user.personName})</span>
                  )}
                </div>
                
                {/* Email */}
                <div className="flex items-center mb-2">
                  <FaEnvelope className="text-gray-400 mr-2 text-sm" />
                  <p className="text-gray-600 truncate">{user.personEmail}</p>
                </div>
                
                {/* Roles */}
                <div className="flex items-center">
                  <FaUserTag className="text-gray-400 mr-2 text-sm" />
                  <div className="flex flex-wrap gap-1">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role, index) => (
                        <span
                          key={index}
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${userService.getRoleBadgeColor(role)}`}
                        >
                          {userService.getRoleDisplayName(role)}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        Chưa có vai trò
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="flex-shrink-0">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
            </div>
            
            {/* Created Date */}
            {user.createdAt && (
              <div className="mt-3 text-xs text-gray-500">
                Tạo ngày: {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <FaUser className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có người dùng</h3>
          <p className="text-gray-600">Danh sách người dùng trống</p>
        </div>
      )}
    </div>
  );
};

export default UserList; 