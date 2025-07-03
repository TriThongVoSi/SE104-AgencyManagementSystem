const BASE_URL = 'http://localhost:8080';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

class ParametersService {
  // Lấy tất cả parameters
  async getAllParameters() {
    try {
      const response = await fetch(`${BASE_URL}/api/parameters/all`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data.result || []
      };
    } catch (error) {
      console.error('Error fetching parameters:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy parameter theo key (sử dụng query parameter)
  async getParameterByKey(key) {
    try {
      const response = await fetch(`${BASE_URL}/api/parameters?paramKey=${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data.result
      };
    } catch (error) {
      console.error('Error fetching parameter:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cập nhật parameter (PUT /api/parameters với body chứa paramKey, paramValue và paramDescription)
  async updateParameter(paramKey, paramValue, paramDescription = '') {
    try {
      const response = await fetch(`${BASE_URL}/api/parameters`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          paramKey: paramKey,
          paramValue: paramValue,
          paramDescription: paramDescription
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data.result,
        message: data.message
      };
    } catch (error) {
      console.error('Error updating parameter:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Tạo parameter mới
  async createParameter(paramKey, paramValue, paramDescription = '') {
    try {
      const response = await fetch(`${BASE_URL}/api/parameters`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          paramKey: paramKey,
          paramValue: paramValue,
          paramDescription: paramDescription
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data.result
      };
    } catch (error) {
      console.error('Error creating parameter:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Xóa parameter (không có trong backend, nhưng giữ lại cho tương lai)
  async deleteParameter(key) {
    try {
      const response = await fetch(`${BASE_URL}/api/parameters/${key}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data.result
      };
    } catch (error) {
      console.error('Error deleting parameter:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validation cho các loại parameter khác nhau
  validateParameterValue(paramKey, paramValue) {
    switch (paramKey) {
      case 'max_agent_per_district':
        const maxValue = parseInt(paramValue);
        if (isNaN(maxValue) || maxValue < 1) {
          return {
            valid: false,
            message: 'Nhập tham số hợp lý.'
          };
        }
        return { valid: true };

      case 'export_price_ratio':
        const ratioValue = parseFloat(paramValue);
        if (isNaN(ratioValue) || ratioValue <= 0) {
          return {
            valid: false,
            message: 'Tỷ lệ giá xuất phải là số dương'
          };
        }
        return { valid: true };

      default:
        if (!paramValue || paramValue.trim() === '') {
          return {
            valid: false,
            message: 'Giá trị tham số không được để trống'
          };
        }
        return { valid: true };
    }
  }
}

export default new ParametersService(); 