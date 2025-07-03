import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { addAgentType, getAllAgentTypes, updateAgentType, deleteAgentType } from '../../../../utils/categoriesService';

const AgentTypesManagement = () => {
  const [agentTypes, setAgentTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    agentTypeName: '',
    maximumDebt: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch agent types from API
  const fetchAgentTypes = async () => {
    try {
      setIsLoading(true);
      const result = await getAllAgentTypes();
      if (result.status === 'success') {
        setAgentTypes(result.data);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách loại đại lý!');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách loại đại lý:', error);
      toast.error('Lỗi khi tải danh sách loại đại lý!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentTypes();
  }, []);

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.agentTypeName.trim()) {
      errors.agentTypeName = 'Tên loại đại lý không được để trống';
    } else if (formData.agentTypeName.length < 2) {
      errors.agentTypeName = 'Tên loại đại lý phải có ít nhất 2 ký tự';
    } else if (formData.agentTypeName.length > 100) {
      errors.agentTypeName = 'Tên loại đại lý không được vượt quá 100 ký tự';
    }
    
    if (!formData.maximumDebt) {
      errors.maximumDebt = 'Số tiền nợ tối đa không được để trống';
    } else if (isNaN(formData.maximumDebt) || parseInt(formData.maximumDebt) <= 0) {
      errors.maximumDebt = 'Số tiền nợ tối đa phải là số dương';
    } else if (parseInt(formData.maximumDebt) > 999999999999) {
      errors.maximumDebt = 'Số tiền nợ tối đa quá lớn';
    }

    // Check if agent type name already exists (for add mode)
    if (!editingType && agentTypes.some(type => 
      type.agentTypeName.toLowerCase().trim() === formData.agentTypeName.toLowerCase().trim()
    )) {
      errors.agentTypeName = 'Tên loại đại lý đã tồn tại';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Add new agent type
  const handleAddAgentType = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const requestData = {
        agentTypeName: formData.agentTypeName.trim(),
        maximumDebt: parseInt(formData.maximumDebt)
      };

      const result = await addAgentType(requestData);
      
      if (result.status === 'success') {
        toast.success(result.message || 'Thêm loại đại lý thành công!');
        setFormData({ agentTypeName: '', maximumDebt: '' });
        setShowAddForm(false);
        setFormErrors({});
        fetchAgentTypes();
      } else {
        toast.error(result.message || 'Lỗi khi thêm loại đại lý!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Lỗi khi thêm loại đại lý!');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit agent type
  const handleEditAgentType = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const requestData = {
        agentTypeID: editingType.agentTypeID || editingType.agentTypeId,
        agentTypeName: formData.agentTypeName.trim(),
        maximumDebt: parseInt(formData.maximumDebt)
      };

      const result = await updateAgentType(requestData.agentTypeID, requestData);
      
      if (result.status === 'success') {
        toast.success(result.message || 'Cập nhật loại đại lý thành công!');
        setEditingType(null);
        setFormData({ agentTypeName: '', maximumDebt: '' });
        setFormErrors({});
        fetchAgentTypes();
      } else {
        toast.error(result.message || 'Lỗi khi cập nhật loại đại lý!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Lỗi khi cập nhật loại đại lý!');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete agent type
  const handleDeleteAgentType = async (agentTypeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại đại lý này?')) {
      try {
        setIsLoading(true);
        const result = await deleteAgentType(agentTypeId);
        
        if (result.status === 'success') {
          toast.success(result.message || 'Xóa loại đại lý thành công!');
          fetchAgentTypes();
        } else {
          toast.error(result.message || 'Lỗi khi xóa loại đại lý!');
        }
      } catch (error) {
        console.error('Lỗi:', error);
        toast.error('Lỗi khi xóa loại đại lý!');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Start editing
  const startEdit = (agentType) => {
    setEditingType(agentType);
    setFormData({
      agentTypeName: agentType.agentTypeName || '',
      maximumDebt: agentType.maximumDebt || agentType.max_debt || agentType.maxDebt || ''
    });
    setFormErrors({});
    setShowAddForm(false);
  };

  // Cancel form
  const cancelForm = () => {
    setShowAddForm(false);
    setEditingType(null);
    setFormData({ agentTypeName: '', maximumDebt: '' });
    setFormErrors({});
  };

  // Start adding
  const startAdd = () => {
    setShowAddForm(true);
    setEditingType(null);
    setFormData({ agentTypeName: '', maximumDebt: '' });
    setFormErrors({});
  };

  // Filter agent types
  const filteredAgentTypes = agentTypes.filter(type =>
    type.agentTypeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (<div></div>
  );
};

export default AgentTypesManagement;