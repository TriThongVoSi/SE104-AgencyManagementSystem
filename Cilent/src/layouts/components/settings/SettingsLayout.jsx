import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaBoxes, FaMoneyBillWave, FaCogs, FaEdit, FaCheck, FaTimes, FaTable, FaSync, FaPlus } from 'react-icons/fa';
import AgentTypesManagement from '../categories/agent-types/AgentTypesManagement';
import DistrictsManagement from '../categories/districts/DistrictsManagement';
import ItemsManagement from '../categories/items/ItemsManagement';
import UnitsManagement from '../categories/units/UnitsManagement';
import parametersService from '../../../utils/parametersService';
import { toast } from 'react-toastify';
import ErrorNotification from '../common/ErrorNotification';

const SettingsLayout = ({ activeTab }) => {
  const [agentTypes, setAgentTypes] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingParameters, setIsLoadingParameters] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParameter, setNewParameter] = useState({
    paramKey: '',
    paramValue: '',
    paramDescription: ''
  });

  // State cho ErrorNotification
  const [errorNotification, setErrorNotification] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'error',
    details: null
  });

  // Fetch agent types from API
  useEffect(() => {
    const fetchAgentTypes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/agent-type/all');
        const data = await response.json();
        if (data.code === 200) {
          setAgentTypes(data.data);
        }
      } catch (error) {
        console.error('Error fetching agent types:', error);
        toast.error('Lỗi khi tải danh sách loại đại lý!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentTypes();
  }, []);

  // Fetch parameters from API
  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    setIsLoadingParameters(true);
    try {
      const result = await parametersService.getAllParameters();
      if (result.success) {
        setParameters(result.data);
      } else {
        toast.error('Lỗi khi tải danh sách thông số: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
      toast.error('Lỗi khi tải danh sách thông số!');
    } finally {
      setIsLoadingParameters(false);
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Helper functions cho ErrorNotification
  const showErrorNotification = (title, message, type = 'error', details = null) => {
    setErrorNotification({
      isVisible: true,
      title,
      message,
      type,
      details
    });
  };

  const hideErrorNotification = () => {
    setErrorNotification({
      isVisible: false,
      title: '',
      message: '',
      type: 'error',
      details: null
    });
  };

  // Handle start editing parameter
  const startEditingParameter = (param) => {
    setEditingRow(param.paramKey);
    setEditData({
      param_value: param.paramValue,
      param_description: param.paramDescription || ''
    });
  };

  // Handle save parameter changes
  const saveParameterChanges = async (paramKey) => {
    try {
      // Client-side validation trước khi gửi API
      const validation = parametersService.validateParameterValue(paramKey, editData.param_value);
      if (!validation.valid) {
        // Hiển thị lỗi validation với ErrorNotification
        const paramNames = {
          'max_agent_per_district': 'Số lượng đại lý tối đa',
          'export_price_ratio': 'Tỷ lệ giá xuất'
        };
        
        showErrorNotification(
          `Giá trị không hợp lệ - ${paramNames[paramKey] || paramKey}`,
          validation.message,
          'warning',
          {
            paramKey: paramKey,
            inputValue: editData.param_value,
            validationRule: validation.message
          }
        );
        return;
      }

      // Lấy thông tin parameter hiện tại để giữ nguyên description
      const currentParam = parameters.find(p => p.paramKey === paramKey);
      const paramDescription = editData.param_description || currentParam?.paramDescription || '';

      const result = await parametersService.updateParameter(
        paramKey, 
        editData.param_value,
        paramDescription
      );
      
      if (result.success) {
        // Update local state
        const updatedParameters = parameters.map(param => 
          param.paramKey === paramKey 
            ? { 
                ...param, 
                paramValue: editData.param_value,
                paramDescription: paramDescription
              }
            : param
        );
        
        setParameters(updatedParameters);
        setEditingRow(null);
        setEditData({});
        toast.success('Cập nhật thông số thành công!');

        // Thông báo đặc biệt cho export_price_ratio
        if (paramKey === 'export_price_ratio') {
          toast.info('Tất cả sản phẩm đã được cập nhật với tỷ lệ giá mới!', { autoClose: 5000 });
        }
      } else {
        // Hiển thị lỗi từ server với ErrorNotification
        const paramNames = {
          'max_agent_per_district': 'Số lượng đại lý tối đa',
          'export_price_ratio': 'Tỷ lệ giá xuất'
        };
        
        showErrorNotification(
          `Không thể cập nhật ${paramNames[paramKey] || paramKey}`,
          result.error || 'Giá trị tham số không hợp lệ!',
          'error',
          {
            paramKey: paramKey,
            inputValue: editData.param_value,
            serverError: result.error,
            timestamp: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error('Error updating parameter:', error);
      
      // Hiển thị lỗi hệ thống với ErrorNotification
      const paramNames = {
        'max_agent_per_district': 'Số lượng đại lý tối đa',
        'export_price_ratio': 'Tỷ lệ giá xuất'
      };
      
      showErrorNotification(
        'Lỗi hệ thống',
        `Không thể cập nhật ${paramNames[paramKey] || paramKey}. Vui lòng kiểm tra kết nối mạng và thử lại.`,
        'error',
        {
          paramKey: paramKey,
          inputValue: editData.param_value,
          errorMessage: error.message,
          errorStack: error.stack,
          timestamp: new Date().toISOString()
        }
      );
    }
  };

  // Handle cancel editing
  const cancelEditing = () => {
    setEditingRow(null);
    setEditData({});
  };

  // Handle create new parameter
  const handleCreateParameter = async () => {
    try {
      // Validation
      if (!newParameter.paramKey.trim()) {
        showErrorNotification(
          'Thông tin thiếu',
          'Vui lòng nhập khóa tham số để tiếp tục.',
          'warning',
          {
            missingField: 'paramKey',
            currentValue: newParameter.paramKey
          }
        );
        return;
      }
      if (!newParameter.paramValue.trim()) {
        showErrorNotification(
          'Thông tin thiếu',
          'Vui lòng nhập giá trị tham số để tiếp tục.',
          'warning',
          {
            missingField: 'paramValue',
            currentValue: newParameter.paramValue
          }
        );
        return;
      }

      // Client-side validation
      const validation = parametersService.validateParameterValue(newParameter.paramKey, newParameter.paramValue);
      if (!validation.valid) {
        showErrorNotification(
          'Giá trị không hợp lệ',
          validation.message,
          'warning',
          {
            paramKey: newParameter.paramKey,
            paramValue: newParameter.paramValue,
            validationRule: validation.message
          }
        );
        return;
      }

      const result = await parametersService.createParameter(
        newParameter.paramKey,
        newParameter.paramValue,
        newParameter.paramDescription
      );

      if (result.success) {
        // Add to local state
        setParameters([...parameters, result.data]);
        setShowAddForm(false);
        setNewParameter({ paramKey: '', paramValue: '', paramDescription: '' });
        toast.success('Tạo tham số mới thành công!');
      } else {
        showErrorNotification(
          'Không thể tạo tham số',
          result.error || 'Khóa tham số có thể đã tồn tại hoặc không hợp lệ.',
          'error',
          {
            paramKey: newParameter.paramKey,
            paramValue: newParameter.paramValue,
            serverError: result.error,
            timestamp: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error('Error creating parameter:', error);
      showErrorNotification(
        'Lỗi hệ thống',
        'Không thể tạo tham số mới. Vui lòng kiểm tra kết nối mạng và thử lại.',
        'error',
        {
          paramKey: newParameter.paramKey,
          paramValue: newParameter.paramValue,
          errorMessage: error.message,
          errorStack: error.stack,
          timestamp: new Date().toISOString()
        }
      );
    }
  };

  // Handle cancel add form
  const cancelAddForm = () => {
    setShowAddForm(false);
    setNewParameter({ paramKey: '', paramValue: '', paramDescription: '' });
  };

  // Handle start editing agent type row
  const startEditingAgentType = (agentType) => {
    setEditingRow('agent_' + agentType.agentTypeID);
    setEditData({
      maximumDebt: agentType.maximumDebt || 0,
      exportPriceRatio: agentType.exportPriceRatio || 1.0
    });
  };

  // Handle save agent type changes
  const saveAgentTypeChanges = async (agentTypeId) => {
    try {
      const response = await fetch('http://localhost:8080/agentType/updateAgentType', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentTypeID: agentTypeId,
          maximumDebt: parseInt(editData.maximumDebt),
          exportPriceRatio: parseFloat(editData.exportPriceRatio)
        }),
      });

      const result = await response.json();
      
      if (result.code === 200) {
        // Update local state
        const updatedAgentTypes = agentTypes.map(type => 
          type.agentTypeID === agentTypeId 
            ? { 
                ...type, 
                maximumDebt: parseInt(editData.maximumDebt),
                exportPriceRatio: parseFloat(editData.exportPriceRatio)
              }
            : type
        );
        
        setAgentTypes(updatedAgentTypes);
        setEditingRow(null);
        setEditData({});
        toast.success('Cập nhật thông tin thành công!');
      } else {
        toast.error('Có lỗi xảy ra: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating agent type:', error);
      toast.error('Có lỗi xảy ra khi cập nhật');
    }
  };

  const ParametersTable = () => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <FaTable className="mr-2 text-blue-400" />
          Bảng Thông Số Hệ Thống
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <FaPlus className="mr-2" />
            Thêm tham số
          </button>
          <button
            onClick={fetchParameters}
            disabled={isLoadingParameters}
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <FaSync className={`mr-2 ${isLoadingParameters ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>
      
            {/* Add Parameter Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <h4 className="text-lg font-semibold text-white mb-4">Thêm tham số mới</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Khóa tham số</label>
              <input
                type="text"
                value={newParameter.paramKey}
                onChange={(e) => setNewParameter({...newParameter, paramKey: e.target.value})}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                placeholder="Ví dụ: new_setting"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Giá trị</label>
              <input
                type="text"
                value={newParameter.paramValue}
                onChange={(e) => setNewParameter({...newParameter, paramValue: e.target.value})}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                placeholder="Giá trị tham số"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mô tả</label>
              <input
                type="text"
                value={newParameter.paramDescription}
                onChange={(e) => setNewParameter({...newParameter, paramDescription: e.target.value})}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                placeholder="Mô tả cho tham số"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={cancelAddForm}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateParameter}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Tạo tham số
            </button>
          </div>
        </div>
      )}

      {isLoadingParameters ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-400">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Khóa</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Giá trị</th>

                <th className="text-center py-3 px-4 text-gray-300 font-semibold">Thao tác</th>
              </tr>
            </thead>
             <tbody>
               {parameters.map((param) => (
                 <tr key={param.paramKey} className="border-b border-gray-700 hover:bg-gray-750">
                   <td className="py-3 px-4 text-white font-medium">
                     {param.paramKey}
                   </td>
                   <td className="py-3 px-4">
                     {editingRow === param.paramKey ? (
                       <input
                         type={param.paramKey === 'max_agent_per_district' ? 'number' : 'text'}
                         value={editData.param_value}
                         onChange={(e) => setEditData({...editData, param_value: e.target.value})}
                         className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                         min={param.paramKey === 'max_agent_per_district' ? '1' : undefined}
                         step={param.paramKey === 'export_price_ratio' ? '0.01' : undefined}
                       />
                     ) : (
                       <span className="text-gray-300">
                         {param.paramKey === 'export_price_ratio' ? 
                           parseFloat(param.paramValue).toFixed(2) : 
                           param.paramValue
                         }
                       </span>
                     )}
                   </td>
                   
                   <td className="py-3 px-4 text-center">
                     {editingRow === param.paramKey ? (
                       <div className="flex justify-center space-x-2">
                         <button
                           onClick={() => saveParameterChanges(param.paramKey)}
                           className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                           title="Lưu"
                         >
                           <FaCheck />
                         </button>
                         <button
                           onClick={cancelEditing}
                           className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                           title="Hủy"
                         >
                           <FaTimes />
                         </button>
                       </div>
                     ) : (
                       <button
                         onClick={() => startEditingParameter(param)}
                         className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                         title="Chỉnh sửa"
                       >
                         <FaEdit />
                       </button>
                     )}
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
          
          {parameters.length === 0 && !isLoadingParameters && (
            <div className="text-center py-8 text-gray-400">
              Không có dữ liệu thông số
            </div>
          )}
        </div>
      )}
    </div>
  );

  const AgentTypesContent = () => (
    <motion.div 
      className="space-y-6"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
    
      
      {/* Parameters Table */}
      <ParametersTable />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side: Agent Types Management */}
        <AgentTypesManagement />

        {/* Right side: Districts */}
        <div className="space-y-6">
          {/* Districts Management */}
          <DistrictsManagement />
        </div>
      </div>
    </motion.div>
  );

  const BusinessRulesContent = () => (
    <motion.div 
      className="space-y-6"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
    </motion.div>
  );

  const ProductsUnitsContent = () => (
    <motion.div 
      className="space-y-6"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      
  
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'agent-types':
        return <AgentTypesContent />;
      case 'products-units':
        return <ProductsUnitsContent />;
      case 'business-rules':
        return <BusinessRulesContent />;
      default:
        return (
          <motion.div 
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            
          </motion.div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
      
      {/* ErrorNotification component */}
      <ErrorNotification
        isVisible={errorNotification.isVisible}
        onClose={hideErrorNotification}
        title={errorNotification.title}
        message={errorNotification.message}
        type={errorNotification.type}
        details={errorNotification.details}
        actionText="Đã hiểu"
      />
    </div>
  );
};

export default SettingsLayout;