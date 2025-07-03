import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaUserShield, FaUsers } from 'react-icons/fa';
import { useAuth, ROLES } from '../contexts/AuthContext';
import AddUserPopup from '../layouts/components/user/AddUserPopup';
import EditUserPopup from '../layouts/components/user/EditUserPopup';
import DeleteUserPopup from '../layouts/components/user/DeleteUserPopup';
import ViewUserPopup from '../layouts/components/user/ViewUserPopup';
import userService from '../utils/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user: currentUser } = useAuth();

  // Fetch users từ API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await userService.getPersons();
      
      if (result.success) {
        // Transform dữ liệu từ API để phù hợp với component
        const transformedUsers = result.data.map(person => ({
          id: person.personId,
          username: person.personName,
          fullName: person.fullName || person.personName,
          email: person.personEmail,
          roles: person.roles || [],
          role: person.roles && person.roles.length > 0 ? person.roles[0] : 'VIEWER', // Lấy role đầu tiên
          createdAt: person.createdAt ? new Date(person.createdAt).toLocaleDateString() : '',
          status: person.isActive ? 'active' : 'inactive',
          isActive: person.isActive
        }));
        
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole) {
      filtered = filtered.filter(user => 
        user.roles && user.roles.includes(selectedRole)
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);

  const getRoleLabel = (role) => {
    return userService.getRoleDisplayName(role);
  };

  const getRoleBadgeColor = (role) => {
    return userService.getRoleBadgeColor(role);
  };

  const getStatusBadgeColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const handleAddUser = async (newUser) => {
    try {
      const result = await userService.createPerson(newUser);
      if (result.success) {
        fetchUsers(); // Refresh danh sách
        setShowAddPopup(false);
      } else {
        alert(result.error || 'Không thể tạo người dùng');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Có lỗi xảy ra khi tạo người dùng');
    }
  };

  const handleEditUser = async (updatedUser) => {
    try {
      const result = await userService.updatePerson(updatedUser.id, updatedUser);
      if (result.success) {
        fetchUsers(); // Refresh danh sách
        setShowEditPopup(false);
        setSelectedUser(null);
      } else {
        alert(result.error || 'Không thể cập nhật người dùng');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Có lỗi xảy ra khi cập nhật người dùng');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const result = await userService.deletePerson(userId);
      if (result.success) {
        fetchUsers(); // Refresh danh sách
        setShowDeletePopup(false);
        setSelectedUser(null);
      } else {
        alert(result.error || 'Không thể xóa người dùng');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa người dùng');
    }
  };

  const openEditPopup = (user) => {
    setSelectedUser(user);
    setShowEditPopup(true);
  };

  const openDeletePopup = (user) => {
    setSelectedUser(user);
    setShowDeletePopup(true);
  };

  const openViewPopup = (user) => {
    setSelectedUser(user);
    setShowViewPopup(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-center text-gray-300">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">❌</div>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchUsers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FaUsers className="mr-3 text-blue-400" />
              Quản lý người dùng
            </h1>
            <p className="text-gray-300 mt-2">Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
          </div>
          <button
            onClick={() => setShowAddPopup(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="w-5 h-5" />
            <span>Thêm người dùng</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text-color-white"
              placeholder="Tìm kiếm theo tên, username, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white"
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="WAREHOUSE_ACCOUNTANT">Kế toán kho</option>
              <option value="DEBT_ACCOUNTANT">Kế toán công nợ</option>
              <option value="VIEWER">Người xem</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Đăng nhập cuối
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <FaUserShield className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{user.fullName}</div>
                        <div className="text-sm text-gray-300">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                          <span key={index} className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(role)}`}>
                            {getRoleLabel(role)}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200">
                          Chưa có vai trò
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(user.status)}`}>
                      {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openViewPopup(user)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditPopup(user)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                        disabled={user.id === currentUser?.id}
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeletePopup(user)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Xóa"
                        disabled={user.id === currentUser?.id}
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Không tìm thấy người dùng</h3>
            <p className="text-gray-300">Thử thay đổi bộ lọc tìm kiếm của bạn</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
          <div className="text-2xl font-bold text-blue-400">{users.length}</div>
          <div className="text-sm text-gray-300">Tổng người dùng</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
          <div className="text-2xl font-bold text-green-400">
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="text-sm text-gray-300">Đang hoạt động</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
          <div className="text-2xl font-bold text-purple-400">
            {users.filter(u => u.roles && u.roles.includes('ADMIN')).length}
          </div>
          <div className="text-sm text-gray-300">Quản trị viên</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
          <div className="text-2xl font-bold text-yellow-400">
            {users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7*24*60*60*1000)).length}
          </div>
          <div className="text-sm text-gray-300">Hoạt động 7 ngày</div>
        </div>
      </div>

      {/* Popups */}
      {showAddPopup && (
        <AddUserPopup
          onClose={() => setShowAddPopup(false)}
          onSave={handleAddUser}
        />
      )}

      {showEditPopup && selectedUser && (
        <EditUserPopup
          user={selectedUser}
          onClose={() => {
            setShowEditPopup(false);
            setSelectedUser(null);
          }}
          onSave={handleEditUser}
        />
      )}

      {showDeletePopup && selectedUser && (
        <DeleteUserPopup
          user={selectedUser}
          onClose={() => {
            setShowDeletePopup(false);
            setSelectedUser(null);
          }}
          onConfirm={() => handleDeleteUser(selectedUser.id)}
        />
      )}

      {showViewPopup && selectedUser && (
        <ViewUserPopup
          user={selectedUser}
          onClose={() => {
            setShowViewPopup(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement; 