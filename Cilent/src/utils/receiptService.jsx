const BASE_URL = 'http://localhost:8080';

/**
 * Helper function to get authenticated headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * IMPORT RECEIPT API ENDPOINTS - Updated to match ImportReceiptController
 * 
 * Backend Controller: ImportReceiptController.java
 * Base URL: /api/import-receipts
 * CORS: http://localhost:5173 with credentials
 * Authentication: Bearer Token required for all endpoints
 * Roles: ADMIN, WAREHOUSE_ACCOUNTANT (read/write), VIEWER (read only)
 * 
 * Endpoints:
 * - GET /{id} - Lấy phiếu nhập theo ID
 * - GET /by-date/{date} - Lấy danh sách phiếu nhập theo ngày
 * - POST / - Tạo phiếu nhập mới (CreateImportReceiptRequest)
 * - PUT / - Cập nhật phiếu nhập
 * - PUT /quantity - Cập nhật số lượng nhập
 * 
 * Request/Response Format:
 * - All requests require Authorization: Bearer {token}
 * - Response format: { code, status, message, data }
 */

// Export Receipt APIs
export const getAllExportReceipts = async (dateReceipt = new Date().toISOString().split('T')[0]) => {
  try {
    const response = await fetch(`${BASE_URL}/exportReceipt/getExportReceiptByDate?dateReceipt=${dateReceipt}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy danh sách phiếu xuất: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: Array.isArray(result.data) ? result.data : [result.data], message: result.message };
  } catch (err) {
    console.error('Lỗi getAllExportReceipts:', err.message);
    throw err;
  }
};

export const addExportReceipt = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/api/export-receipts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify([data]),
    });
    if (!response.ok) throw new Error(`Không thể tạo phiếu xuất: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi addExportReceipt:', err.message);
    throw err;
  }
};

export const getExportReceiptById = async (exportReceiptId) => {
  try {
    const response = await fetch(`${BASE_URL}/exportReceipt/getExportReceiptById?exportReceiptId=${exportReceiptId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy chi tiết phiếu xuất: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi getExportReceiptById:', err.message);
    throw err;
  }
};

export const deleteExportReceipt = async (exportReceiptId) => {
  try {
    const response = await fetch(`${BASE_URL}/exportReceipt/delete?exportReceiptId=${exportReceiptId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể xóa phiếu xuất: ${response.status}`);
    const result = await response.json();
    return { status: result.status, message: result.message };
  } catch (err) {
    console.error('Lỗi deleteExportReceipt:', err.message);
    throw err;
  }
};

// Export Detail APIs
export const addExportDetail = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/exportDetail/addExportDetail`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify([data]),
    });
    if (!response.ok) throw new Error(`Không thể tạo chi tiết xuất: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi addExportDetail:', err.message);
    throw err;
  }
};

export const getExportDetailByReceiptId = async (exportReceiptId) => {
  try {
    const response = await fetch(`${BASE_URL}/exportDetail/getExportDetailByReceiptId?exportReceiptId=${exportReceiptId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy chi tiết xuất: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getExportDetailByReceiptId:', err.message);
    throw err;
  }
};

export const getExportDetailByProductId = async (productId) => {
  try {
    const response = await fetch(`${BASE_URL}/exportDetail/getExportDetailByProductId?productId=${productId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy chi tiết xuất: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getExportDetailByProductId:', err.message);
    throw err;
  }
};

export const getExportDetailByReceiptAndProduct = async (exportReceiptId, productId) => {
  try {
    const response = await fetch(`${BASE_URL}/exportDetail/getExportDetailByReceiptAndProduct?exportReceiptId=${exportReceiptId}&productId=${productId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy chi tiết xuất: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getExportDetailByReceiptAndProduct:', err.message);
    throw err;
  }
};

// Import Receipt APIs - Sử dụng đúng endpoint từ ImportReceiptController
export const getAllImportReceipts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/import-receipts`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy danh sách phiếu nhập: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getAllImportReceipts:', err.message);
    throw err;
  }
};

// Lấy phiếu nhập theo ngày (giữ lại nếu cần thiết cho tương lai)
export const getImportReceiptsByDate = async (dateReceipt) => {
  try {
    const response = await fetch(`${BASE_URL}/api/import-receipts/by-date/${dateReceipt}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy danh sách phiếu nhập theo ngày: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getImportReceiptsByDate:', err.message);
    throw err;
  }
};

// Tạo phiếu nhập hàng mới theo yêu cầu API
export const createImportReceipt = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/api/import-receipts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Không thể tạo phiếu nhập: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message, code: result.code };
  } catch (err) {
    console.error('Lỗi createImportReceipt:', err.message);
    throw err;
  }
};

export const addImportReceipt = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/api/import-receipts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data), // Không wrap trong array vì backend expect single object
    });
    if (!response.ok) throw new Error(`Không thể tạo phiếu nhập: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi addImportReceipt:', err.message);
    throw err;
  }
};

export const getImportReceiptById = async (importReceiptId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/import-receipts/${importReceiptId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy chi tiết phiếu nhập: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi getImportReceiptById:', err.message);
    throw err;
  }
};

// Thêm hàm cập nhật phiếu nhập (tương ứng với PUT endpoint)
export const updateImportReceipt = async (importReceipt) => {
  try {
    const response = await fetch(`${BASE_URL}/api/import-receipts`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(importReceipt),
    });
    if (!response.ok) throw new Error(`Không thể cập nhật phiếu nhập: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi updateImportReceipt:', err.message);
    throw err;
  }
};

// Thêm hàm cập nhật số lượng (tương ứng với PUT /quantity endpoint)
export const updateImportReceiptQuantity = async (updateRequest) => {
  try {
    const response = await fetch(`${BASE_URL}/api/import-receipts/quantity`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateRequest),
    });
    if (!response.ok) throw new Error(`Không thể cập nhật số lượng phiếu nhập: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi updateImportReceiptQuantity:', err.message);
    throw err;
  }
};

// Giữ hàm delete nếu có endpoint tương ứng ở backend (hiện tại controller không có DELETE endpoint)
export const deleteImportReceipt = async (importReceiptId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/import-receipts/${importReceiptId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể xóa phiếu nhập: ${response.status}`);
    const result = await response.json();
    return { status: result.status, message: result.message };
  } catch (err) {
    console.error('Lỗi deleteImportReceipt:', err.message);
    throw err;
  }
};

// Import Detail APIs
export const addImportDetail = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/importDetail/addImportDetail`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify([data]),
    });
    if (!response.ok) throw new Error(`Không thể tạo chi tiết nhập: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi addImportDetail:', err.message);
    throw err;
  }
};

export const getImportDetailByReceiptId = async (importReceiptId) => {
  try {
    const response = await fetch(`${BASE_URL}/importDetailbyImportReceiptID?importReceiptID=${importReceiptId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy chi tiết nhập: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getImportDetailByReceiptId:', err.message);
    throw err;
  }
};

// Product APIs
export const getAllProducts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy danh sách sản phẩm: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getAllProducts:', err.message);
    throw err;
  }
};

export const getInventoryQuantity = async (productName) => {
  try {
    const response = await fetch(`${BASE_URL}/product/getInventoryQuantity?productName=${encodeURIComponent(productName)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy số lượng tồn kho: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi getInventoryQuantity:', err.message);
    throw err;
  }
};

// Unit APIs
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

// Agent APIs
export const getAllAgents = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/agents`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy danh sách đại lý: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getAllAgents:', err.message);
    throw err;
  }
};

// Supplier APIs
export const getAllSuppliers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/supplier/getAllSuppliers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy danh sách nhà cung cấp: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getAllSuppliers:', err.message);
    throw err;
  }
};