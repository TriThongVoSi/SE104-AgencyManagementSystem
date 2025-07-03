const BASE_URL = 'http://localhost:8080';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ============ PRODUCT MANAGEMENT FUNCTIONS ============

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

export const getProductById = async (productId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy chi tiết sản phẩm: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi getProductById:', err.message);
    throw err;
  }
};

// ============ NEW IMPROVED ADD PRODUCT FUNCTION ============
/**
 * Thêm sản phẩm mới với tự động tính exportPrice từ export_price_ratio
 * @param {Object} productData - {productName: string, unitName: string, importPrice: number}
 * @returns {Promise<Object>} - Response từ API
 */
export const addProduct = async (productData) => {
  try {
    // Validate input data
    if (!productData.productName || !productData.unitName || !productData.importPrice) {
      throw new Error('Thiếu thông tin bắt buộc: productName, unitName, importPrice');
    }

    if (productData.importPrice <= 0) {
      throw new Error('Giá nhập phải lớn hơn 0');
    }

    // Gửi request với format JSON theo yêu cầu
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        productName: productData.productName,
        unitName: productData.unitName,
        importPrice: productData.importPrice
      }),
    });

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (parseError) {
        // If response is not JSON, try to get text
        const errorText = await response.text();
        throw new Error(`Không thể tạo sản phẩm: ${response.status} - ${errorText || response.statusText}`);
      }
      
      // Handle specific backend error cases
      if (response.status === 400 && errorData?.message) {
        if (errorData.message.includes('đã tồn tại') || 
            errorData.message.includes('PRODUCT_ALREADY_EXISTS')) {
          // Extract product name and unit from error message for better UX
          throw new Error(errorData.message);
        }
      }
      
      throw new Error(`Không thể tạo sản phẩm: ${response.status} - ${errorData?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return { 
      status: result.status || 'success', 
      data: result.data, 
      message: result.message || 'Thêm sản phẩm thành công' 
    };
  } catch (err) {
    console.error('Lỗi trong addProduct:', err.message);
    throw err;
  }
};

// ============ PARAMETER FUNCTIONS ============
/**
 * Lấy tỷ lệ giá xuất từ Parameter
 * @returns {Promise<number>} - Tỷ lệ export price ratio (mặc định 1.02)
 */
export const getExportPriceRatio = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/parameters?paramKey=export_price_ratio`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.warn('Không thể lấy export_price_ratio, sử dụng giá trị mặc định 1.02');
      return 1.02;
    }
    
    const result = await response.json();
    // Update theo response format: {code: 200, data: {paramValue: "2"}}
    const ratio = parseFloat(result.data?.paramValue || result.data?.param_value || '1.02');
    console.log('🔍 Loaded export price ratio from API:', ratio);
    return isNaN(ratio) ? 1.02 : ratio;
  } catch (err) {
    console.warn('Lỗi khi lấy export_price_ratio:', err.message, '- Sử dụng giá trị mặc định 1.02');
    return 1.02;
  }
};

/**
 * Tính toán export price dựa vào import price và ratio
 * @param {number} importPrice - Giá nhập
 * @param {number} ratio - Tỷ lệ export price ratio (optional, sẽ fetch từ API nếu không có)
 * @returns {Promise<number>} - Giá xuất đã tính
 */
export const calculateExportPrice = async (importPrice, ratio = null) => {
  try {
    const exportRatio = ratio || await getExportPriceRatio();
    return Math.round(importPrice * exportRatio);
  } catch (err) {
    console.error('Lỗi khi tính export price:', err.message);
    return Math.round(importPrice * 1.02); // Fallback to default 1.02
  }
};

// ============ LEGACY FUNCTIONS (GIỮ LẠI TƯƠNG THÍCH) ============

export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error(`Không thể tạo sản phẩm: ${response.status} - ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Lỗi trong createProduct:', err.message);
    throw err;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error(`Không thể cập nhật sản phẩm: ${response.status} - ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Lỗi trong updateProduct:', err.message);
    throw err;
  }
};

export const deleteProduct = async (productId) => {
  try {
      const response = await fetch(`${BASE_URL}/api/products?productId=${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Không thể xóa sản phẩm: ${response.status} - ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Lỗi trong deleteProduct:', err.message);
    throw err;
  }
};

// ============ INVENTORY MANAGEMENT FUNCTIONS ============

export const increaseInventory = async (productId, quantity) => {
  try {
    const response = await fetch(`${BASE_URL}/api/products/increaseInventory?productId=${productId}&quantity=${quantity}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Không thể tăng tồn kho: ${response.status} - ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Lỗi trong increaseInventory:', err.message);
    throw err;
  }
};

export const decreaseInventory = async (productId, quantity) => {
  try {
    const response = await fetch(`${BASE_URL}/api/products/decreaseInventory?productId=${productId}&quantity=${quantity}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Không thể giảm tồn kho: ${response.status} - ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Lỗi trong decreaseInventory:', err.message);
    throw err;
  }
};

export const getInventoryQuantity = async (productName) => {
  try {
    const response = await fetch(`${BASE_URL}/api/products/getInventoryQuantity?productName=${encodeURIComponent(productName)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Không thể lấy số lượng tồn kho: ${response.status} - ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Lỗi trong getInventoryQuantity:', err.message);
    throw err;
  }
};

