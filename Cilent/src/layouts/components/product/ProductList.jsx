import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBoxes, FaRuler, FaUsers, FaMapMarkedAlt, FaSave, FaTimes, FaDollarSign, FaWarehouse } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ErrorNotification from '../common/ErrorNotification';
import { addProduct, getExportPriceRatio, calculateExportPrice } from '../../../utils/productService';
import { getAllUnits } from '../../../utils/unitService';
import parametersService from '../../../utils/parametersService';
import { useAuth } from '../../../contexts/AuthContext';

const CategoryManagement = () => {
  const { token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [agentTypes, setAgentTypes] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  // Common states for all tabs
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // States for auto price calculation
  const [exportRatio, setExportRatio] = useState(1.02);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  
  // States for export ratio editing
  const [editingExportRatio, setEditingExportRatio] = useState(false);
  const [newExportRatio, setNewExportRatio] = useState('');
  const [updatingRatio, setUpdatingRatio] = useState(false);
  
  // States for import price editing
  const [editingImportPrice, setEditingImportPrice] = useState(null); // null or product object
  const [newImportPrice, setNewImportPrice] = useState('');
  const [updatingImportPrice, setUpdatingImportPrice] = useState(false);
  
  // States for inventory quantity editing
  const [editingInventory, setEditingInventory] = useState(null); // null or product object
  const [newInventoryQuantity, setNewInventoryQuantity] = useState('');
  const [updatingInventory, setUpdatingInventory] = useState(false);
  
  // States for error notification
  const [errorNotification, setErrorNotification] = useState({
    isVisible: false,
    title: '',
    message: '',
    details: null,
    type: 'error'
  });

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Helper function to show beautiful error notification
  const showErrorNotification = (title, message, details = null, type = 'error') => {
    setErrorNotification({
      isVisible: true,
      title,
      message,
      details,
      type
    });
  };

  // Helper function to hide error notification
  const hideErrorNotification = () => {
    setErrorNotification({
      isVisible: false,
      title: '',
      message: '',
      details: null,
      type: 'error'
    });
  };

  // Helper function to get color classes
  const getColorClasses = (color, type = 'bg') => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-600',
        bgHover: 'hover:bg-blue-700',
        ring: 'focus:ring-blue-500',
        bgActive: 'bg-blue-600'
      },
      green: {
        bg: 'bg-green-600',
        bgHover: 'hover:bg-green-700',
        ring: 'focus:ring-green-500',
        bgActive: 'bg-green-600'
      },
      purple: {
        bg: 'bg-purple-600',
        bgHover: 'hover:bg-purple-700',
        ring: 'focus:ring-purple-500',
        bgActive: 'bg-purple-600'
      },
      orange: {
        bg: 'bg-orange-600',
        bgHover: 'hover:bg-orange-700',
        ring: 'focus:ring-orange-500',
        bgActive: 'bg-orange-600'
      }
    };
    
    return colorMap[color] || colorMap.blue;
  };

  // Tab configuration
  const tabs = [
    { id: 'items', name: 'Mặt hàng', icon: FaBoxes, color: 'blue' },
    { id: 'units', name: 'Đơn vị tính', icon: FaRuler, color: 'green' },
    { id: 'agentTypes', name: 'Loại đại lý', icon: FaUsers, color: 'purple' },
    { id: 'districts', name: 'Quận', icon: FaMapMarkedAlt, color: 'orange' }
  ];

  // Fetch data functions
  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.code === 200) {
        setItems(data.data || []);
      } else {
        throw new Error('Failed to fetch items');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách mặt hàng:', error);
      toast.error('Lỗi khi tải danh sách mặt hàng!');
      setItems([]); // Set empty array on error
    }
  };

  const fetchUnits = async () => {
    try {
      const result = await getAllUnits();
      if (result.status === 'success') {
        setUnits(result.data || []);
      } else {
        throw new Error('Failed to fetch units');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn vị:', error);
      toast.error('Lỗi khi tải danh sách đơn vị!');
      setUnits([]); // Set empty array on error
    }
  };

  const fetchAgentTypes = async () => {
    try {
      const response = await fetch('http://localhost:8080/agent-type/all', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.code === 200) {
        setAgentTypes(data.data || []);
      } else {
        throw new Error('Failed to fetch agent types');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách loại đại lý:', error);
      toast.error('Lỗi khi tải danh sách loại đại lý!');
      setAgentTypes([]); // Set empty array on error
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await fetch('http://localhost:8080/district/all', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Districts fetched:', data);
      
      if (data.code === 200 || data.status === 'success') {
        setDistricts(data.data || []);
      } else {
        throw new Error('Failed to fetch districts');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách quận:', error);
      toast.error('Lỗi khi tải danh sách quận!');
      setDistricts([]); // Set empty array on error
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchItems();
      fetchUnits();
      fetchAgentTypes();
      fetchDistricts();
      loadExportRatio(); // Load export ratio from API
    }
  }, [isAuthenticated, token]);

  // Reload export ratio when items tab form is opened
  useEffect(() => {
    if ((showAddForm || editingItem) && activeTab === 'items') {
      loadExportRatio();
    }
  }, [showAddForm, editingItem, activeTab]);

  // Load export price ratio
  const loadExportRatio = async () => {
    try {
      const ratio = await getExportPriceRatio();
      console.log('🔄 Đã tải tỷ lệ giá xuất từ Parameter:', ratio);
      setExportRatio(ratio);
      return ratio;
    } catch (error) {
      console.warn('Không thể tải tỷ lệ giá xuất, sử dụng giá trị mặc định 1.02');
      setExportRatio(1.02);
      return 1.02;
    }
  };

  // Function để cập nhật lại export prices cho tất cả products trong database
  const updateAllProductsExportPrices = async (newRatio) => {
    try {
      console.log('🔄 Đang cập nhật export prices cho tất cả sản phẩm với tỷ lệ mới:', newRatio);
      
      // Gọi API để cập nhật tất cả export prices với ratio mới
      const response = await fetch('http://localhost:8080/api/products/updateAllExportPrices', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          exportPriceRatio: newRatio
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Đã cập nhật export prices thành công:', result);
        return true;
      } else {
        console.warn('⚠️ API cập nhật export prices không thành công, sẽ reload data');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Lỗi khi cập nhật export prices:', error.message);
      return false;
    }
  };

  // Handle export ratio update
  const handleUpdateExportRatio = async () => {
    if (!newExportRatio || parseFloat(newExportRatio) <= 0) {
      toast.error('Tỷ lệ giá xuất phải là số dương');
      return;
    }

    setUpdatingRatio(true);
    try {
      const newRatio = parseFloat(newExportRatio);
      
      // 1. Cập nhật parameter trước
      const paramResult = await parametersService.updateParameter('export_price_ratio', newExportRatio, 'Tỷ lệ đơn giá xuất');
      
      if (paramResult.success) {
        console.log('✅ Parameter đã được cập nhật:', paramResult.data);
        
        // 2. Cập nhật state frontend
        setExportRatio(newRatio);
        setEditingExportRatio(false);
        setNewExportRatio('');
        
        toast.success('Cập nhật tỷ lệ giá xuất thành công!');
        
        // 3. Cập nhật export prices cho tất cả products
        const updateSuccess = await updateAllProductsExportPrices(newRatio);
        
        if (updateSuccess) {
          toast.success('✅ Đã cập nhật giá xuất cho tất cả sản phẩm!', { autoClose: 3000 });
        } else {
          toast.info('🔄 Đang tải lại danh sách sản phẩm...', { autoClose: 2000 });
        }
        
        // 4. Reload items để hiển thị giá mới
        await fetchItems();
        
      } else {
        toast.error('Có lỗi xảy ra: ' + paramResult.error);
      }
    } catch (error) {
      console.error('Error updating export ratio:', error);
      toast.error('Có lỗi xảy ra khi cập nhật tỷ lệ giá xuất');
    } finally {
      setUpdatingRatio(false);
    }
  };

  // Start editing export ratio
  const startEditingExportRatio = () => {
    setEditingExportRatio(true);
    setNewExportRatio(exportRatio.toString());
  };

  // Cancel editing export ratio
  const cancelEditingExportRatio = () => {
    setEditingExportRatio(false);
    setNewExportRatio('');
  };

  // Start editing import price
  const startEditingImportPrice = (product) => {
    setEditingImportPrice(product);
    setNewImportPrice(product.import_price || product.importPrice || '');
  };

  // Start editing inventory quantity
  const startEditingInventory = (product) => {
    setEditingInventory(product);
    setNewInventoryQuantity(product.inventory_quantity ?? product.inventoryQuantity ?? '0');
  };

  // Handle keyboard shortcuts for modals
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (editingImportPrice) {
          cancelEditingImportPrice();
        }
        if (editingInventory) {
          cancelEditingInventory();
        }
      }
    };

    if (editingImportPrice || editingInventory) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [editingImportPrice, editingInventory]);

  // Cancel editing import price
  const cancelEditingImportPrice = () => {
    setEditingImportPrice(null);
    setNewImportPrice('');
  };

  // Cancel editing inventory quantity
  const cancelEditingInventory = () => {
    setEditingInventory(null);
    setNewInventoryQuantity('');
  };

  // Handle update import price
  const handleUpdateImportPrice = async () => {
    if (!editingImportPrice) {
      toast.error('Không tìm thấy sản phẩm để cập nhật!');
      return;
    }

    if (!newImportPrice || parseFloat(newImportPrice) <= 0) {
      toast.error('Giá nhập phải là số dương');
      return;
    }

    // Check authentication
    if (!isAuthenticated || !token) {
      toast.error('Bạn cần đăng nhập để thực hiện thao tác này!');
      return;
    }

    setUpdatingImportPrice(true);
    try {
      const productId = editingImportPrice.product_id || editingImportPrice.productID || editingImportPrice.productId;
      
      if (!productId) {
        toast.error('Không tìm thấy ID sản phẩm!');
        return;
      }

      const importPrice = parseInt(newImportPrice);
      
      console.log(`🔄 Đang cập nhật giá nhập cho sản phẩm ID: ${productId}`);
      console.log(`💰 Giá nhập mới: ${importPrice}`);
      
      const response = await fetch(`http://localhost:8080/api/products/${productId}/import-price`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          importPrice: importPrice
        })
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}, response: ${errorText}`);
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          } else {
            errorMessage += ` - ${errorText}`;
          }
        } catch (parseError) {
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Update import price response:', result);
      
      if (result.code === 200 && result.status === 'success') {
        toast.success(result.message || 'Cập nhật giá nhập thành công!');
        
        // Reset form
        cancelEditingImportPrice();
        
        // Reload items to show updated prices
        await fetchItems();
        
      } else {
        const errorMsg = result.message || result.error || 'Lỗi khi cập nhật giá nhập';
        console.error('❌ Update import price failed:', result);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật giá nhập:', error);
      let errorMessage = 'Lỗi khi cập nhật giá nhập';
      
      if (error.message.includes('401')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!';
      } else if (error.message.includes('403')) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này! Cần quyền ADMIN hoặc WAREHOUSE_ACCOUNTANT.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Sản phẩm không tồn tại hoặc đã bị xóa!';
      } else if (error.message.includes('400')) {
        errorMessage = 'Giá nhập không hợp lệ!';
      } else if (error.message.includes('500')) {
        errorMessage = 'Lỗi máy chủ khi cập nhật giá nhập. Vui lòng thử lại!';
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setUpdatingImportPrice(false);
    }
  };

  // Handle update inventory quantity
  const handleUpdateInventory = async () => {
    if (!editingInventory) {
      toast.error('Không tìm thấy sản phẩm để cập nhật!');
      return;
    }

    if (newInventoryQuantity === '' || parseInt(newInventoryQuantity) < 0) {
      toast.error('Số lượng tồn kho phải là số không âm');
      return;
    }

    // Check authentication
    if (!isAuthenticated || !token) {
      toast.error('Bạn cần đăng nhập để thực hiện thao tác này!');
      return;
    }

    setUpdatingInventory(true);
    try {
      const productId = editingInventory.product_id || editingInventory.productID || editingInventory.productId;
      
      if (!productId) {
        toast.error('Không tìm thấy ID sản phẩm!');
        return;
      }

      const inventoryQuantity = parseInt(newInventoryQuantity);
      
      console.log(`🔄 Đang cập nhật số lượng tồn kho cho sản phẩm ID: ${productId}`);
      console.log(`📦 Số lượng tồn kho mới: ${inventoryQuantity}`);
      
      const response = await fetch(`http://localhost:8080/api/products/${productId}/inventory`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          inventoryQuantity: inventoryQuantity
        })
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}, response: ${errorText}`);
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          } else {
            errorMessage += ` - ${errorText}`;
          }
        } catch (parseError) {
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Update inventory response:', result);
      
      if (result.code === 200 && result.status === 'success') {
        toast.success(result.message || 'Cập nhật số lượng tồn kho thành công!');
        
        // Reset form
        cancelEditingInventory();
        
        // Reload items to show updated inventory
        await fetchItems();
        
      } else {
        const errorMsg = result.message || result.error || 'Lỗi khi cập nhật số lượng tồn kho';
        console.error('❌ Update inventory failed:', result);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật số lượng tồn kho:', error);
      let errorMessage = 'Lỗi khi cập nhật số lượng tồn kho';
      
      if (error.message.includes('401')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!';
      } else if (error.message.includes('403')) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này! Cần quyền ADMIN hoặc WAREHOUSE_ACCOUNTANT.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Sản phẩm không tồn tại hoặc đã bị xóa!';
      } else if (error.message.includes('400')) {
        errorMessage = 'Số lượng tồn kho không hợp lệ!';
      } else if (error.message.includes('500')) {
        errorMessage = 'Lỗi máy chủ khi cập nhật số lượng tồn kho. Vui lòng thử lại!';
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setUpdatingInventory(false);
    }
  };

  // Handle form data change with auto price calculation
  const handleFormDataChange = async (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time duplicate check for product name + unit combination
    if (activeTab === 'items' && (field === 'product_name' || field === 'unit') && value) {
      const currentProductName = field === 'product_name' ? value : formData.product_name;
      const currentUnit = field === 'unit' ? value : formData.unit;
      
      if (currentProductName && currentProductName.trim() && currentUnit) {
        if (checkDuplicateProduct(currentProductName, currentUnit)) {
          const unitName = units.find(u => (u.unitId || u.id) == currentUnit)?.unitName || 'N/A';
          toast.warning(`⚠️ "${currentProductName}" + "${unitName}" đã tồn tại!`, {
            toastId: 'duplicate-combination-warning',
            autoClose: 4000
          });
        }
      } else if (currentProductName && currentProductName.trim() && !currentUnit) {
        // Only show info about existing product name (not error)
        const existingUnits = getExistingUnitsForProduct(currentProductName);
        if (existingUnits.length > 0) {
          toast.info(`💡 "${currentProductName}" đã có với đơn vị: ${existingUnits.map(u => u.unitName).join(', ')}`, {
            toastId: 'existing-product-info',
            autoClose: 5000
          });
        }
      }
    }

    // Auto-calculate export price when import price changes for items tab
    if (activeTab === 'items' && field === 'import_price' && value && parseFloat(value) > 0) {
      setCalculatingPrice(true);
      try {
        const calculatedExportPrice = await calculateExportPrice(parseFloat(value), exportRatio);
        setFormData(prev => ({ 
          ...prev, 
          export_price: calculatedExportPrice.toString()
        }));
      } catch (error) {
        console.error('Lỗi khi tính giá xuất:', error);
        // Fallback calculation
        const fallbackPrice = Math.round(parseFloat(value) * exportRatio);
        setFormData(prev => ({ 
          ...prev, 
          export_price: fallbackPrice.toString()
        }));
      } finally {
        setCalculatingPrice(false);
      }
    } else if (activeTab === 'items' && field === 'import_price' && !value) {
      // Clear export price if import price is cleared
      setFormData(prev => ({ ...prev, export_price: '' }));
    }
  };

  // Check for duplicate product name AND unit combination
  const checkDuplicateProduct = (productName, unitId = null) => {
    if (!productName || !productName.trim()) return false;
    
    // If no unit selected yet, only check product name for suggestion
    if (!unitId) {
      return items.some(item => {
        const existingName = (item.product_name || item.productName || '').toLowerCase().trim();
        const newName = productName.toLowerCase().trim();
        return existingName === newName;
      });
    }
    
    // Check for exact combination of product name + unit
    return items.some(item => {
      const existingName = (item.product_name || item.productName || '').toLowerCase().trim();
      const existingUnitId = item.unit?.unitId || item.unit?.id || item.unitId;
      const newName = productName.toLowerCase().trim();
      
      return existingName === newName && existingUnitId == unitId;
    });
  };

  // Get existing units for a product name
  const getExistingUnitsForProduct = (productName) => {
    if (!productName || !productName.trim()) return [];
    
    return items.filter(item => {
      const existingName = (item.product_name || item.productName || '').toLowerCase().trim();
      const newName = productName.toLowerCase().trim();
      return existingName === newName;
    }).map(item => ({
      unitId: item.unit?.unitId || item.unit?.id || item.unitId,
      unitName: item.unit?.unitName || item.unit || 'N/A'
    }));
  };

  // Generic handlers
  const handleAdd = async (e) => {
    e.preventDefault();
    const config = getTabConfig();
    if (!config) {
      toast.error('Cấu hình tab không hợp lệ!');
      return;
    }

    // Check authentication
    if (!isAuthenticated || !token) {
      toast.error('Bạn cần đăng nhập để thực hiện thao tác này!');
      return;
    }

    // Frontend validation for duplicate product name + unit combination
    if (activeTab === 'items' && formData.product_name && formData.unit) {
      if (checkDuplicateProduct(formData.product_name, formData.unit)) {
        const existingUnits = getExistingUnitsForProduct(formData.product_name);
        const selectedUnitName = units.find(u => (u.unitId || u.id) == formData.unit)?.unitName || 'N/A';
        
        showErrorNotification(
          '🚫 Tổ hợp mặt hàng + đơn vị đã tồn tại!',
          `Sản phẩm "${formData.product_name}" với đơn vị "${selectedUnitName}" đã có trong hệ thống.`,
          {
            suggestion: 'Bạn có thể thử các giải pháp sau:',
            solutions: [
              '• Sử dụng tên sản phẩm khác',
              '• Chọn đơn vị tính khác cho cùng sản phẩm này',
              '• Thêm thông tin phân biệt vào tên (VD: "Gạo ST25 - Loại 1")',
              '• Kiểm tra danh sách sản phẩm hiện có'
            ],
            existingCombinations: existingUnits.map(unit => ({
              productName: formData.product_name,
              unitName: unit.unitName
            }))
          },
          'warning'
        );
        return;
      }
    }
    
    try {
      let result;
      
      // Use special handling for items tab with new API
      if (activeTab === 'items') {
        // Transform data for new product API
        const productData = {
          productName: formData.product_name,
          unitName: units.find(u => (u.unitId || u.id) === parseInt(formData.unit))?.unitName || formData.unit,
          importPrice: parseFloat(formData.import_price)
        };
        
        result = await addProduct(productData);
        
        if (result.status === 'success') {
          toast.success(result.message || 'Thêm sản phẩm thành công!');
          resetForm();
          fetchItems(); // Reload items
        } else {
          throw new Error(result.message || 'Thêm sản phẩm thất bại');
        }
      } else {
        // Transform data for specific tabs
        let requestData = { ...formData };
        
        // Transform agentTypes data
        if (activeTab === 'agentTypes') {
          requestData = {
            agentTypeName: formData.agentTypeName,
            maximumDebt: parseInt(formData.maximumDebt) || 0,
            ...(formData.description && { description: formData.description })
          };
        }
        // Transform districts data for Spring Boot backend
        else if (activeTab === 'districts') {
          requestData = {
            districtName: formData.districtName,
            description: formData.description || null
          };
        }
        
        console.log('🚀 Sending data to:', config.addEndpoint);
        console.log('📤 Form data:', JSON.stringify(requestData, null, 2));
        console.log('📤 Headers:', JSON.stringify(getAuthHeaders(), null, 2));
        
        const response = await fetch(config.addEndpoint, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ HTTP error! status: ${response.status}, response: ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.warn('⚠️ Response is not JSON, but status is OK:', responseText);
          toast.success(`Thêm ${config.name.toLowerCase()} thành công!`);
          resetForm();
          if (config.fetchFunction) {
            config.fetchFunction();
          }
          return;
        }
        
        result = await response.json();
        console.log('✅ Add response:', result);
        
        if (result.code === 201 || result.status === 'success') {
          const message = result.message || `Thêm ${config.name.toLowerCase()} thành công!`;
          toast.success(message);
          resetForm();
          if (config.fetchFunction) {
            config.fetchFunction();
          }
        } else {
          const errorMsg = result.message || result.error || `Lỗi khi thêm ${config.name.toLowerCase()}`;
          console.error('❌ Add failed:', result);
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi thêm:', error);
      
      // Special handling for product duplicate error (name + unit combination)
      if (activeTab === 'items' && (
        error.message.includes('đã tồn tại') ||
        error.message.includes('already exists') ||
        error.message.includes('PRODUCT_ALREADY_EXISTS')
      )) {
        // Extract product name and unit from backend error message
        const productName = formData.product_name || 'không xác định';
        const unitName = units.find(u => (u.unitId || u.id) == formData.unit)?.unitName || 'không xác định';
        
        showErrorNotification(
          '🚫 Không thể thêm mặt hàng!',
          `Sản phẩm "${productName}" với đơn vị "${unitName}" đã tồn tại trong hệ thống.`,
          {
            serverResponse: error.message,
            suggestion: 'Bạn có thể thử các giải pháp sau:',
            solutions: [
              '• Sử dụng tên sản phẩm khác',
              '• Chọn đơn vị tính khác cho cùng sản phẩm này',
              '• Thêm thông tin phân biệt vào tên (VD: "Gạo ST25 - Loại 1")',
              '• Kiểm tra danh sách mặt hàng hiện có'
            ],
            note: `💡 Lưu ý: Cùng tên sản phẩm nhưng khác đơn vị vẫn có thể thêm được!`
          },
          'warning'
        );
        return;
      }
      
      let errorMessage = `Lỗi khi thêm ${config.name.toLowerCase()}`;
      let errorTitle = '❌ Thêm thất bại';
      let errorDetails = null;
      let errorType = 'error';
      
      if (error.message.includes('401')) {
        errorTitle = '🔐 Phiên đăng nhập hết hạn';
        errorMessage = 'Vui lòng đăng nhập lại để tiếp tục.';
        errorType = 'warning';
      } else if (error.message.includes('403')) {
        errorTitle = '🚫 Không có quyền truy cập';
        errorMessage = 'Bạn không có quyền thực hiện thao tác này!';
        errorType = 'warning';
      } else if (error.message.includes('400')) {
        errorTitle = '⚠️ Dữ liệu không hợp lệ';
        if (error.message.includes('DISTRICT_ALREADY_EXISTS')) {
          errorMessage = 'Tên quận đã tồn tại trong hệ thống!';
        } else {
          errorMessage = 'Vui lòng kiểm tra lại thông tin đã nhập.';
          errorDetails = { originalError: error.message };
        }
        errorType = 'warning';
      } else if (error.message.includes('500')) {
        errorTitle = '🔧 Lỗi máy chủ';
        errorMessage = `Máy chủ gặp sự cố khi thêm ${config.name.toLowerCase()}. Vui lòng thử lại sau!`;
        errorDetails = { serverError: true };
      } else if (error.message) {
        errorDetails = { originalError: error.message };
        errorMessage = 'Đã xảy ra lỗi không mong muốn.';
      }
      
      showErrorNotification(errorTitle, errorMessage, errorDetails, errorType);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const config = getTabConfig();
    if (!config || !editingItem) {
      toast.error('Cấu hình tab hoặc dữ liệu chỉnh sửa không hợp lệ!');
      return;
    }

    // Check authentication
    if (!isAuthenticated || !token) {
      toast.error('Bạn cần đăng nhập để thực hiện thao tác này!');
      return;
    }
    
    try {
      let updateUrl = config.updateEndpoint;
      let requestBody = { ...formData, [config.idField]: editingItem[config.idField] };

      // Special handling for districts - backend requires oldDistrictName parameter
      if (activeTab === 'districts') {
        const oldDistrictName = editingItem.districtName;
        updateUrl = `${config.updateEndpoint}?oldDistrictName=${encodeURIComponent(oldDistrictName)}`;
        requestBody = {
          districtName: formData.districtName,
          description: formData.description || null
        };
      }

      console.log(`🔄 Updating ${config.name}: ${updateUrl}`);
      console.log('📤 Request body:', requestBody);

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.warn('⚠️ Response is not JSON, but status is OK:', responseText);
        toast.success(`Cập nhật ${config.name.toLowerCase()} thành công!`);
        resetForm();
        if (config.fetchFunction) {
          config.fetchFunction();
        }
        return;
      }
      
      const result = await response.json();
      console.log('✅ Update response:', result);
      
      if (result.code === 200 || result.status === 'success') {
        toast.success(`Cập nhật ${config.name.toLowerCase()} thành công!`);
        resetForm();
        if (config.fetchFunction) {
          config.fetchFunction();
        }
      } else {
        const errorMsg = result.message || result.error || `Lỗi khi cập nhật ${config.name.toLowerCase()}`;
        console.error('❌ Update failed:', result);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật:', error);
      let errorMessage = `Lỗi khi cập nhật ${config.name.toLowerCase()}`;
      
      if (error.message.includes('401')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!';
      } else if (error.message.includes('403')) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này!';
      } else if (error.message.includes('404')) {
        errorMessage = `${config.name} không tồn tại hoặc đã bị xóa!`;
      } else if (error.message.includes('500')) {
        errorMessage = `Lỗi máy chủ khi cập nhật ${config.name.toLowerCase()}. Vui lòng thử lại!`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    const config = getTabConfig();
    if (!config) {
      toast.error('Cấu hình tab không hợp lệ!');
      return;
    }
    
    // Validate ID parameter
    if (!id) {
      toast.error(`Không tìm thấy thông tin để xóa ${config.name.toLowerCase()}!`);
      return;
    }

    // Additional validation for units tab - ensure unitName is not empty
    if (activeTab === 'units' && (!id || id.trim() === '')) {
      toast.error('Tên đơn vị không được để trống!');
      return;
    }

    // Check authentication
    if (!isAuthenticated || !token) {
      toast.error('Bạn cần đăng nhập để thực hiện thao tác này!');
      return;
    }
    
    // Get item name for confirmation dialog
    let itemName = id;
    if (activeTab === 'items') {
      const item = items.find(item => 
        (item.product_id || item.productID || item.productId) === id
      );
      itemName = item ? item.product_name || item.productName : id;
    } else if (activeTab === 'units') {
      const item = units.find(item => item.unitName === id);
      itemName = item ? item.unitName : id;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${config.name.toLowerCase()} "${itemName}" này?`)) {
      try {
        let deleteUrl;
        
        // Special handling for items and units tabs - use path parameter
        if (activeTab === 'items') {
          deleteUrl = `${config.deleteEndpoint}/${id}`;
          console.log(`🗑️ Đang xóa ${config.name}: ${deleteUrl}`);
        } else if (activeTab === 'units') {
          // Units tab uses unitName as path parameter
          deleteUrl = `${config.deleteEndpoint}/${encodeURIComponent(id)}`;
          console.log(`🗑️ Đang xóa ${config.name}: ${deleteUrl}`);
        } else {
          // Other tabs use query parameter
          if (config.deleteParam) {
            deleteUrl = `${config.deleteEndpoint}?${config.deleteParam}=${encodeURIComponent(id)}`;
          } else {
            deleteUrl = `${config.deleteEndpoint}/${id}`;
          }
          console.log(`🗑️ Đang xóa ${config.name}: ${deleteUrl}`);
        }
        
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ HTTP error! status: ${response.status}, response: ${errorText}`);
          
          let errorMessage = '';
          let errorDetails = null;
          
          try {
            // Try to parse as JSON to get structured error message
            const errorJson = JSON.parse(errorText);
            errorDetails = errorJson;
            
            if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.error) {
              errorMessage = errorJson.error;
            } else {
              errorMessage = `Lỗi ${response.status}: ${errorText}`;
            }
          } catch (parseError) {
            // If not JSON, create user-friendly message based on status
            if (response.status === 400) {
              errorMessage = `Không thể xóa ${config.name.toLowerCase()} này!`;
            } else if (response.status === 401) {
              errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!';
            } else if (response.status === 403) {
              errorMessage = 'Bạn không có quyền thực hiện thao tác này!';
            } else if (response.status === 404) {
              errorMessage = `${config.name} không tồn tại hoặc đã bị xóa!`;
            } else if (response.status === 500) {
              errorMessage = `Lỗi máy chủ khi xóa ${config.name.toLowerCase()}. Vui lòng thử lại!`;
            } else {
              errorMessage = `Lỗi ${response.status}: ${errorText}`;
            }
          }
          
          // Display beautiful error notification
          const config = getTabConfig();
          const errorTitle = response.status === 400 ? 
            `Không thể xóa ${config.name.toLowerCase()}` : 
            `Lỗi ${response.status}`;
          
          showErrorNotification(
            errorTitle,
            errorMessage,
            errorDetails ? {
              status: response.status,
              response: errorDetails
            } : null,
            'error'
          );
          return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.warn('⚠️ Response is not JSON, but status is OK:', responseText);
          // If status is OK but not JSON, consider it successful
          toast.success(`Xóa ${config.name.toLowerCase()} thành công!`);
          if (config.fetchFunction) {
            config.fetchFunction();
          }
          return;
        }
        
        const result = await response.json();
        console.log('✅ Delete response:', result);
        
        if (result.code === 200 || result.status === 'success') {
          const message = result.message || `Xóa ${config.name.toLowerCase()} thành công!`;
          toast.success(message);
          if (config.fetchFunction) {
            config.fetchFunction();
          }
        } else {
          const errorMsg = result.message || result.error || `Lỗi khi xóa ${config.name.toLowerCase()}`;
          console.error('❌ Delete failed:', result);
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error('❌ Lỗi khi xóa:', error);
        
        // Handle network errors or other unexpected errors
        let errorMessage = `Không thể kết nối đến máy chủ khi xóa ${config.name.toLowerCase()}`;
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!';
        } else if (error.message) {
          errorMessage = `Lỗi không mong muốn: ${error.message}`;
        }
        
        showErrorNotification(
          'Lỗi kết nối',
          errorMessage,
          error.message,
          'error'
        );
      }
    }
  };

  const getTabConfig = () => {
    const configs = {
      items: {
        name: 'Mặt hàng',
        data: items,
        idField: 'product_id',
        addEndpoint: 'http://localhost:8080/api/products',
        updateEndpoint: 'http://localhost:8080/api/products',
        deleteEndpoint: 'http://localhost:8080/api/products',
        // deleteParam không cần thiết cho items vì sử dụng path parameter
        fetchFunction: fetchItems,
        fields: [
          { key: 'product_name', label: 'Tên mặt hàng', type: 'text', required: true },
          { key: 'unit', label: 'Đơn vị', type: 'select', required: true },
          { key: 'import_price', label: 'Giá nhập', type: 'number', required: true },
          { key: 'export_price', label: 'Giá xuất (Tự động tính)', type: 'number', required: false, readonly: true }
        ],
        columns: ['STT', 'Tên mặt hàng', 'Đơn vị', 'Giá nhập', 'Giá xuất', 'Tồn kho', 'Hành động']
      },
      units: {
        name: 'Đơn vị tính',
        data: units,
        idField: 'unitID',
        addEndpoint: 'http://localhost:8080/api/units',
        updateEndpoint: 'http://localhost:8080/api/units',
        deleteEndpoint: 'http://localhost:8080/api/units',
        // deleteParam không cần thiết cho units vì sử dụng path parameter với unitName
        fetchFunction: fetchUnits,
        fields: [
          { key: 'unitName', label: 'Tên đơn vị', type: 'text', required: true },
          { key: 'description', label: 'Mô tả', type: 'text', required: false }
        ],
        columns: ['STT', 'Tên đơn vị', 'Mô tả', 'Hành động']
      },
      agentTypes: {
        name: 'Loại đại lý',
        data: agentTypes,
        idField: 'agentTypeID',
        addEndpoint: 'http://localhost:8080/agent-type/add',
        updateEndpoint: 'http://localhost:8080/agent-type/update',
        deleteEndpoint: 'http://localhost:8080/agent-type/delete',
        deleteParam: 'agentTypeName',
        fetchFunction: fetchAgentTypes,
        fields: [
          { key: 'agentTypeName', label: 'Tên loại đại lý', type: 'text', required: true },
          { key: 'maximumDebt', label: 'Công nợ tối đa', type: 'number', required: true },
          { key: 'description', label: 'Mô tả', type: 'text', required: false }
        ],
        columns: ['STT', 'Tên loại', 'Công nợ tối đa', 'Mô tả', 'Hành động']
      },
      districts: {
        name: 'Quận',
        data: districts,
        idField: 'districtID',
        addEndpoint: 'http://localhost:8080/district/add',
        updateEndpoint: 'http://localhost:8080/district/update',
        deleteEndpoint: 'http://localhost:8080/district/delete',
        deleteParam: 'districtName',
        fetchFunction: fetchDistricts,
        fields: [
          { key: 'districtName', label: 'Tên quận', type: 'text', required: true },
          { key: 'description', label: 'Mô tả', type: 'text', required: false }
        ],
        columns: ['STT', 'Tên quận', 'Mô tả', 'Hành động']
      }
    };
    return configs[activeTab];
  };

  const startEdit = (item) => {
    setEditingItem(item);
    const config = getTabConfig();
    if (config && config.fields) {
      const newFormData = {};
      config.fields.forEach(field => {
        if (field.key === 'unit') {
          newFormData[field.key] = item.unit?.unitId || item.unit?.id || '';
        } else if (activeTab === 'agentTypes' && field.key === 'maximumDebt') {
          const debtValue = item.maximumDebt ?? item.max_debt ?? item.maxDebt ?? item.maxQuantity;
          newFormData[field.key] = debtValue ?? '';
        }
        else {
          newFormData[field.key] = item[field.key] || 
                                  item[field.key.replace(/_/g, '')] || 
                                  item[field.key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())] || '';
        }
      });
      setFormData(newFormData);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({});
  };

  const getCurrentData = () => {
    const config = getTabConfig();
    if (!config || !config.data || !config.fields || config.fields.length === 0) {
      return [];
    }
    
    const nameField = config.fields[0].key; // First field is usually the name
    return config.data.filter(item => {
      const name = item[nameField] || 
                   item[nameField.replace(/_/g, '')] || 
                   item[nameField.replace(/_([a-z])/g, (g) => g[1].toUpperCase())];
      return name && name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const getCurrentPageData = () => {
    const filteredData = getCurrentData();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const renderTableRow = (item, index) => {
    const config = getTabConfig();
    
    if (!config || !item) {
      return null;
    }
    
    // Generate unique key for each row
    const getUniqueKey = (item, index) => {
      const id = item.product_id || item.productID || item.productId || 
                 item.unitID || item.unitId || 
                 item.agentTypeID || item.agentTypeId || 
                 item.districtID || item.districtId || 
                 index;
      return `${activeTab}-${id}-${index}`;
    };
    
    switch (activeTab) {
      case 'items':
        return (
          <tr key={getUniqueKey(item, index)} className="border-b border-gray-700 hover:bg-gray-700">
            <td className="py-3 px-4 text-white">{index + 1}</td>
            <td className="py-3 px-4 text-white">{item.product_name || item.productName || '---'}</td>
            <td className="py-3 px-4 text-white">{item.unit?.unitName || item.unit || '---'}</td>
            <td className="py-3 px-4 text-white">{item.import_price || item.importPrice ? formatCurrency(item.import_price || item.importPrice) : '---'}</td>
            <td className="py-3 px-4 text-white">{item.export_price || item.exportPrice ? formatCurrency(item.export_price || item.exportPrice) : '---'}</td>
            <td className="py-3 px-4 text-white">{item.inventory_quantity ?? item.inventoryQuantity ?? 0}</td>
            <td className="py-3 px-4 space-x-2">
              <button 
                onClick={() => startEditingImportPrice(item)} 
                className="text-green-400 hover:text-green-300"
                title="Chỉnh sửa giá nhập"
              >
                <FaDollarSign />
              </button>
              <button 
                onClick={() => startEditingInventory(item)} 
                className="text-blue-400 hover:text-blue-300"
                title="Chỉnh sửa số lượng tồn kho"
              >
                <FaWarehouse />
              </button>
              <button onClick={() => handleDelete(item.product_id || item.productID || item.productId)} className="text-red-400 hover:text-red-300" title="Xóa sản phẩm">
                <FaTrash />
              </button>
            </td>
          </tr>
        );
      case 'units':
        return (
          <tr key={getUniqueKey(item, index)} className="border-b border-gray-700 hover:bg-gray-700">
            <td className="py-3 px-4 text-white">{index + 1}</td>
            <td className="py-3 px-4 text-white">{item.unitName || '---'}</td>
            <td className="py-3 px-4 text-white">{item.description || '---'}</td>
            <td className="py-3 px-4 space-x-2">
              <button onClick={() => startEdit(item)} className="text-blue-400 hover:text-blue-300">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(item.unitName)} className="text-red-400 hover:text-red-300">
                <FaTrash />
              </button>
            </td>
          </tr>
        );
      case 'agentTypes':
        const debtValue = item.maximumDebt ?? item.max_debt ?? item.maxDebt ?? item.maxQuantity;
        return (
          <tr key={getUniqueKey(item, index)} className="border-b border-gray-700 hover:bg-gray-700">
            <td className="py-3 px-4 text-white">{index + 1}</td>
            <td className="py-3 px-4 text-white">{item.agentTypeName || '---'}</td>
            <td className="py-3 px-4 text-white">{debtValue != null ? formatCurrency(debtValue) : '---'}</td>
            <td className="py-3 px-4 text-white">{item.description || '---'}</td>
            <td className="py-3 px-4 space-x-2">
              <button onClick={() => startEdit(item)} className="text-blue-400 hover:text-blue-300">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(item.agentTypeName)} className="text-red-400 hover:text-red-300">
                <FaTrash />
              </button>
            </td>
          </tr>
        );
      case 'districts':
        return (
          <tr key={getUniqueKey(item, index)} className="border-b border-gray-700 hover:bg-gray-700">
            <td className="py-3 px-4 text-white">{index + 1}</td>
            <td className="py-3 px-4 text-white">{item.districtName || '---'}</td>
            <td className="py-3 px-4 text-white">{item.description || '---'}</td>
            <td className="py-3 px-4 space-x-2">
              <button onClick={() => startEdit(item)} className="text-blue-400 hover:text-blue-300">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(item.districtName)} className="text-red-400 hover:text-red-300">
                <FaTrash />
              </button>
            </td>
          </tr>
        );
      default:
        return null;
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const config = getTabConfig();
  const filteredData = getCurrentData();
  const currentPageData = getCurrentPageData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle potential null/undefined values
  if (!currentTab || !config) {
    return (
      <div className="p-6 bg-[#1a2634] rounded-lg min-h-screen">
        <div className="text-center text-white">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  const colorClasses = getColorClasses(currentTab.color);

  return (
    <div className="p-6 bg-[#1a2634] rounded-lg min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">QUẢN LÝ DANH MỤC</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const tabColorClasses = getColorClasses(tab.color);
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm('');
                resetForm();
                setCurrentPage(1);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? `${tabColorClasses.bgActive} text-white`
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="text-sm" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Quản lý {currentTab.name}</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className={`${colorClasses.bg} ${colorClasses.bgHover} text-white px-4 py-2 rounded-lg flex items-center`}
          >
            <FaPlus className="mr-2" /> Thêm {currentTab.name.toLowerCase()}
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              style={{ color: 'white' }}
              placeholder={`Tìm kiếm ${currentTab.name.toLowerCase()}...`}
              className={`w-full pl-10 pr-4 py-2 bg-gray-700 text-white placeholder-gray-300 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 ${colorClasses.ring} focus:border-blue-500 transition-all duration-200`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingItem) && (
          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-white">
                {editingItem ? `Chỉnh sửa ${currentTab.name.toLowerCase()}` : `Thêm ${currentTab.name.toLowerCase()} mới`}
              </h4>
              {activeTab === 'items' && (
                <div className="flex items-center space-x-2">
                  {!editingExportRatio ? (
                    <>
                      <span className="text-sm text-gray-300">
                        Tỷ lệ giá xuất: <strong className="text-blue-400">{exportRatio.toFixed(3)}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={loadExportRatio}
                        className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        title="Làm mới tỷ lệ giá xuất"
                      >
                        🔄
                      </button>
                      <button
                        type="button"
                        onClick={startEditingExportRatio}
                        className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center"
                        title="Chỉnh sửa tỷ lệ giá xuất"
                      >
                        <FaEdit className="mr-1" /> Sửa
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-300">Tỷ lệ mới:</span>
                      <input
                        type="number"
                        value={newExportRatio}
                        onChange={(e) => setNewExportRatio(e.target.value)}
                        step="0.001"
                        min="0.001"
                        className="w-20 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                        placeholder="1.020"
                      />
                      <button
                        type="button"
                        onClick={handleUpdateExportRatio}
                        disabled={updatingRatio}
                        className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center disabled:opacity-50"
                        title="Lưu tỷ lệ mới"
                      >
                        {updatingRatio ? '...' : <><FaSave className="mr-1" /> Lưu</>}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingExportRatio}
                        className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded flex items-center"
                        title="Hủy chỉnh sửa"
                      >
                        <FaTimes className="mr-1" /> Hủy
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <form onSubmit={editingItem ? handleEdit : handleAdd}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.fields && config.fields.map((field) => (
                  <div key={field.key} className={field.key === 'export_price' && activeTab === 'items' ? 'relative' : ''}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {field.label}
                      {field.key === 'export_price' && activeTab === 'items' && (
                        <span className="text-green-400 text-xs ml-2">(Tự động tính)</span>
                      )}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        required={field.required}
                        className={`w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 ${colorClasses.ring}`}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFormDataChange(field.key, e.target.value)}
                      >
                        <option value="">Chọn {field.label.toLowerCase()}</option>
                        {field.key === 'unit' && units.map((unit) => (
                          <option key={unit.unitId || unit.id} value={unit.unitId || unit.id}>
                            {unit.unitName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.type}
                          required={field.required}
                          readOnly={field.readonly && activeTab === 'items'}
                          className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                            field.readonly && activeTab === 'items'
                              ? 'bg-gray-700 border-gray-500 text-gray-300 cursor-not-allowed'
                              : (field.key === 'product_name' || field.key === 'unit') && activeTab === 'items' && 
                                formData.product_name && formData.unit && 
                                checkDuplicateProduct(formData.product_name, formData.unit)
                              ? 'bg-gray-600 text-white border-red-500 focus:ring-red-500'
                              : `bg-gray-600 text-white border-gray-500 ${colorClasses.ring}`
                          }`}
                          value={
                            field.key === 'export_price' && activeTab === 'items' && calculatingPrice
                              ? 'Đang tính...'
                              : (formData[field.key] || '')
                          }
                          placeholder={
                  
                            field.key === 'export_price' && activeTab === 'items'
                              ? 'Giá xuất sẽ tự động tính'
                              : field.key === 'product_name' && activeTab === 'items'
                              ? 'Nhập tên mặt hàng'
                              : undefined
                          }
                          onChange={(e) => {
                            if (!(field.readonly && activeTab === 'items')) {
                              handleFormDataChange(field.key, e.target.value);
                            }
                          }}
                        />
                        
                        {/* Duplicate warning icon for product name + unit combination */}
                        {(field.key === 'product_name' || field.key === 'unit') && activeTab === 'items' && 
                         formData.product_name && formData.unit && 
                         checkDuplicateProduct(formData.product_name, formData.unit) && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2" title="Tổ hợp sản phẩm + đơn vị đã tồn tại">
                            <div className="text-red-400">🚫</div>
                          </div>
                        )}
                        
                        {/* Export price calculation spinner */}
                        {field.key === 'export_price' && activeTab === 'items' && calculatingPrice && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Show duplicate warning for product name + unit combination */}
                    {(field.key === 'product_name' || field.key === 'unit') && activeTab === 'items' && 
                     formData.product_name && formData.unit && 
                     checkDuplicateProduct(formData.product_name, formData.unit) && (
                      <p className="text-red-400 text-xs mt-1 flex items-center">
                        <span className="mr-1">🚫</span>
                        Tổ hợp "{formData.product_name}" + "{units.find(u => (u.unitId || u.id) == formData.unit)?.unitName}" đã tồn tại!
                      </p>
                    )}
                    
                    {/* Show existing units for same product name */}
                    {field.key === 'product_name' && activeTab === 'items' && formData[field.key] && formData[field.key].length > 2 && (
                      <div className="mt-1">
                        {(() => {
                          const existingUnits = getExistingUnitsForProduct(formData[field.key]);
                          const hasExactMatch = formData.unit && checkDuplicateProduct(formData[field.key], formData.unit);
                          
                          if (existingUnits.length > 0 && !hasExactMatch) {
                            return (
                              <p className="text-blue-400 text-xs">
                                💡 "{formData[field.key]}" đã có với đơn vị: {existingUnits.map(u => u.unitName).join(', ')}
                              </p>
                            );
                          }
                          
                          // Show similar product names only if no exact product name match
                          if (existingUnits.length === 0) {
                            const similarProducts = items.filter(item => {
                              const existingName = (item.product_name || item.productName || '').toLowerCase();
                              const searchName = formData[field.key].toLowerCase();
                              return existingName.includes(searchName) && existingName !== searchName;
                            }).slice(0, 2);
                            
                            if (similarProducts.length > 0) {
                              return (
                                <p className="text-yellow-400 text-xs">
                                  💡 Sản phẩm tương tự: {similarProducts.map(p => p.product_name || p.productName).join(', ')}
                                </p>
                              );
                            }
                          }
                          
                          return null;
                        })()}
                      </div>
                    )}
                    
                    {/* Show available units suggestion */}
                    {field.key === 'unit' && activeTab === 'items' && formData.product_name && !formData.unit && (
                      <div className="mt-1">
                        {(() => {
                          const existingUnits = getExistingUnitsForProduct(formData.product_name);
                          if (existingUnits.length > 0) {
                            const availableUnits = units.filter(unit => 
                              !existingUnits.some(existing => existing.unitId == (unit.unitId || unit.id))
                            );
                            
                            if (availableUnits.length > 0) {
                              return (
                                <p className="text-green-400 text-xs">
                                  ✅ Có thể chọn đơn vị: {availableUnits.slice(0, 3).map(u => u.unitName).join(', ')}
                                  {availableUnits.length > 3 && '...'}
                                </p>
                              );
                            } else {
                              return (
                                <p className="text-orange-400 text-xs">
                                  ⚠️ Sản phẩm này đã có với tất cả đơn vị
                                </p>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>
                    )}
                    
                    {/* Show calculation formula for export price */}
                    {field.key === 'export_price' && activeTab === 'items' && formData.import_price && formData.export_price && !calculatingPrice && (
                      <p className="text-green-400 text-xs mt-1">
                        = {new Intl.NumberFormat('vi-VN').format(formData.import_price)} × {exportRatio} = {new Intl.NumberFormat('vi-VN').format(formData.export_price)} VND
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={
                    activeTab === 'items' && 
                    formData.product_name && formData.unit &&
                    checkDuplicateProduct(formData.product_name, formData.unit)
                  }
                  className={`px-4 py-2 text-white rounded-lg transition-all duration-200 ${
                    activeTab === 'items' && formData.product_name && formData.unit && checkDuplicateProduct(formData.product_name, formData.unit)
                      ? 'bg-gray-500 cursor-not-allowed opacity-50'
                      : `${colorClasses.bg} ${colorClasses.bgHover}`
                  }`}
                  title={
                    activeTab === 'items' && formData.product_name && formData.unit && checkDuplicateProduct(formData.product_name, formData.unit)
                      ? 'Không thể thêm tổ hợp sản phẩm + đơn vị đã tồn tại'
                      : undefined
                  }
                >
                  {editingItem ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Import Price Edit Modal */}
        {editingImportPrice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">
                  Chỉnh sửa giá nhập
                </h4>
                <button
                  onClick={cancelEditingImportPrice}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 mb-2">
                  <strong>Sản phẩm:</strong> {editingImportPrice.product_name || editingImportPrice.productName}
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Đơn vị:</strong> {editingImportPrice.unit?.unitName || editingImportPrice.unit || '---'}
                </p>
                <p className="text-gray-300 mb-4">
                  <strong>Giá nhập hiện tại:</strong> {formatCurrency(editingImportPrice.import_price || editingImportPrice.importPrice)}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giá nhập mới *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newImportPrice}
                  onChange={(e) => setNewImportPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !updatingImportPrice && newImportPrice && parseFloat(newImportPrice) > 0) {
                      handleUpdateImportPrice();
                    }
                  }}
                  placeholder="Nhập giá nhập mới..."
                  disabled={updatingImportPrice}
                  autoFocus
                />
                <p className="text-green-400 text-xs mt-1">
                  💡 Giá xuất sẽ được tự động tính lại theo tỷ lệ {exportRatio.toFixed(3)}
                </p>
                {newImportPrice && parseFloat(newImportPrice) > 0 && (
                  <p className="text-blue-400 text-xs mt-1">
                    Giá xuất dự kiến: {formatCurrency(Math.round(parseFloat(newImportPrice) * exportRatio))}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={cancelEditingImportPrice}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  disabled={updatingImportPrice}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleUpdateImportPrice}
                  disabled={updatingImportPrice || !newImportPrice || parseFloat(newImportPrice) <= 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {updatingImportPrice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Cập nhật giá
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Quantity Edit Modal */}
        {editingInventory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <FaWarehouse className="mr-2 text-blue-400" />
                  Chỉnh sửa tồn kho
                </h4>
                <button
                  onClick={cancelEditingInventory}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 mb-2">
                  <strong>Sản phẩm:</strong> {editingInventory.product_name || editingInventory.productName}
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Đơn vị:</strong> {editingInventory.unit?.unitName || editingInventory.unit || '---'}
                </p>
                <div className="flex justify-between items-center mb-4 p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Số lượng hiện tại:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-400">
                      {editingInventory.inventory_quantity ?? editingInventory.inventoryQuantity ?? 0}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {editingInventory.unit?.unitName || editingInventory.unit || 'đơn vị'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số lượng tồn kho mới *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newInventoryQuantity}
                  onChange={(e) => setNewInventoryQuantity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !updatingInventory && newInventoryQuantity !== '' && parseInt(newInventoryQuantity) >= 0) {
                      handleUpdateInventory();
                    }
                  }}
                  placeholder="Nhập số lượng tồn kho mới..."
                  disabled={updatingInventory}
                  autoFocus
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-blue-400 text-xs">
                    💡 Số lượng phải ≥ 0
                  </p>
                  {newInventoryQuantity !== '' && parseInt(newInventoryQuantity) >= 0 && (
                    <div className="text-xs">
                      {(() => {
                        const oldQty = editingInventory.inventory_quantity ?? editingInventory.inventoryQuantity ?? 0;
                        const newQty = parseInt(newInventoryQuantity);
                        const diff = newQty - oldQty;
                        
                        if (diff > 0) {
                          return <span className="text-green-400">+{diff} ({oldQty} → {newQty})</span>;
                        } else if (diff < 0) {
                          return <span className="text-red-400">{diff} ({oldQty} → {newQty})</span>;
                        } else {
                          return <span className="text-gray-400">Không thay đổi</span>;
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick adjustment buttons */}
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Điều chỉnh nhanh:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 10, 50, 100].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNewInventoryQuantity(value.toString())}
                      className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                      disabled={updatingInventory}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentQty = editingInventory.inventory_quantity ?? editingInventory.inventoryQuantity ?? 0;
                      setNewInventoryQuantity((currentQty + 10).toString());
                    }}
                    className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                    disabled={updatingInventory}
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentQty = editingInventory.inventory_quantity ?? editingInventory.inventoryQuantity ?? 0;
                      const newQty = Math.max(0, currentQty - 10);
                      setNewInventoryQuantity(newQty.toString());
                    }}
                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                    disabled={updatingInventory}
                  >
                    -10
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={cancelEditingInventory}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  disabled={updatingInventory}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleUpdateInventory}
                  disabled={updatingInventory || newInventoryQuantity === '' || parseInt(newInventoryQuantity) < 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {updatingInventory ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Cập nhật tồn kho
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                {config.columns && config.columns.map((column, index) => (
                  <th key={index} className="py-3 px-4 text-gray-300">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item, index) => renderTableRow(item, index))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Không có dữ liệu {currentTab.name.toLowerCase()}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-sm ${
                currentPage === 1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Trang trước
            </button>
            <span className="text-gray-400 text-sm">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
      
      {/* Error Notification Modal */}
      <ErrorNotification
        isVisible={errorNotification.isVisible}
        onClose={hideErrorNotification}
        title={errorNotification.title}
        message={errorNotification.message}
        details={errorNotification.details}
        type={errorNotification.type}
        actionText="Đã hiểu"
      />
    </div>
  );
};

export default CategoryManagement;