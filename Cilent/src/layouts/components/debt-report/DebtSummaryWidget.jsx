import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaChartLine, 
  FaCalculator, 
  FaUsers,
  FaEye,
  FaSpinner,
  FaExclamationTriangle 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import debtReportService from '../../../utils/debtReportService';
import { useAuth } from '../../../contexts/AuthContext';

const DebtSummaryWidget = () => {
  const navigate = useNavigate();
  const { hasRole, ROLES } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchSummaryData();
  }, []);

  /**
   * Lấy dữ liệu tóm tắt công nợ
   */
  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      const result = await debtReportService.getDebtReportSummary(currentMonth, currentYear);
      
      if (result.success) {
        setSummaryData(result.data);
        setError(null);
      } else {
        setError('Không thể lấy dữ liệu báo cáo công nợ');
      }
    } catch (err) {
      console.error('Error fetching debt summary:', err);
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format tiền tệ
   */
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  /**
   * Lấy màu cho số tiền
   */
  const getAmountColor = (amount) => {
    if (amount > 0) return 'text-red-600';
    if (amount < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  /**
   * Điều hướng đến trang báo cáo công nợ
   */
  const handleViewDetails = () => {
    navigate('/debt-reports');
  };

  // Check permissions
  const canView = hasRole(ROLES.ADMIN) || hasRole(ROLES.DEBT) || hasRole(ROLES.DEBT_ACCOUNTANT) || hasRole(ROLES.VIEWER);

  if (!canView) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32 text-red-600">
          <FaExclamationTriangle className="text-2xl mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Tổng Quan Công Nợ
            </h3>
            <p className="text-blue-100 text-sm">
              Tháng {currentMonth}/{currentYear}
            </p>
          </div>
          <button
            onClick={handleViewDetails}
            className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center gap-1"
          >
            <FaEye className="text-xs" />
            Chi tiết
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {summaryData && summaryData.agentSummaries ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Nợ đầu */}
              <div className="text-center">
                <div className="bg-blue-50 rounded-lg p-3 mb-2">
                  <FaMoneyBillWave className="text-blue-600 text-xl mx-auto" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Nợ Đầu</p>
                <p className={`font-bold text-sm ${getAmountColor(summaryData.totalFirstDebt)}`}>
                  {formatCurrency(summaryData.totalFirstDebt)}
                </p>
              </div>

              {/* Phát sinh */}
              <div className="text-center">
                <div className="bg-orange-50 rounded-lg p-3 mb-2">
                  <FaCalculator className="text-orange-600 text-xl mx-auto" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Phát Sinh</p>
                <p className={`font-bold text-sm ${getAmountColor(summaryData.totalArisenDebt)}`}>
                  {formatCurrency(summaryData.totalArisenDebt)}
                </p>
              </div>

              {/* Nợ cuối */}
              <div className="text-center">
                <div className="bg-red-50 rounded-lg p-3 mb-2">
                  <FaChartLine className="text-red-600 text-xl mx-auto" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Nợ Cuối</p>
                <p className={`font-bold text-sm ${getAmountColor(summaryData.totalLastDebt)}`}>
                  {formatCurrency(summaryData.totalLastDebt)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <FaUsers className="mr-2" />
                  <span>{summaryData.agentSummaries.length} đại lý có công nợ</span>
                </div>
                <div className="text-gray-500">
                  VNĐ
                </div>
              </div>
            </div>

            {/* Top debts preview */}
            {summaryData.agentSummaries.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Top 3 Nợ Cao Nhất
                </h4>
                <div className="space-y-2">
                  {summaryData.agentSummaries
                    .slice(0, 3)
                    .map((agent, index) => (
                      <div 
                        key={agent.agentId} 
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center">
                          <span className={`w-4 h-4 rounded-full text-white text-xs flex items-center justify-center mr-2 ${
                            index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-gray-700 truncate max-w-20">
                            {agent.agentName}
                          </span>
                        </div>
                        <span className={`font-medium ${getAmountColor(agent.lastDebt)}`}>
                          {formatCurrency(agent.lastDebt)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <FaChartLine className="text-gray-400 text-3xl mx-auto mb-2" />
            <p className="text-gray-600 text-sm">
              Chưa có dữ liệu công nợ cho tháng này
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtSummaryWidget; 