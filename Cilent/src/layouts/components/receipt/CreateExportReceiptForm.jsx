import React, { useState, useEffect } from 'react';
import exportReceiptService from '../../../utils/exportReceiptService';
import agentService from '../../../utils/agentService';
import productService from '../../../utils/productService';
import ErrorNotification from '../common/ErrorNotification';

const CreateExportReceiptForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    agentId: '',
    productID: '',
    quantityExport: '',
    paidAmount: '',
    createDate: new Date().toISOString().split('T')[0]
  });

  const [agents, setAgents] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  // State cho ErrorNotification
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorNotificationData, setErrorNotificationData] = useState({
    message: '',
    productInfo: null
  });

  useEffect(() => {
    if (isOpen) {
      loadAgents();
      loadProducts();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      agentId: '',
      productID: '',
      quantityExport: '',
      paidAmount: '',
      createDate: new Date().toISOString().split('T')[0]
    });
    setSelectedProduct(null);
    setError('');
    setValidationErrors({});
  };

  const loadAgents = async () => {
    try {
      const data = await agentService.getAllAgents();
      setAgents(data);
    } catch (err) {
      console.error('Error loading agents:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      console.log('🔍 Raw products data from API:', data);
      console.log('🔍 First product structure:', data?.[0]);
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    console.log('🔍 Selected productId:', productId);
    console.log('🔍 Available products:', products);
    
    setFormData(prev => ({
      ...prev,
      productID: productId
    }));

    if (productId) {
      // Try multiple possible ID field names to handle API inconsistencies
      const product = products.find(p => 
        p.productId?.toString() === productId || 
        p.productID?.toString() === productId ||
        p.id?.toString() === productId
      );
      console.log('🔍 Found product:', product);
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }

    // Clear validation error
    if (validationErrors.productID) {
      setValidationErrors(prev => ({
        ...prev,
        productID: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.agentId) {
      errors.agentId = 'Vui lòng chọn đại lý';
    }

    if (!formData.productID) {
      errors.productID = 'Vui lòng chọn sản phẩm';
    }

    if (!formData.quantityExport) {
      errors.quantityExport = 'Vui lòng nhập số lượng xuất';
    } else {
      const quantity = parseInt(formData.quantityExport);
      if (isNaN(quantity) || quantity <= 0) {
        errors.quantityExport = 'Số lượng xuất phải là số nguyên dương';
      } else if (selectedProduct && quantity > selectedProduct.inventoryQuantity) {
        errors.quantityExport = `Số lượng xuất không được vượt quá tồn kho (${selectedProduct.inventoryQuantity})`;
      }
    }

    if (!formData.paidAmount) {
      errors.paidAmount = 'Vui lòng nhập số tiền đã trả';
    } else {
      const paidAmount = parseInt(formData.paidAmount);
      if (isNaN(paidAmount) || paidAmount < 0) {
        errors.paidAmount = 'Số tiền đã trả phải là số không âm';
      }
      
      // Check if paid amount doesn't exceed total amount
      if (selectedProduct && formData.quantityExport) {
        const totalAmount = parseInt(formData.quantityExport) * selectedProduct.exportPrice;
        if (paidAmount > totalAmount) {
          errors.paidAmount = `Số tiền đã trả không được vượt quá tổng tiền (${formatCurrency(totalAmount)})`;
        }
      }
    }

    if (!formData.createDate) {
      errors.createDate = 'Vui lòng chọn ngày tạo';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Add validation to ensure productID is not empty or null
      if (!formData.productID || formData.productID === '') {
        setError('Vui lòng chọn sản phẩm');
        return;
      }

      const submitData = {
        agentId: parseInt(formData.agentId),
        productID: parseInt(formData.productID),
        quantityExport: parseInt(formData.quantityExport),
        paidAmount: parseInt(formData.paidAmount),
        createDate: formData.createDate
      };

      console.log('🚀 Submitting export receipt data:', submitData);
      console.log('🔍 Raw formData before processing:', formData);

      // Validate all required fields are numbers
      if (isNaN(submitData.agentId) || isNaN(submitData.productID) || 
          isNaN(submitData.quantityExport) || isNaN(submitData.paidAmount)) {
        setError('Có lỗi trong dữ liệu số. Vui lòng kiểm tra lại.');
        return;
      }

      await exportReceiptService.createExportReceipt(submitData);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Export receipt creation error:', err);
      
      // Lấy thông tin sản phẩm để hiển thị trong error notification
   
      
      // Sử dụng ErrorNotification thay vì state error
      setErrorNotificationData({
        message: err.message,
        productInfo: productInfo
      });
      setShowErrorNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculateTotalAmount = () => {
    if (selectedProduct && formData.quantityExport) {
      const quantity = parseInt(formData.quantityExport);
      if (!isNaN(quantity) && quantity > 0) {
        return quantity * selectedProduct.exportPrice;
      }
    }
    return 0;
  };

  const calculateRemainingAmount = () => {
    const totalAmount = calculateTotalAmount();
    const paidAmount = parseInt(formData.paidAmount) || 0;
    return Math.max(0, totalAmount - paidAmount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tạo phiếu xuất hàng mới</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agent Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đại lý <span className="text-red-500">*</span>
            </label>
            <select
              name="agentId"
              value={formData.agentId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.agentId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Chọn đại lý</option>
              {agents.map(agent => (
                <option key={agent.agentId} value={agent.agentId}>
                  {agent.agentCode} - {agent.agentName}
                </option>
              ))}
            </select>
            {validationErrors.agentId && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.agentId}</p>
            )}
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sản phẩm <span className="text-red-500">*</span>
            </label>
            <select
              name="productID"
              value={formData.productID}
              onChange={handleProductChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.productID ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Chọn sản phẩm</option>
              {products.map(product => {
                const productId = product.productId || product.productID || product.id;
                return (
                  <option key={productId} value={productId}>
                    {product.productName} - Tồn kho: {product.inventoryQuantity} - Giá: {formatCurrency(product.exportPrice)}
                  </option>
                );
              })}
            </select>
            {validationErrors.productID && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.productID}</p>
            )}
          </div>

          {/* Product Info Display */}
          {selectedProduct && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Thông tin sản phẩm</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tên sản phẩm:</span>
                  <span className="ml-2 font-medium">{selectedProduct.productName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Đơn vị:</span>
                  <span className="ml-2 font-medium">{selectedProduct.unit?.unitName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tồn kho:</span>
                  <span className="ml-2 font-medium">{selectedProduct.inventoryQuantity}</span>
                </div>
                <div>
                  <span className="text-gray-600">Giá xuất:</span>
                  <span className="ml-2 font-medium">{formatCurrency(selectedProduct.exportPrice)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Export */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng xuất <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantityExport"
              value={formData.quantityExport}
              onChange={handleInputChange}
              min="1"
              max={selectedProduct?.inventoryQuantity || undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.quantityExport ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập số lượng xuất"
            />
            {validationErrors.quantityExport && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.quantityExport}</p>
            )}
          </div>

          {/* Amount Calculation Display */}
          {calculateTotalAmount() > 0 && (
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Tính toán tiền</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Tổng tiền:</span>
                  <span className="font-medium">{formatCurrency(calculateTotalAmount())}</span>
                </div>
              </div>
            </div>
          )}

          {/* Paid Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền đã trả <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="paidAmount"
              value={formData.paidAmount}
              onChange={handleInputChange}
              min="0"
              max={calculateTotalAmount() || undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.paidAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập số tiền đã trả"
            />
            {validationErrors.paidAmount && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.paidAmount}</p>
            )}
          </div>

          {/* Remaining Amount Display */}
          {calculateTotalAmount() > 0 && formData.paidAmount && (
            <div className="bg-yellow-50 p-3 rounded-md">
              <div className="flex justify-between text-sm">
                <span>Số tiền còn lại:</span>
                <span className="font-medium">{formatCurrency(calculateRemainingAmount())}</span>
              </div>
            </div>
          )}

          {/* Create Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày tạo <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="createDate"
              value={formData.createDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.createDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.createDate && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.createDate}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo phiếu xuất'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Error Notification */}
      <ErrorNotification
        isVisible={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        message={errorNotificationData.message}
        productInfo={errorNotificationData.productInfo}
      />
    </div>
  );
};

export default CreateExportReceiptForm; 