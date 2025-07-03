import React, { useState, useEffect } from 'react';
import { 
  getImportReceiptById,
  updateImportReceipt,
  formatCreateImportReceiptRequest 
} from '../../../utils/importReceiptService.js';
import { getAllProducts } from '../../../utils/productService.jsx';
import { getImportDetailsByImportReceiptId } from '../../../utils/importDetailService.js';

/**
 * Component Modal chỉnh sửa phiếu nhập hàng
 * Tích hợp với ImportReceiptService và ImportDetailService
 * 
 * Features:
 * - Chỉnh sửa thông tin cơ bản của phiếu nhập
 * - Xem và chỉnh sửa chi tiết các sản phẩm trong phiếu
 * - Form validation toàn diện
 * - Giao diện thân thiện người dùng
 * - Xử lý lỗi API chi tiết
 * - Loading states
 * - Auto-calculate tổng tiền
 */
const EditImportReceiptModal = ({ isOpen, onClose, receipt, onSuccess }) => {
  // Main form data
  const [formData, setFormData] = useState({
    importReceiptId: '',
    createDate: '',
    totalAmount: 0,
    note: ''
  });

  // Import details data
  const [importDetails, setImportDetails] = useState([]);
  const [originalDetails, setOriginalDetails] = useState([]);
  
  // Products data
  const [products, setProducts] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'details'

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && receipt) {
      loadReceiptData();
      loadProducts();
      setError('');
      setValidationErrors({});
      setActiveTab('info');
    }
  }, [isOpen, receipt]);

  /**
   * Load receipt data and details
   */
  const loadReceiptData = async () => {
    if (!receipt.importReceiptId) return;
    
    setLoading(true);
    try {
      // Load receipt details
      const detailsResult = await getImportDetailsByImportReceiptId(receipt.importReceiptId);
      
      if (detailsResult.success) {
        const details = detailsResult.data.map(detail => ({
          importDetailId: detail.importDetailId,
          productID: detail.product.productId,
          product: detail.product,
          quantityImport: detail.quantityImport,
          importPrice: detail.importPrice,
          totalPrice: detail.quantityImport * detail.importPrice,
          isModified: false
        }));
        
        setImportDetails(details);
        setOriginalDetails(JSON.parse(JSON.stringify(details)));
        
        // Calculate total amount
        const totalAmount = details.reduce((sum, detail) => sum + detail.totalPrice, 0);
        
        setFormData({
          importReceiptId: receipt.importReceiptId,
          createDate: receipt.createDate || '',
          totalAmount: totalAmount,
          note: receipt.note || ''
        });
      } else {
        setError('Không thể tải chi tiết phiếu nhập: ' + detailsResult.message);
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu phiếu nhập');
      console.error('Load receipt data error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load products for dropdown
   */
  const loadProducts = async () => {
    setProductLoading(true);
    try {
      const result = await getAllProducts();
      if (result.status === 'success' || result.success) {
        setProducts(result.data || []);
      } else {
        console.error('Không thể tải danh sách sản phẩm:', result.message);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
    } finally {
      setProductLoading(false);
    }
  };

  /**
   * Handle input change for main form
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Handle detail quantity change
   */
  const handleDetailQuantityChange = (importDetailId, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0;
    
    setImportDetails(prev => prev.map(detail => {
      if (detail.importDetailId === importDetailId) {
        const totalPrice = quantity * detail.importPrice;
        return {
          ...detail,
          quantityImport: quantity,
          totalPrice: totalPrice,
          isModified: true
        };
      }
      return detail;
    }));

    // Recalculate total amount
    recalculateTotalAmount();
  };

  /**
   * Handle detail price change
   */
  const handleDetailPriceChange = (importDetailId, newPrice) => {
    const price = parseInt(newPrice) || 0;
    
    setImportDetails(prev => prev.map(detail => {
      if (detail.importDetailId === importDetailId) {
        const totalPrice = detail.quantityImport * price;
        return {
          ...detail,
          importPrice: price,
          totalPrice: totalPrice,
          isModified: true
        };
      }
      return detail;
    }));

    // Recalculate total amount
    recalculateTotalAmount();
  };

  /**
   * Recalculate total amount
   */
  const recalculateTotalAmount = () => {
    setTimeout(() => {
      setFormData(prev => {
        const newTotal = importDetails.reduce((sum, detail) => sum + (detail.totalPrice || 0), 0);
        return {
          ...prev,
          totalAmount: newTotal
        };
      });
    }, 0);
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.createDate) {
      errors.createDate = 'Vui lòng chọn ngày tạo phiếu nhập';
    } else {
      const selectedDate = new Date(formData.createDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (selectedDate > today) {
        errors.createDate = 'Ngày tạo không được lớn hơn ngày hiện tại';
      }
    }

    // Validate import details
    let hasInvalidDetails = false;
    importDetails.forEach(detail => {
      if (detail.quantityImport <= 0) {
        errors[`quantity_${detail.importDetailId}`] = 'Số lượng phải lớn hơn 0';
        hasInvalidDetails = true;
      }
      if (detail.importPrice <= 0) {
        errors[`price_${detail.importDetailId}`] = 'Giá nhập phải lớn hơn 0';
        hasInvalidDetails = true;
      }
    });

    if (hasInvalidDetails) {
      errors.details = 'Vui lòng kiểm tra lại thông tin chi tiết phiếu nhập';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveTab('details'); // Switch to details tab if there are detail errors
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare update data
      const updateData = {
        importReceiptId: parseInt(formData.importReceiptId),
        createDate: formData.createDate,
        totalAmount: formData.totalAmount,
        note: formData.note,
        importDetails: importDetails.map(detail => ({
          importDetailId: detail.importDetailId,
          productID: detail.productID,
          quantityImport: detail.quantityImport,
          importPrice: detail.importPrice
        }))
      };

      console.log('Updating import receipt:', updateData);
      
      const result = await updateImportReceipt(updateData);
      
      if (result.success) {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(result.message || 'Không thể cập nhật phiếu nhập');
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);
        }
      }
    } catch (err) {
      setError('Lỗi khi cập nhật phiếu nhập: ' + (err.message || err));
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset changes for a detail
   */
  const resetDetailChanges = (importDetailId) => {
    const originalDetail = originalDetails.find(d => d.importDetailId === importDetailId);
    if (originalDetail) {
      setImportDetails(prev => prev.map(detail => 
        detail.importDetailId === importDetailId 
          ? { ...originalDetail, isModified: false }
          : detail
      ));
      recalculateTotalAmount();
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto w-full max-w-6xl bg-white rounded-xl shadow-2xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Chỉnh sửa phiếu nhập hàng
                </h3>
                <p className="text-blue-100 text-sm">
                  Mã phiếu: PN{receipt.importReceiptId?.toString().padStart(6, '0')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-6">

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-gray-50 rounded-lg p-1 mb-6">
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
                    activeTab === 'info'
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Thông tin chung</span>
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200 relative ${
                    activeTab === 'details'
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Chi tiết sản phẩm</span>
                  {importDetails.some(d => d.isModified) && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    </span>
                  )}
                </button>
              </nav>
            </div>

        <form onSubmit={handleSubmit}>
            {/* General Information Tab */}
            {activeTab === 'info' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Create Date */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Ngày tạo phiếu <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="createDate"
                      value={formData.createDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg text-gray-900 font-medium transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500 ${
                        validationErrors.createDate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={loading}
                    />
                    {validationErrors.createDate && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{validationErrors.createDate}</p>
                    )}
                  </div>

                  {/* Total Amount (Read-only) */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Tổng tiền
                    </label>
                    <div className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
                      <span className="text-xl font-bold text-green-700">{formatCurrency(formData.totalAmount)}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 italic">
                      💡 Tổng tiền sẽ được tự động tính toán từ chi tiết sản phẩm
                    </p>
                  </div>

                  {/* Note */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                      <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Ghi chú
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500 hover:border-gray-400 resize-none"
                      placeholder="💬 Nhập ghi chú cho phiếu nhập (tùy chọn)..."
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Product Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {validationErrors.details && (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-800">{validationErrors.details}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span>Sản phẩm</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              <span>Số lượng</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span>Giá nhập</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span>Thành tiền</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Thao tác</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importDetails.map((detail, index) => (
                            <tr 
                              key={detail.importDetailId} 
                              className={`transition-all duration-200 hover:bg-gray-50 ${
                                detail.isModified ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-orange-400' : ''
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-gray-900">
                                      {detail.product.productName}
                                    </div>
                                    <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                                      Mã: {detail.product.productCode}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col space-y-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={detail.quantityImport}
                                    onChange={(e) => handleDetailQuantityChange(detail.importDetailId, e.target.value)}
                                    className={`w-24 px-3 py-2 border rounded-lg text-center font-semibold text-gray-900 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50 ${
                                      validationErrors[`quantity_${detail.importDetailId}`] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    disabled={loading}
                                  />
                                  {validationErrors[`quantity_${detail.importDetailId}`] && (
                                    <p className="text-xs text-red-600 font-medium">
                                      {validationErrors[`quantity_${detail.importDetailId}`]}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col space-y-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={detail.importPrice}
                                    onChange={(e) => handleDetailPriceChange(detail.importDetailId, e.target.value)}
                                    className={`w-36 px-3 py-2 border rounded-lg font-semibold text-gray-900 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50 ${
                                      validationErrors[`price_${detail.importDetailId}`] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    disabled={loading}
                                  />
                                  {validationErrors[`price_${detail.importDetailId}`] && (
                                    <p className="text-xs text-red-600 font-medium">
                                      {validationErrors[`price_${detail.importDetailId}`]}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                  </svg>
                                  <span className="text-lg font-bold text-green-700">
                                    {formatCurrency(detail.totalPrice)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {detail.isModified && (
                                  <button
                                    type="button"
                                    onClick={() => resetDetailChanges(detail.importDetailId)}
                                    className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50"
                                    disabled={loading}
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Hoàn tác
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-lg font-bold text-gray-700">Tổng cộng:</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                <span className="text-2xl font-bold text-green-700">
                                  {formatCurrency(formData.totalAmount)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 mt-8 rounded-b-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>💡 Lưu ý: Kiểm tra kỹ thông tin trước khi cập nhật</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-3 focus:ring-gray-300 focus:ring-opacity-50 transition-all duration-200"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang cập nhật...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Cập nhật phiếu nhập</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditImportReceiptModal;