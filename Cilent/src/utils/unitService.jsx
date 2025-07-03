const BASE_URL = 'http://localhost:8080';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

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

export const addUnit = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/api/units`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Không thể thêm đơn vị: ${response.status} - ${response.statusText}`);
    }
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi trong addUnit:', err.message);
    throw err;
  }
};

export const updateUnit = async (oldUnitName, newUnitName) => {
  try {
    const response = await fetch(`${BASE_URL}/api/units/${encodeURIComponent(oldUnitName)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ unitName: newUnitName }),
    });
    if (!response.ok) {
      throw new Error(`Không thể cập nhật đơn vị: ${response.status} - ${response.statusText}`);
    }
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi trong updateUnit:', err.message);
    throw err;
  }
};

export const getUnitByName = async (unitName) => {
  try {
    const response = await fetch(`${BASE_URL}/api/units/${encodeURIComponent(unitName)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Không thể lấy thông tin đơn vị: ${response.status} - ${response.statusText}`);
    }
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi trong getUnitByName:', err.message);
    throw err;
  }
};

export const deleteUnit = async (unitName) => {
  try {
    const response = await fetch(`${BASE_URL}/api/units/${encodeURIComponent(unitName)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Không thể xóa đơn vị: ${response.status} - ${response.statusText}`);
    }
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi trong deleteUnit:', err.message);
    throw err;
  }
};
