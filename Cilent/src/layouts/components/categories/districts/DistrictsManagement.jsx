import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DistrictsManagement = () => {
  const [districts, setDistricts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [formData, setFormData] = useState({
    districtName: '',
    description: ''
  });

  // Fetch districts from API
  const fetchDistricts = async () => {
    try {
      const response = await fetch('http://localhost:8080/district/all');
      const data = await response.json();
      if (data.code === 200) {
        setDistricts(data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách quận:', error);
      toast.error('Lỗi khi tải danh sách quận!');
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  // Add new district
  const handleAddDistrict = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/district/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      
      if (result.code === 201) {
        toast.success('Thêm quận thành công!');
        setFormData({ districtName: '', description: '' });
        setShowAddForm(false);
        fetchDistricts();
      } else {
        toast.error('Lỗi khi thêm quận!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Lỗi khi thêm quận!');
    }
  };

  // Edit district
  const handleEditDistrict = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/district/updateDistrict`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, districtID: editingDistrict.districtID })
      });
      const result = await response.json();
      
      if (result.code === 200) {
        toast.success('Cập nhật quận thành công!');
        setEditingDistrict(null);
        setFormData({ districtName: '', description: '' });
        fetchDistricts();
      } else {
        toast.error('Lỗi khi cập nhật quận!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Lỗi khi cập nhật quận!');
    }
  };

  // Delete district
  const handleDeleteDistrict = async (districtId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quận này?')) {
      try {
        const response = await fetch(`http://localhost:8080/district/deleteDistrict?districtId=${districtId}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.code === 200) {
          toast.success('Xóa quận thành công!');
          fetchDistricts();
        } else {
          toast.error('Lỗi khi xóa quận!');
        }
      } catch (error) {
        console.error('Lỗi:', error);
        toast.error('Lỗi khi xóa quận!');
      }
    }
  };

  // Start editing
  const startEdit = (district) => {
    setEditingDistrict(district);
    setFormData({
      districtName: district.districtName,
      description: district.description || ''
    });
  };

  // Cancel form
  const cancelForm = () => {
    setShowAddForm(false);
    setEditingDistrict(null);
    setFormData({ districtName: '', description: '' });
  };

  // Filter districts
  const filteredDistricts = districts.filter(district =>
    district.districtName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div></div>
  );
};

export default DistrictsManagement; 