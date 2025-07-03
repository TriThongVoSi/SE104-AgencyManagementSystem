import React, { useState, useEffect } from 'react';
import { addProduct, getExportPriceRatio, calculateExportPrice } from '../../../utils/productService';
import { toast } from 'react-toastify';

const ProductForm = ({ onCancel, setShowForm, products, setProducts }) => {
  const [productData, setProductData] = useState({
    productName: '',
    unitName: '',
    importPrice: '',
    exportPrice: '',
    inventoryQuantity: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportRatio, setExportRatio] = useState(1.02);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  // Load export price ratio khi component mount và khi form được mở
  useEffect(() => {
    const loadExportRatio = async () => {
      try {
        const ratio = await getExportPriceRatio();
        console.log('🔄 ProductForm: Đã tải tỷ lệ giá xuất từ Parameter:', ratio);
        setExportRatio(ratio);
      } catch (error) {
        console.warn('Không thể tải tỷ lệ giá xuất, sử dụng giá trị mặc định 1.02');
        setExportRatio(1.02);
      }
    };
    loadExportRatio();
  }, []); // Form này được tạo mới mỗi lần mở nên chỉ cần load 1 lần

  const validateForm = () => {
    const newErrors = {};
    if (!productData.productName) newErrors.productName = 'Tên sản phẩm không được để trống';
    if (!productData.unitName) newErrors.unitName = 'Đơn vị không được để trống';
    if (!productData.importPrice || parseFloat(productData.importPrice) <= 0)
      newErrors.importPrice = 'Giá nhập phải là số dương';
    // Removed validation for exportPrice as it's auto-calculated
    // Removed validation for inventoryQuantity as it's not needed for creation
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
    setErrors({ ...errors, [name]: null });

    // Auto-calculate export price when import price changes
    if (name === 'importPrice' && value && parseFloat(value) > 0) {
      handleImportPriceChange(parseFloat(value));
    } else if (name === 'importPrice' && !value) {
      // Clear export price if import price is cleared
      setProductData(prev => ({ ...prev, exportPrice: '' }));
    }
  };

  const handleImportPriceChange = async (importPrice) => {
    if (importPrice <= 0) return;
    
    setCalculatingPrice(true);
    try {
      const calculatedExportPrice = await calculateExportPrice(importPrice, exportRatio);
      setProductData(prev => ({ 
        ...prev, 
        exportPrice: calculatedExportPrice.toString()
      }));
    } catch (error) {
      console.error('Lỗi khi tính giá xuất:', error);
      // Fallback calculation
      const fallbackPrice = Math.round(importPrice * exportRatio);
      setProductData(prev => ({ 
        ...prev, 
        exportPrice: fallbackPrice.toString()
      }));
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess(null);

    try {
      // Use the new addProduct API
      const response = await addProduct({
        productName: productData.productName,
        unitName: productData.unitName,
        importPrice: parseFloat(productData.importPrice)
      });

      if (response.status === 'success') {
        // Update products list with the new product
        const newProduct = response.data;
        setProducts([...products, newProduct]);
        
        setSuccess(response.message || 'Thêm sản phẩm thành công!');
        toast.success(response.message || 'Thêm sản phẩm thành công!');
        
        // Reset form
        setProductData({
          productName: '',
          unitName: '',
          importPrice: '',
          exportPrice: '',
          inventoryQuantity: '',
        });
        
        // Close form after a short delay
        setTimeout(() => {
          setShowForm(false);
        }, 1500);
      } else {
        setErrors({ general: response.message || 'Có lỗi xảy ra khi thêm sản phẩm' });
        toast.error(response.message || 'Có lỗi xảy ra khi thêm sản phẩm');
      }
    } catch (error) {
      const errorMessage = error.message || 'Có lỗi xảy ra khi thêm sản phẩm';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
      console.error('Lỗi thêm sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <div className="bg-[#2a3b4c] rounded-lg shadow-md p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Thêm Sản Phẩm Mới</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">
            Tỷ lệ giá xuất: <strong className="text-blue-400">{exportRatio}</strong>
          </span>
          <button
            type="button"
            onClick={async () => {
              try {
                const ratio = await getExportPriceRatio();
                console.log('🔄 ProductForm: Đã làm mới tỷ lệ giá xuất:', ratio);
                setExportRatio(ratio);
                // Recalculate export price if import price exists
                if (productData.importPrice) {
                  handleImportPriceChange(parseFloat(productData.importPrice));
                }
              } catch (error) {
                console.warn('Không thể làm mới tỷ lệ giá xuất');
              }
            }}
            disabled={loading}
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
            title="Làm mới tỷ lệ giá xuất"
          >
            🔄
          </button>
        </div>
      </div>
      
      {/* Export ratio info */}
   

      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-300 px-4 py-2 rounded mb-4">
          {success}
        </div>
      )}
      {errors.general && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium">
            Tên sản phẩm <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="productName"
            value={productData.productName}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full bg-[#1a2634] border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-600 text-white disabled:opacity-50"
            placeholder="Nhập tên sản phẩm (VD: Sữa tươi TH True Milk)"
          />
          {errors.productName && <p className="text-red-400 text-sm mt-1">{errors.productName}</p>}
        </div>

        {/* Unit Name */}
        <div>
          <label className="block text-sm font-medium">
            Đơn vị <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="unitName"
            value={productData.unitName}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full bg-[#1a2634] border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-600 text-white disabled:opacity-50"
            placeholder="Nhập đơn vị (VD: Thùng, Chai, Lốc)"
          />
          {errors.unitName && <p className="text-red-400 text-sm mt-1">{errors.unitName}</p>}
        </div>

        {/* Import and Export Price */}
        <div className="grid grid-cols-2 gap-4">
          {/* Import Price */}
          <div>
            <label className="block text-sm font-medium">
              Giá nhập (VND) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="importPrice"
              value={productData.importPrice}
              onChange={handleChange}
              disabled={loading}
              min="1"
              step="1000"
              className="mt-1 block w-full bg-[#1a2634] border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-600 text-white disabled:opacity-50"
              placeholder="Nhập giá nhập"
            />
            {errors.importPrice && <p className="text-red-400 text-sm mt-1">{errors.importPrice}</p>}
            {productData.importPrice && (
              <p className="text-gray-400 text-xs mt-1">
                {formatCurrency(productData.importPrice)} VND
              </p>
            )}
          </div>

          {/* Export Price (Read-only) */}
          <div>
            <label className="block text-sm font-medium">
              Giá xuất (VND) <span className="text-green-400 text-xs">(Tự động tính)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="exportPrice"
                value={calculatingPrice ? 'Đang tính...' : (productData.exportPrice ? formatCurrency(productData.exportPrice) : '')}
                readOnly
                className="mt-1 block w-full bg-gray-700 border border-gray-500 rounded-md p-2 text-gray-300 cursor-not-allowed"
                placeholder="Giá xuất sẽ tự động tính"
              />
              {calculatingPrice && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                </div>
              )}
            </div>
            {productData.exportPrice && !calculatingPrice && (
              <p className="text-green-400 text-xs mt-1">
                = {formatCurrency(productData.importPrice)} × {exportRatio} = {formatCurrency(productData.exportPrice)} VND
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading || calculatingPrice}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang thêm...
              </>
            ) : (
              'Thêm sản phẩm'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-700 transition text-white disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;