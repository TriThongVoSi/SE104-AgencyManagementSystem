import api from '../utils/api.js';
import { API_CONFIG } from '../constants/api.js';

const BASE_URL = 'http://localhost:8080';

class UserService {
  // Helper function to normalize user data for backend
  normalizePersonData(userData) {
    // Handle both frontend format (username, email, password) and backend format (personName, personEmail, passwordHash)
    const normalized = {
      personName: userData.personName || userData.username,
      personEmail: userData.personEmail || userData.email,
      passwordHash: userData.passwordHash || userData.password,
      fullName: userData.fullName,
      isActive: userData.isActive !== undefined ? userData.isActive : true
    };

    // Validate required fields
    const requiredFields = ['personName', 'personEmail', 'passwordHash'];
    const missingFields = requiredFields.filter(field => !normalized[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
    }

    // Additional validation
    if (normalized.personName.length < 3) {
      throw new Error('Tên đăng nhập phải có ít nhất 3 ký tự');
    }

    if (!/\S+@\S+\.\S+/.test(normalized.personEmail)) {
      throw new Error('Email không hợp lệ');
    }

    if (normalized.passwordHash.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    return normalized;
  }

  // Get all persons with their roles
  async getPersons() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/persons`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Lấy vai trò cho từng person
      const personsWithRoles = await Promise.all(
        result.data.map(async (person) => {
          const roles = await this.getPersonRoles(person.personId);
          return {
            ...person,
            roles: roles.success ? roles.data : []
          };
        })
      );
      
      return {
        success: true,
        data: personsWithRoles,
        message: result.message
      };
    } catch (error) {
      console.error('Error fetching persons:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy danh sách người dùng'
      };
    }
  }

  // Get roles for a specific person
  async getPersonRoles(personId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/person-roles/person/${personId}/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || [],
        message: result.message
      };
    } catch (error) {
      console.error('Error fetching person roles:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy vai trò người dùng'
      };
    }
  }

  // Get all users (backward compatibility)
  async getUsers() {
    return this.getPersons();
  }

  // Create new person
  async createPerson(personData) {
    try {
      console.log('📤 Creating person with data:', personData);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.');
      }

      // Normalize and validate data
      const backendData = this.normalizePersonData(personData);
      console.log('📤 Sending to backend:', backendData);
      
      const response = await fetch(`${BASE_URL}/api/persons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendData),
      });
      
      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('❌ Error response:', errorData);
        } catch (parseError) {
          console.error('❌ Cannot parse error response');
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ Success response:', result);
      
      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error creating person:', error);
      return {
        success: false,
        error: error.message || 'Không thể tạo người dùng'
      };
    }
  }

  // Create new user (backward compatibility)
  async createUser(userData) {
    return this.createPerson(userData);
  }

  // Update person
  async updatePerson(personId, personData) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/persons/${personId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(personData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error updating person:', error);
      return {
        success: false,
        error: error.message || 'Không thể cập nhật người dùng'
      };
    }
  }

  // Update user (backward compatibility)
  async updateUser(userId, userData) {
    return this.updatePerson(userId, userData);
  }

  // Delete person
  async deletePerson(personId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/persons/${personId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('Error deleting person:', error);
      return {
        success: false,
        error: error.message || 'Không thể xóa người dùng'
      };
    }
  }

  // Delete user (backward compatibility)
  async deleteUser(userId) {
    return this.deletePerson(userId);
  }

  // Get person by ID
  async getPersonById(personId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/persons/${personId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Lấy vai trò cho person
      const roles = await this.getPersonRoles(personId);
      
      return {
        success: true,
        data: {
          ...result.data,
          roles: roles.success ? roles.data : []
        }
      };
    } catch (error) {
      console.error('Error getting person by ID:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy thông tin người dùng'
      };
    }
  }

  // Get user by ID (backward compatibility)
  async getUserById(userId) {
    return this.getPersonById(userId);
  }

  // Check if email exists
  async checkEmailExists(email) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/persons/check-email?personEmail=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error checking email:', error);
      return {
        success: false,
        error: error.message || 'Không thể kiểm tra email'
      };
    }
  }

  // Check if username exists
  async checkUsernameExists(username) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/persons/check-username?personName=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error checking username:', error);
      return {
        success: false,
        error: error.message || 'Không thể kiểm tra tên người dùng'
      };
    }
  }

  // Change user password
  async changePassword(userId, newPassword) {
    try {
      const result = await this.updatePerson(userId, { 
        passwordHash: newPassword 
      });
      return result;
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.message || 'Không thể thay đổi mật khẩu'
      };
    }
  }

  // Toggle user status
  async toggleUserStatus(userId, status) {
    try {
      const result = await this.updatePerson(userId, { isActive: status });
      return result;
    } catch (error) {
      console.error('Error toggling user status:', error);
      return {
        success: false,
        error: error.message || 'Không thể thay đổi trạng thái người dùng'
      };
    }
  }

  // Helper method to get role display name
  getRoleDisplayName(roleName) {
    const roleMap = {
      'ADMIN': 'Quản trị viên',
      'WAREHOUSE_ACCOUNTANT': 'Kế toán kho',
      'DEBT_ACCOUNTANT': 'Kế toán công nợ',
      'VIEWER': 'Người xem'
    };
    return roleMap[roleName] || roleName;
  }

  // Helper method to get role badge color
  getRoleBadgeColor(roleName) {
    const colorMap = {
      'ADMIN': 'bg-purple-100 text-purple-800 border-purple-200',
      'WAREHOUSE_ACCOUNTANT': 'bg-green-100 text-green-800 border-green-200',
      'DEBT_ACCOUNTANT': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'VIEWER': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[roleName] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default new UserService(); 