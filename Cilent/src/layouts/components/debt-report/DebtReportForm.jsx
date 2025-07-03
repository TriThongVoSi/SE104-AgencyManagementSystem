import React, { useState, useEffect } from 'react';

const DebtReportForm = ({
  isOpen,
  onClose,
  onSubmit,
  agents,
  defaultMonth,
  defaultYear,
  initialData = null,
  loading = false,
  title = "Báo cáo công nợ",
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    month: defaultMonth || new Date().getMonth() + 1,
    year: defaultYear || new Date().getFullYear(),
    agentId: '',
    firstDebt: 0,
    arisenDebt: 0,
    lastDebt: 0
  });

  const [errors, setErrors] = useState({});

  // Load initial data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        month: initialData.month,
        year: initialData.year,
        agentId: initialData.agent?.agentId || '',
        firstDebt: initialData.firstDebt || 0,
        arisenDebt: initialData.arisenDebt || 0,
        lastDebt: initialData.lastDebt || 0
      });
    } else {
      setFormData({
        month: defaultMonth || new Date().getMonth() + 1,
        year: defaultYear || new Date().getFullYear(),
        agentId: '',
        firstDebt: 0,
        arisenDebt: 0,
        lastDebt: 0
      });
    }
  }, [isEditing, initialData, defaultMonth, defaultYear]);

  // Auto-calculate lastDebt when firstDebt or arisenDebt changes
  useEffect(() => {
    const newLastDebt = (formData.firstDebt || 0) + (formData.arisenDebt || 0);
    if (newLastDebt !== formData.lastDebt) {
      setFormData(prev => ({
        ...prev,
        lastDebt: newLastDebt
      }));
    }
  }, [formData.firstDebt, formData.arisenDebt]);

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.month) {
      newErrors.month = 'Vui lòng chọn tháng';
    } else if (formData.month < 1 || formData.month > 12) {
      newErrors.month = 'Tháng phải từ 1 đến 12';
    }

    if (!formData.year) {
      newErrors.year = 'Vui lòng chọn năm';
    } else if (formData.year < 2000 || formData.year > 2100) {
      newErrors.year = 'Năm không hợp lệ';
    }

    if (!formData.agentId) {
      newErrors.agentId = 'Vui lòng chọn đại lý';
    }

    // Number validations
    if (isNaN(formData.firstDebt)) {
      newErrors.firstDebt = 'Nợ đầu kỳ phải là số';
    }

    if (isNaN(formData.arisenDebt)) {
      newErrors.arisenDebt = 'Nợ phát sinh phải là số';
    }

    if (isNaN(formData.lastDebt)) {
      newErrors.lastDebt = 'Nợ cuối kỳ phải là số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Find selected agent
    const selectedAgent = agents.find(agent => agent.agentId == formData.agentId);
    if (!selectedAgent) {
      setErrors({ agentId: 'Đại lý không tồn tại' });
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...initialData, // Keep existing ID for updates
      month: parseInt(formData.month),
      year: parseInt(formData.year),
      agent: {
        agentId: parseInt(formData.agentId),
        agentName: selectedAgent.agentName
      },
      firstDebt: parseInt(formData.firstDebt),
      arisenDebt: parseInt(formData.arisenDebt),
      lastDebt: parseInt(formData.lastDebt)
    };

    onSubmit(submitData);
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Format number input
   */
  const formatNumber = (value) => {
    const num = parseInt(value) || 0;
    return num.toLocaleString('vi-VN');
  };

  /**
   * Parse formatted number
   */
  const parseNumber = (value) => {
    return parseInt(value.replace(/[^\d-]/g, '')) || 0;
  };

  // Tạo danh sách tháng
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  // Tạo danh sách năm
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    years.push({ value: year, label: `Năm ${year}` });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Month */}
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                Tháng <span className="text-red-500">*</span>
              </label>
              <select
                id="month"
                value={formData.month}
                onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                disabled={isEditing}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  errors.month ? 'border-red-300' : 'border-gray-300'
                } ${isEditing ? 'bg-gray-100' : ''}`}
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month}</p>}
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Năm <span className="text-red-500">*</span>
              </label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                disabled={isEditing}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  errors.year ? 'border-red-300' : 'border-gray-300'
                } ${isEditing ? 'bg-gray-100' : ''}`}
              >
                {years.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
              {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
            </div>

            {/* Agent */}
            <div className="md:col-span-2">
              <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 mb-2">
                Đại lý <span className="text-red-500">*</span>
              </label>
              <select
                id="agentId"
                value={formData.agentId}
                onChange={(e) => handleInputChange('agentId', e.target.value)}
                disabled={isEditing}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  errors.agentId ? 'border-red-300' : 'border-gray-300'
                } ${isEditing ? 'bg-gray-100' : ''}`}
              >
                <option value="">Chọn đại lý</option>
                {agents.map((agent) => (
                  <option key={agent.agentId} value={agent.agentId}>
                    {agent.agentName} (ID: {agent.agentId})
                  </option>
                ))}
              </select>
              {errors.agentId && <p className="mt-1 text-sm text-red-600">{errors.agentId}</p>}
            </div>

            {/* First Debt */}
            <div>
              <label htmlFor="firstDebt" className="block text-sm font-medium text-gray-700 mb-2">
                Nợ đầu kỳ (VNĐ)
              </label>
              <input
                type="text"
                id="firstDebt"
                value={formatNumber(formData.firstDebt)}
                onChange={(e) => handleInputChange('firstDebt', parseNumber(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-right ${
                  errors.firstDebt ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.firstDebt && <p className="mt-1 text-sm text-red-600">{errors.firstDebt}</p>}
            </div>

            {/* Arisen Debt */}
            <div>
              <label htmlFor="arisenDebt" className="block text-sm font-medium text-gray-700 mb-2">
                Nợ phát sinh (VNĐ)
              </label>
              <input
                type="text"
                id="arisenDebt"
                value={formatNumber(formData.arisenDebt)}
                onChange={(e) => handleInputChange('arisenDebt', parseNumber(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-right ${
                  errors.arisenDebt ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.arisenDebt && <p className="mt-1 text-sm text-red-600">{errors.arisenDebt}</p>}
            </div>

            {/* Last Debt - Auto calculated */}
            <div className="md:col-span-2">
              <label htmlFor="lastDebt" className="block text-sm font-medium text-gray-700 mb-2">
                Nợ cuối kỳ (VNĐ)
              </label>
              <input
                type="text"
                id="lastDebt"
                value={formatNumber(formData.lastDebt)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm text-right font-medium"
                placeholder="Tự động tính toán"
              />
              <p className="mt-1 text-sm text-gray-500">
                Nợ cuối kỳ = Nợ đầu kỳ + Nợ phát sinh
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isEditing ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtReportForm; 