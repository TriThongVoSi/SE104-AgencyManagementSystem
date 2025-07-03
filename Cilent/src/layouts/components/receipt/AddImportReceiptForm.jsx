import React, { useState, useEffect } from 'react';
import { 
  createImportReceipt, 
  formatCreateImportReceiptRequest 
} from '../../../utils/importReceiptService.js';
import { getAllProducts } from '../../../utils/productService.jsx';

/**
 * Component form tạo phiếu nhập hàng mới
 * Tích hợp với ImportReceiptService
 * 
 * Features:
 * - Form validation
 * - Dropdown chọn sản phẩm
 * - Nhập nhiều mặt hàng trong một phiếu
 * - Tính toán tự động tổng tiền
 * - Xử lý lỗi API
 * - Loading states
 * - Success/Error feedback
 */
const AddImportReceiptForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    createDate: new Date().toISOString().split('T')[0]
  });
  
  // State cho danh sách sản phẩm được thêm vào phiếu nhập
  const [importItems, setImportItems] = useState([]);
  
  // State cho form thêm sản phẩm mới
  const [currentItem, setCurrentItem] = useState({
    productID: '',
    quantityImport: ''
  });
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // Load danh sách sản phẩm
  const loadProducts = async () => {
    setProductLoading(true);
    try {
      const result = await getAllProducts();
      if (result.status === 'success') {
        setProducts(result.data || []);
      } else {
        console.error('Không thể tải danh sách sản phẩm:', result.message);
        setProducts([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
      setProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  // Load dữ liệu ban đầu
  useEffect(() => {
    loadProducts();
  }, []);

  // Validate form chính
  const validateForm = () => {
    const newErrors = {};

    if (!formData.createDate) {
      newErrors.createDate = 'Vui lòng chọn ngày nhập';
    } else {
      const selectedDate = new Date(formData.createDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (selectedDate > today) {
        newErrors.createDate = 'Ngày nhập không được lớn hơn ngày hiện tại';
      }
    }

    if (importItems.length === 0) {
      newErrors.items = 'Vui lòng thêm ít nhất một sản phẩm vào phiếu nhập';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate item hiện tại
  const validateCurrentItem = () => {
    const newErrors = {};

    if (!currentItem.productID) {
      newErrors.productID = 'Vui lòng chọn sản phẩm';
    } else {
      // Kiểm tra sản phẩm đã được thêm chưa
      const existingItem = importItems.find(item => item.productID === currentItem.productID);
      if (existingItem) {
        newErrors.productID = 'Sản phẩm này đã được thêm vào phiếu nhập';
      }
    }

    if (!currentItem.quantityImport) {
      newErrors.quantityImport = 'Vui lòng nhập số lượng';
    } else if (isNaN(currentItem.quantityImport) || parseInt(currentItem.quantityImport) <= 0) {
      newErrors.quantityImport = 'Số lượng phải là số dương';
    }

    setItemErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý thay đổi input form chính
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Xử lý thay đổi input item hiện tại
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    
    setCurrentItem(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error khi người dùng bắt đầu nhập
    if (itemErrors[name]) {
      setItemErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear error items khi bắt đầu thêm sản phẩm
    if (errors.items) {
      setErrors(prev => ({
        ...prev,
        items: ''
      }));
    }
  };

  // Thêm sản phẩm vào danh sách
  const addItemToList = () => {
    if (!validateCurrentItem()) {
      return;
    }

    const product = products.find(p => p.productId === parseInt(currentItem.productID));
    if (!product) {
      setItemErrors({ productID: 'Sản phẩm không tồn tại' });
      return;
    }

    const newItem = {
      productID: currentItem.productID,
      product: product,
      quantityImport: parseInt(currentItem.quantityImport),
      totalPrice: product.importPrice * parseInt(currentItem.quantityImport)
    };

    setImportItems(prev => [...prev, newItem]);
    
    // Reset form thêm sản phẩm
    setCurrentItem({
      productID: '',
      quantityImport: ''
    });
    setItemErrors({});
  };

  // Xóa sản phẩm khỏi danh sách
  const removeItemFromList = (productID) => {
    setImportItems(prev => prev.filter(item => item.productID !== productID));
  };

  // Cập nhật số lượng sản phẩm trong danh sách
  const updateItemQuantity = (productID, newQuantity) => {
    if (isNaN(newQuantity) || newQuantity <= 0) return;

    setImportItems(prev => prev.map(item => {
      if (item.productID === productID) {
        return {
          ...item,
          quantityImport: parseInt(newQuantity),
          totalPrice: item.product.importPrice * parseInt(newQuantity)
        };
      }
      return item;
    }));
  };

  // Tính tổng tiền toàn bộ phiếu nhập
  const calculateTotalAmount = () => {
    return importItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      // Format request theo API backend
      const createRequest = formatCreateImportReceiptRequest({
        date: formData.createDate,
        importDetails: importItems.map(item => ({
          productId: parseInt(item.productID),
          quantity: item.quantityImport
        }))
      });

      const result = await createImportReceipt(createRequest);

      if (result.success) {
        // Reset form
        setFormData({
          createDate: new Date().toISOString().split('T')[0]
        });
        setImportItems([]);
        setCurrentItem({
          productID: '',
          quantityImport: ''
        });
        setErrors({});
        setItemErrors({});

        // Gọi callback success
        if (onSuccess) {
          onSuccess(result.data, result.message);
        }

        alert('Tạo phiếu nhập hàng thành công!');
      } else {
        setApiError(result.message);
        
        // Xử lý validation errors từ API
        if (result.validationErrors) {
          const apiErrors = {};
          result.validationErrors.forEach(error => {
            if (error.field) {
              apiErrors[error.field] = error.message;
            }
          });
          setErrors(prev => ({ ...prev, ...apiErrors }));
        }
      }
    } catch (error) {
      console.error('Lỗi khi tạo phiếu nhập:', error);
      setApiError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Get product by ID
  const getProductById = (productId) => {
    return products.find(p => p.productId === parseInt(productId));
  };

  return (
    <div className="add-import-receipt-form bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tạo phiếu nhập hàng mới</h2>
        <p className="text-gray-600">Vui lòng điền đầy đủ thông tin để tạo phiếu nhập hàng</p>
      </div>

      {/* API Error */}
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Lỗi:</strong> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ngày nhập */}
        <div>
          <label htmlFor="createDate" className="block text-sm font-medium text-gray-700 mb-1">
            Ngày nhập <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="createDate"
            name="createDate"
            value={formData.createDate}
            onChange={handleInputChange}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.createDate ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.createDate && (
            <p className="mt-1 text-sm text-red-600">{errors.createDate}</p>
          )}
        </div>

        {/* Section thêm sản phẩm */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm sản phẩm vào phiếu nhập</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Chọn sản phẩm */}
            <div>
              <label htmlFor="productID" className="block text-sm font-medium text-gray-700 mb-1">
                Sản phẩm <span className="text-red-500">*</span>
              </label>
              <select
                id="productID"
                name="productID"
                value={currentItem.productID}
                onChange={handleItemChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  itemErrors.productID ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading || productLoading}
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map(product => (
                  <option key={product.productId} value={product.productId}>
                    {product.productName} - {formatCurrency(product.importPrice)}
                    {product.unit?.unitName && ` (${product.unit.unitName})`}
                  </option>
                ))}
              </select>
              {itemErrors.productID && (
                <p className="mt-1 text-sm text-red-600">{itemErrors.productID}</p>
              )}
            </div>

            {/* Số lượng */}
            <div>
              <label htmlFor="quantityImport" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantityImport"
                name="quantityImport"
                value={currentItem.quantityImport}
                onChange={handleItemChange}
                min="1"
                step="1"
                placeholder="Nhập số lượng"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  itemErrors.quantityImport ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {itemErrors.quantityImport && (
                <p className="mt-1 text-sm text-red-600">{itemErrors.quantityImport}</p>
              )}
            </div>

            {/* Button thêm */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={addItemToList}
                disabled={loading || productLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Thêm sản phẩm
              </button>
            </div>
          </div>

          {/* Thông tin sản phẩm đang chọn */}
          {currentItem.productID && (
            <div className="mt-4 bg-gray-50 p-3 rounded-lg">
              {(() => {
                const selectedProduct = getProductById(currentItem.productID);
                if (!selectedProduct) return null;
                
                return (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tên sản phẩm:</span>
                      <span className="ml-2 font-medium">{selectedProduct.productName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Giá nhập:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedProduct.importPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tồn kho hiện tại:</span>
                      <span className="ml-2 font-medium">{selectedProduct.inventoryQuantity || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Đơn vị:</span>
                      <span className="ml-2 font-medium">{selectedProduct.unit?.unitName || 'N/A'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Danh sách sản phẩm đã thêm */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Danh sách sản phẩm ({importItems.length})
            </h3>
            {importItems.length > 0 && (
              <div className="text-lg font-bold text-blue-600">
                Tổng tiền: {formatCurrency(calculateTotalAmount())}
              </div>
            )}
          </div>

          {errors.items && (
            <p className="mb-4 text-sm text-red-600">{errors.items}</p>
          )}

          {importItems.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">Chưa có sản phẩm nào được thêm vào phiếu nhập</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Đơn vị</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Đơn giá</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Số lượng</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thành tiền</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-gray-200">
                  {importItems.map((item, index) => (
                    <tr key={item.productID} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{item.product.productName}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.product.unit?.unitName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(item.product.importPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantityImport}
                          onChange={(e) => updateItemQuantity(item.productID, e.target.value)}
                          min="1"
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(item.totalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeItemFromList(item.productID)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || productLoading || importItems.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {loading ? 'Đang tạo...' : 'Tạo phiếu nhập'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddImportReceiptForm; 