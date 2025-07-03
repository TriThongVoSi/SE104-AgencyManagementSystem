const BASE_URL = 'http://localhost:8080';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ============ UNITS SERVICE ============
export const getAllUnits = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/units`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy danh sách đơn vị: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getAllUnits:', err.message);
    throw err;
  }
};

export const addUnit = async (unitData) => {
  try {
    const response = await fetch(`${BASE_URL}/unit/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(unitData),
    });
    if (!response.ok) throw new Error(`Không thể thêm đơn vị: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi addUnit:', err.message);
    throw err;
  }
};

export const updateUnit = async (oldUnitName, newUnitName) => {
  try {
    const response = await fetch(`${BASE_URL}/unit/update?oldUnitName=${oldUnitName}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ unitName: newUnitName }),
    });
    if (!response.ok) throw new Error(`Không thể cập nhật đơn vị: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi updateUnit:', err.message);
    throw err;
  }
};

export const deleteUnit = async (unitName) => {
  try {
    const response = await fetch(`${BASE_URL}/unit/delete?unitName=${unitName}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể xóa đơn vị: ${response.status}`);
    const result = await response.json();
    return { status: result.status, message: result.message };
  } catch (err) {
    console.error('Lỗi deleteUnit:', err.message);
    throw err;
  }
};

// ============ DISTRICTS SERVICE ============
export const getAllDistricts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/district/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy danh sách quận/huyện: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getAllDistricts:', err.message);
    throw err;
  }
};

export const addDistrict = async (districtData) => {
  try {
    const response = await fetch(`${BASE_URL}/district/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(districtData),
    });
    if (!response.ok) throw new Error(`Không thể thêm quận/huyện: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi addDistrict:', err.message);
    throw err;
  }
};

export const updateDistrict = async (districtId, districtData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/districts/${districtId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(districtData),
    });
    if (!response.ok) throw new Error(`Không thể cập nhật quận/huyện: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi updateDistrict:', err.message);
    throw err;
  }
};

export const deleteDistrict = async (districtId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/districts/${districtId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể xóa quận/huyện: ${response.status}`);
    const result = await response.json();
    return { status: result.status, message: result.message };
  } catch (err) {
    console.error('Lỗi deleteDistrict:', err.message);
    throw err;
  }
};

// ============ AGENT TYPES SERVICE ============
export const getAllAgentTypes = async () => {
  try {
    const response = await fetch(`${BASE_URL}/agent-type/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy danh sách loại đại lý: ${response.status}`);
    const result = await response.json();
    
    // Handle response format according to API specification
    if (result.code === 200) {
      return { 
        status: 'success', 
        data: result.data || [], 
        message: result.message || 'Lấy danh sách loại đại lý thành công'
      };
    } else {
      return { 
        status: 'error', 
        data: [], 
        message: result.message || 'Lỗi khi lấy danh sách loại đại lý'
      };
    }
  } catch (err) {
    console.error('Lỗi getAllAgentTypes:', err.message);
    throw err;
  }
};

export const addAgentType = async (agentTypeData) => {
  try {
    const response = await fetch(`${BASE_URL}/agent-type/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(agentTypeData),
    });
    if (!response.ok) throw new Error(`Không thể thêm loại đại lý: ${response.status}`);
    const result = await response.json();
    
    // Handle response format according to API specification
    if (result.code === 201) {
      return { 
        status: 'success', 
        data: result.data, 
        message: result.message || 'Thêm loại đại lý thành công'
      };
    } else {
      return { 
        status: 'error', 
        message: result.message || 'Lỗi khi thêm loại đại lý'
      };
    }
  } catch (err) {
    console.error('Lỗi addAgentType:', err.message);
    throw err;
  }
};

export const updateAgentType = async (agentTypeId, agentTypeData) => {
  try {
    const response = await fetch(`${BASE_URL}/agent-type/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(agentTypeData),
    });
    if (!response.ok) throw new Error(`Không thể cập nhật loại đại lý: ${response.status}`);
    const result = await response.json();
    
    // Handle response format according to API specification
    if (result.code === 200) {
      return { 
        status: 'success', 
        data: result.data, 
        message: result.message || 'Cập nhật loại đại lý thành công'
      };
    } else {
      return { 
        status: 'error', 
        message: result.message || 'Lỗi khi cập nhật loại đại lý'
      };
    }
  } catch (err) {
    console.error('Lỗi updateAgentType:', err.message);
    throw err;
  }
};

export const deleteAgentType = async (agentTypeId) => {
  try {
    const response = await fetch(`${BASE_URL}/agent-type/delete?agentTypeId=${agentTypeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể xóa loại đại lý: ${response.status}`);
    const result = await response.json();
    
    // Handle response format according to API specification
    if (result.code === 200) {
      return { 
        status: 'success', 
        message: result.message || 'Xóa loại đại lý thành công'
      };
    } else {
      return { 
        status: 'error', 
        message: result.message || 'Lỗi khi xóa loại đại lý'
      };
    }
  } catch (err) {
    console.error('Lỗi deleteAgentType:', err.message);
    throw err;
  }
}; 