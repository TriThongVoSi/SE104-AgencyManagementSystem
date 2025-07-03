import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const UnitsManagement = () => {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({
    unitName: '',
    description: ''
  });

  // Fetch units from API
  const fetchUnits = async () => {
    try {
      const response = await fetch('http://localhost:8080/unit/getAllUnits');
      const data = await response.json();
      if (data.code === 200) {
        setUnits(data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn vị:', error);
      toast.error('Lỗi khi tải danh sách đơn vị!');
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Add new unit
  const handleAddUnit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/unit/addUnit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      
      if (result.code === 201) {
        toast.success('Thêm đơn vị thành công!');
        setFormData({ unitName: '', description: '' });
        setShowAddForm(false);
        fetchUnits();
      } else {
        toast.error('Lỗi khi thêm đơn vị!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Lỗi khi thêm đơn vị!');
    }
  };

  // Edit unit
  const handleEditUnit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/unit/updateUnit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, unitID: editingUnit.unitID })
      });
      const result = await response.json();
      
      if (result.code === 200) {
        toast.success('Cập nhật đơn vị thành công!');
        setEditingUnit(null);
        setFormData({ unitName: '', description: '' });
        fetchUnits();
      } else {
        toast.error('Lỗi khi cập nhật đơn vị!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Lỗi khi cập nhật đơn vị!');
    }
  };

  // Delete unit
  const handleDeleteUnit = async (unitId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn vị này?')) {
      try {
        const response = await fetch(`http://localhost:8080/unit/deleteUnit?unitId=${unitId}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.code === 200) {
          toast.success('Xóa đơn vị thành công!');
          fetchUnits();
        } else {
          toast.error('Lỗi khi xóa đơn vị!');
        }
      } catch (error) {
        console.error('Lỗi:', error);
        toast.error('Lỗi khi xóa đơn vị!');
      }
    }
  };

  // Start editing
  const startEdit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      unitName: unit.unitName,
      description: unit.description || ''
    });
  };

  // Cancel form
  const cancelForm = () => {
    setShowAddForm(false);
    setEditingUnit(null);
    setFormData({ unitName: '', description: '' });
  };

  // Filter units
  const filteredUnits = units.filter(unit =>
    unit.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Quản lý Đơn vị tính</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Thêm đơn vị
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm đơn vị..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingUnit) && (
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            {editingUnit ? 'Chỉnh sửa đơn vị' : 'Thêm đơn vị mới'}
          </h4>
          <form onSubmit={editingUnit ? handleEditUnit : handleAddUnit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên đơn vị
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.unitName}
                  onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingUnit ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Units Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-4 text-gray-300">STT</th>
              <th className="py-3 px-4 text-gray-300">Tên đơn vị</th>
              <th className="py-3 px-4 text-gray-300">Mô tả</th>
              <th className="py-3 px-4 text-gray-300">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.map((unit, index) => (
              <tr key={unit.unitID} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="py-3 px-4 text-white">{index + 1}</td>
                <td className="py-3 px-4 text-white">{unit.unitName}</td>
                <td className="py-3 px-4 text-white">{unit.description || '---'}</td>
                <td className="py-3 px-4 space-x-2">
                  <button
                    onClick={() => startEdit(unit)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteUnit(unit.unitID)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnitsManagement; 