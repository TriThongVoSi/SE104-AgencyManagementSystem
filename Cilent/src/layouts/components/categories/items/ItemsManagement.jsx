import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../utils/api';

const ItemsManagement = () => {
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    unit: '',
    import_price: '',
    export_price: ''
  });

  // Fetch items from API
  const fetchItems = async () => {
    try {
      const response = await api.get('/products');
      if (response.data.code === 200) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách mặt hàng:', error);
      toast.error('Lỗi khi tải danh sách mặt hàng!');
    }
  };

  // Fetch units from API
  const fetchUnits = async () => {
    try {
      const response = await api.get('/units');
      if (response.data.code === 200) {
        setUnits(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn vị:', error);
      toast.error('Lỗi khi tải danh sách đơn vị!');
    }
  };

  useEffect(() => {
    fetchItems();
    fetchUnits();
  }, []);

  // Add new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/products', formData);
      const result = response.data;
      
      if (result.code === 201) {
        toast.success('Thêm mặt hàng thành công!');
        setFormData({ product_name: '', unit: '', import_price: '', export_price: '' });
        setShowAddForm(false);
        fetchItems();
      } else {
        toast.error(result.message || 'Lỗi khi thêm mặt hàng!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Lỗi khi thêm mặt hàng!');
    }
  };

  // Edit item
  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/products', { ...formData, product_id: editingItem.product_id || editingItem.productID || editingItem.productId });
      const result = response.data;
      
      if (result.code === 200) {
        toast.success('Cập nhật mặt hàng thành công!');
        setEditingItem(null);
        setFormData({ product_name: '', unit: '', import_price: '', export_price: '' });
        fetchItems();
      } else {
        toast.error(result.message || 'Lỗi khi cập nhật mặt hàng!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Lỗi khi cập nhật mặt hàng!');
    }
  };

  // Delete item
  const handleDeleteItem = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mặt hàng này?')) {
      try {
        const response = await api.delete(`/products?productId=${productId}`);
        const result = response.data;
        
        if (result.code === 200) {
          toast.success('Xóa mặt hàng thành công!');
          fetchItems();
        } else {
          toast.error(result.message || 'Lỗi khi xóa mặt hàng!');
        }
      } catch (error) {
        console.error('Lỗi:', error);
        toast.error('Lỗi khi xóa mặt hàng!');
      }
    }
  };

  // Start editing
  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({
      product_name: item.product_name || item.productName,
      unit: item.unit.unitId || item.unit.id,
      import_price: item.import_price || item.importPrice,
      export_price: item.export_price || item.exportPrice
    });
  };

  // Cancel form
  const cancelForm = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({ product_name: '', unit: '', import_price: '', export_price: '' });
  };

  // Filter items
  const filteredItems = items.filter(item =>
    (item.product_name || item.productName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Quản lý Mặt hàng</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Thêm mặt hàng
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm mặt hàng..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white placeholder-gray-300 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingItem) && (
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            {editingItem ? 'Chỉnh sửa mặt hàng' : 'Thêm mặt hàng mới'}
          </h4>
          <form onSubmit={editingItem ? handleEditItem : handleAddItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên mặt hàng
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Đơn vị
                </label>
                <select
                  required
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="">Chọn đơn vị</option>
                  {units.map((unit) => (
                    <option key={unit.unitId || unit.id} value={unit.unitId || unit.id}>
                      {unit.unitName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giá nhập
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.import_price}
                  onChange={(e) => setFormData({ ...formData, import_price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giá xuất
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.export_price}
                  onChange={(e) => setFormData({ ...formData, export_price: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingItem ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-4 text-gray-300">Tên mặt hàng</th>
              <th className="py-3 px-4 text-gray-300">Đơn vị</th>
              <th className="py-3 px-4 text-gray-300">Giá nhập</th>
              <th className="py-3 px-4 text-gray-300">Giá xuất</th>
              <th className="py-3 px-4 text-gray-300">Tồn kho</th>
              <th className="py-3 px-4 text-gray-300">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.product_id || item.productID || item.productId} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="py-3 px-4 text-white">{item.product_name || item.productName}</td>
                <td className="py-3 px-4 text-white">{item.unit.unitName}</td>
                <td className="py-3 px-4 text-white">{item.import_price || item.importPrice}</td>
                <td className="py-3 px-4 text-white">{item.export_price || item.exportPrice}</td>
                <td className="py-3 px-4 text-white">{item.inventory_quantity ?? item.inventoryQuantity ?? 0}</td>
                <td className="py-3 px-4 text-white">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.product_id || item.productID || item.productId)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemsManagement; 