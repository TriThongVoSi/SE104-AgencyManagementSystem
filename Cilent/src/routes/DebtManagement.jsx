import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  FaFileInvoiceDollar, 
  FaUsers, 
  FaExclamationTriangle, 
  FaEye, 
  FaDownload,
  FaCalculator,
  FaSpinner,
  FaFilter,
  FaChartLine,
  FaTrendingUp,
  FaTrendingDown,
  FaBalanceScale,
  FaSync,
  FaPlus,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { useAuth } from '../contexts/AuthContext';
import debtReportService from '../utils/debtReportService';
import { getAllAgents } from '../utils/agentService';

// Màu sắc cho biểu đồ - đồng bộ với SalesReport
const CHART_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

// Hook thực tế cho debt report - tích hợp API
const useDebtManagement = () => {
  const { user, hasRole, ROLES } = useAuth();
  const [debtData, setDebtData] = useState(null);
  const [debtDetails, setDebtDetails] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [monthlyStatistics, setMonthlyStatistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportExists, setReportExists] = useState(false);

  // Fetch danh sách đại lý
  const fetchAgentsList = async () => {
    try {
      const result = await getAllAgents();
      if (result.status === 'success') {
        setAgentsList(result.data || []);
      } else {
        throw new Error('Không thể lấy danh sách đại lý');
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err.message);
    }
  };

  // Fetch báo cáo công nợ
  const fetchDebtReport = async (month, year, agentId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (agentId) {
        result = await debtReportService.getDebtReport(month, year, agentId);
        if (result.success && result.data) {
          setDebtDetails([result.data]);
          setDebtData({
            totalOpeningBalance: result.data.openingBalance || 0,
            totalTransactions: result.data.totalTransactions || 0,
            totalClosingBalance: result.data.closingBalance || 0,
            agentsCount: 1,
            reportMonth: month,
            reportYear: year
          });
          setReportExists(true);
        } else {
          setDebtDetails([]);
          setDebtData(null);
          setReportExists(false);
        }
      } else {
        result = await debtReportService.getAllDebtReportsByMonth(month, year);
        if (result.success && result.data && result.data.length > 0) {
          setDebtDetails(result.data);
          
          // Tính tổng các chỉ số
          const totals = result.data.reduce((acc, report) => {
            acc.totalOpeningBalance += report.openingBalance || 0;
            acc.totalTransactions += report.totalTransactions || 0;
            acc.totalClosingBalance += report.closingBalance || 0;
            return acc;
          }, { totalOpeningBalance: 0, totalTransactions: 0, totalClosingBalance: 0 });

          setDebtData({
            ...totals,
            agentsCount: result.data.length,
            reportMonth: month,
            reportYear: year
          });
          setReportExists(true);
        } else {
          setDebtDetails([]);
          setDebtData(null);
          setReportExists(false);
        }
      }
    } catch (err) {
      console.error('Error fetching debt report:', err);
      setError(err.message);
      setDebtDetails([]);
      setDebtData(null);
      setReportExists(false);
    } finally {
      setLoading(false);
    }
  };

  // Tạo báo cáo công nợ
  const createDebtReport = async (reportData) => {
    setLoading(true);
    try {
      const result = await debtReportService.createDebtReport(reportData);
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error creating debt report:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Tổng hợp báo cáo
  const summarizeReports = async (month, year) => {
    setLoading(true);
    try {
      const result = await debtReportService.summarizeDebtReports(month, year);
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error summarizing reports:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch thống kê 6 tháng (mock data)
  const fetchMonthlyStatistics = async () => {
    try {
      // TODO: Implement real API call when available
      const mockData = [
        { month: 'T9/2024', debt: 120000000, count: 8 },
        { month: 'T10/2024', debt: 135000000, count: 9 },
        { month: 'T11/2024', debt: 142000000, count: 10 },
        { month: 'T12/2024', debt: 158000000, count: 11 },
        { month: 'T1/2025', debt: 180000000, count: 12 },
        { month: 'T2/2025', debt: 225000000, count: 14 },
      ];
      setMonthlyStatistics(mockData);
    } catch (err) {
      console.error('Error fetching monthly statistics:', err);
    }
  };

  // Refresh data
  const refreshData = async (month, year, agentId = null) => {
    await fetchDebtReport(month, year, agentId);
  };

  // Check permissions
  const canCreate = hasRole(ROLES.ADMIN) || hasRole(ROLES.DEBT) || hasRole(ROLES.DEBT_ACCOUNTANT);
  const canEdit = hasRole(ROLES.ADMIN) || hasRole(ROLES.DEBT) || hasRole(ROLES.DEBT_ACCOUNTANT);
  const canDelete = hasRole(ROLES.ADMIN) || hasRole(ROLES.DEBT) || hasRole(ROLES.DEBT_ACCOUNTANT);

  return {
    debtData,
    debtDetails,
    agentsList,
    monthlyStatistics,
    loading,
    error,
    reportExists,
    fetchDebtReport,
    fetchAgentsList,
    createDebtReport,
    summarizeReports,
    fetchMonthlyStatistics,
    refreshData,
    permissions: { canCreate, canEdit, canDelete }
  };
};

// Component Header với filters - đồng bộ với SalesReport
const DebtManagementHeader = ({ 
  selectedMonth, 
  selectedYear, 
  selectedAgent,
  agentsList,
  onMonthChange, 
  onYearChange, 
  onAgentChange,
  onCreateReport,
  onSummarizeReports,
  onViewReport,
  onResetFilters,
  totalDebt,
  loading,
  permissions
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col gap-6">
        {/* Title Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              💳 Quản Lý Công Nợ
            </h1>
            <p className="text-gray-600">Theo dõi và quản lý công nợ của hệ thống đại lý</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {permissions?.canCreate && (
              <button
                onClick={onCreateReport}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <FaPlus />
                Tạo Báo Cáo
              </button>
            )}
            
            {permissions?.canCreate && (
              <button
                onClick={onSummarizeReports}
                disabled={loading || !selectedMonth || !selectedYear}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <FaCalculator />
                Tổng Hợp
              </button>
            )}
            
            <button
              onClick={onViewReport}
              disabled={loading || !selectedMonth || !selectedYear}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <FaEye />
              Xem Báo Cáo
            </button>
            
            <button
              onClick={onResetFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <FaSync />
              Đặt Lại
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
              <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">-- Chọn Tháng --</option>
                {months.map(month => (
                  <option key={month} value={month}>
                    Tháng {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">-- Chọn Năm --</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Đại Lý</label>
              <select
                value={selectedAgent}
                onChange={(e) => onAgentChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">-- Tất Cả Đại Lý --</option>
                {agentsList.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Total Debt Summary */}
        {totalDebt > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-l-4 border-red-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Tổng công nợ cuối kỳ {selectedMonth}/{selectedYear}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {totalDebt.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>
              <FaFileInvoiceDollar className="text-3xl text-red-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component tổng quan công nợ
const DebtSummaryCards = ({ debtData }) => {
  if (!debtData) return null;

  const summaryStats = [
    {
      title: "Nợ Đầu Kỳ",
      value: debtData.totalOpeningBalance?.toLocaleString('vi-VN') + " VNĐ" || "0 VNĐ",
      icon: <FaBalanceScale className="text-2xl" />,
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-white",
      trend: "stable"
    },
    {
      title: "Phát Sinh Trong Kỳ",
      value: debtData.totalTransactions?.toLocaleString('vi-VN') + " VNĐ" || "0 VNĐ",
      icon: <FaTrendingUp className="text-2xl" />,
      bgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
      textColor: "text-white",
      trend: "up"
    },
    {
      title: "Nợ Cuối Kỳ",
      value: debtData.totalClosingBalance?.toLocaleString('vi-VN') + " VNĐ" || "0 VNĐ",
      icon: <FaExclamationTriangle className="text-2xl" />,
      bgColor: "bg-gradient-to-r from-red-500 to-pink-600",
      textColor: "text-white",
      trend: "warning"
    },
    {
      title: "Số Đại Lý Có Nợ",
      value: debtData.agentsCount || 0,
      icon: <FaUsers className="text-2xl" />,
      bgColor: "bg-gradient-to-r from-purple-500 to-indigo-600",
      textColor: "text-white",
      trend: "info"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {summaryStats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg shadow-lg p-6 ${stat.textColor} transform hover:scale-105 transition-transform`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm opacity-90 mb-2">{stat.title}</p>
              <p className="text-xl font-bold break-words">{stat.value}</p>
            </div>
            <div className="opacity-80 ml-4">
              {stat.icon}
            </div>
          </div>
          
          {/* Trend indicator */}
          <div className="mt-3 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              stat.trend === 'up' ? 'bg-green-300' :
              stat.trend === 'warning' ? 'bg-yellow-300' :
              stat.trend === 'stable' ? 'bg-blue-300' : 'bg-purple-300'
            }`}></div>
            <span className="text-xs opacity-75">
              {stat.trend === 'up' ? 'Tăng' :
               stat.trend === 'warning' ? 'Cảnh báo' :
               stat.trend === 'stable' ? 'Ổn định' : 'Theo dõi'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Component bảng chi tiết công nợ
const DebtDetailsTable = ({ debtDetails, onViewDetail, onExportExcel }) => {
  if (!debtDetails || debtDetails.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Chi Tiết Công Nợ Theo Đại Lý</h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500">Không có dữ liệu công nợ để hiển thị</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status, amount) => {
    const statusConfig = {
      danger: { color: 'bg-red-100 text-red-800', label: 'Nguy hiểm' },
      warning: { color: 'bg-yellow-100 text-yellow-800', label: 'Cảnh báo' },
      normal: { color: 'bg-green-100 text-green-800', label: 'Bình thường' }
    };

    // Auto-determine status based on amount if not provided
    if (!status) {
      if (amount > 100000000) status = 'danger';
      else if (amount > 50000000) status = 'warning';
      else status = 'normal';
    }

    const config = statusConfig[status] || statusConfig.normal;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Chi Tiết Công Nợ Theo Đại Lý</h3>
        <button
          onClick={() => onExportExcel(debtDetails)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <FaDownload />
          Xuất Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">STT</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tên Đại Lý</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Nợ Đầu Kỳ</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Phát Sinh</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Nợ Cuối Kỳ</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Trạng Thái</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {debtDetails.map((debt, index) => (
              <tr key={debt.agentId || index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium text-center">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  <div className="flex flex-col">
                    <span>{debt.agent?.agentName || debt.agentName || `Đại lý ${debt.agentId}`}</span>
                    <span className="text-xs text-gray-500">{debt.agent?.agentCode || debt.agentId}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">
                  <span className="text-blue-600 font-medium">
                    {(debt.openingBalance || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">
                  <span className="text-orange-600 font-medium">
                    {(debt.totalTransactions || debt.transactions || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">
                  <span className="text-red-600 font-bold">
                    {(debt.closingBalance || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(debt.status, debt.closingBalance)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onViewDetail(debt)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Xem Chi Tiết"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => onExportExcel([debt])}
                      className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                      title="Xuất Excel"
                    >
                      <FaDownload />
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

// Component biểu đồ công nợ - đồng bộ với SalesReport
const DebtAnalyticsCharts = ({ debtDetails, monthlyData }) => {
  if (!debtDetails || debtDetails.length === 0) return null;

  // Dữ liệu cho Pie Chart - tỷ lệ công nợ theo đại lý
  const pieData = debtDetails?.slice(0, 6).map((debt, index) => ({
    name: debt.agentName || `Đại lý ${debt.agentId}`,
    value: debt.closingBalance || 0,
    color: CHART_COLORS[index % CHART_COLORS.length]
  })) || [];

  // Dữ liệu cho biểu đồ so sánh
  const comparisonData = debtDetails.map(debt => ({
    name: debt.agentName?.substring(0, 10) + '...' || `ĐL ${debt.agentId}`,
    fullName: debt.agentName || `Đại lý ${debt.agentId}`,
    'Nợ Đầu Kỳ': debt.openingBalance || 0,
    'Phát Sinh': debt.totalTransactions || debt.transactions || 0,
    'Nợ Cuối Kỳ': debt.closingBalance || 0
  }));

  // Dữ liệu cho biểu đồ xu hướng
  const trendData = monthlyData || [
    { month: 'T9/2024', debt: 120000000, count: 8 },
    { month: 'T10/2024', debt: 135000000, count: 9 },
    { month: 'T11/2024', debt: 142000000, count: 10 },
    { month: 'T12/2024', debt: 158000000, count: 11 },
    { month: 'T1/2025', debt: 180000000, count: 12 },
    { month: 'T2/2025', debt: 225000000, count: 14 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Pie Chart - Tỷ lệ công nợ */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaBalanceScale className="text-red-500" />
          Tỷ Lệ Công Nợ Theo Đại Lý
        </h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  percent > 5 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-16">Không có dữ liệu để hiển thị</p>
        )}
      </div>

      {/* Bar Chart - So sánh công nợ */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-500" />
          So Sánh Công Nợ Theo Đại Lý
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => (value / 1000000).toFixed(0) + 'M'}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value, name) => [
                `${value.toLocaleString('vi-VN')} VNĐ`, 
                name
              ]}
              labelFormatter={(label) => {
                const item = comparisonData.find(d => d.name === label);
                return item ? item.fullName : label;
              }}
            />
            <Legend />
            <Bar dataKey="Nợ Đầu Kỳ" fill="#3b82f6" />
            <Bar dataKey="Phát Sinh" fill="#f59e0b" />
            <Bar dataKey="Nợ Cuối Kỳ" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Area Chart - Xu hướng công nợ 6 tháng */}
      <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaTrendingUp className="text-orange-500" />
          Xu Hướng Công Nợ 6 Tháng Gần Nhất
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis 
              tickFormatter={(value) => (value / 1000000).toFixed(0) + 'M'}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'debt' ? `${value.toLocaleString('vi-VN')} VNĐ` : value,
                name === 'debt' ? 'Tổng công nợ' : 'Số đại lý có nợ'
              ]}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="debt" 
              stroke="#ef4444" 
              fill="url(#colorDebt)" 
              strokeWidth={2}
              name="Tổng công nợ"
            />
            <Bar dataKey="count" fill="#8884d8" name="Số đại lý có nợ" />
            <defs>
              <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Component chính DebtManagement - cải tiến với tích hợp API thực tế
const DebtManagement = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedDebtDetail, setSelectedDebtDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sử dụng custom hook cải tiến
  const { 
    debtData, 
    debtDetails, 
    agentsList,
    monthlyStatistics,
    loading, 
    error, 
    reportExists, 
    fetchDebtReport, 
    fetchAgentsList,
    createDebtReport,
    summarizeReports,
    fetchMonthlyStatistics,
    refreshData,
    permissions
  } = useDebtManagement();

  // Handlers
  const handleCreateReport = async (reportData = null) => {
    if (!reportData) {
      // Show create modal
      setShowCreateModal(true);
      return;
    }

    const result = await createDebtReport(reportData);
    
    if (result.success) {
      toast.success(result.message || "Tạo báo cáo công nợ thành công!");
      setShowCreateModal(false);
      await handleViewReport();
    } else {
      toast.error(result.error || "Lỗi khi tạo báo cáo công nợ!");
    }
  };

  const handleSummarizeReports = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Vui lòng chọn tháng và năm!");
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn tổng hợp báo cáo công nợ cho tất cả đại lý?')) {
      return;
    }

    const result = await summarizeReports(selectedMonth, selectedYear);
    
    if (result.success) {
      toast.success(result.message || "Tổng hợp báo cáo công nợ thành công!");
      await handleViewReport();
    } else {
      toast.error(result.error || "Lỗi khi tổng hợp báo cáo công nợ!");
    }
  };

  const handleViewReport = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Vui lòng chọn tháng và năm!");
      return;
    }
    
    await refreshData(selectedMonth, selectedYear, selectedAgent);
  };

  const handleResetFilters = () => {
    setSelectedMonth("");
    setSelectedYear("");
    setSelectedAgent("");
    toast.info("Đã đặt lại bộ lọc");
  };

  const handleViewDetail = (debtDetail) => {
    setSelectedDebtDetail(debtDetail);
    setShowDetailModal(true);
  };

  const handleExportExcel = (data = debtDetails) => {
    if (!data || data.length === 0) {
      toast.warning("Không có dữ liệu để xuất!");
      return;
    }

    const worksheetData = data.map((debt, index) => ({
      "STT": index + 1,
      "Tên Đại Lý": debt.agent?.agentName || debt.agentName || `Đại lý ${debt.agentId}`,
      "Mã Đại Lý": debt.agent?.agentCode || debt.agentId || '',
      "Nợ Đầu Kỳ (VNĐ)": debt.openingBalance || 0,
      "Phát Sinh Trong Kỳ (VNĐ)": debt.totalTransactions || debt.transactions || 0,
      "Nợ Cuối Kỳ (VNĐ)": debt.closingBalance || 0,
      "Tháng": debt.month || selectedMonth,
      "Năm": debt.year || selectedYear,
      "Trạng Thái": getDebtStatus(debt.closingBalance || 0)
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoCongNo");
    
    const agentName = selectedAgent ? 
      agentsList.find(a => a.id == selectedAgent)?.name || selectedAgent : 
      'TatCa';
    const fileName = `BaoCaoCongNo_${agentName}_${selectedMonth}_${selectedYear}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
    toast.success("Xuất Excel thành công!");
  };

  // Helper function for debt status
  const getDebtStatus = (amount) => {
    if (amount > 100000000) return 'Nguy hiểm';
    if (amount > 50000000) return 'Cảnh báo';
    return 'Bình thường';
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchAgentsList();
    fetchMonthlyStatistics();
  }, []);

  // Auto load báo cáo khi thay đổi filters
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchDebtReport(selectedMonth, selectedYear, selectedAgent);
    }
  }, [selectedMonth, selectedYear, selectedAgent]);

  const totalDebt = debtData?.totalClosingBalance || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-4">
              <FaSpinner className="animate-spin text-2xl text-blue-500" />
              <p className="text-lg font-medium">Đang xử lý dữ liệu...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="text-red-500 text-xl">❌</div>
              <div>
                <h4 className="text-red-800 font-medium">Có lỗi xảy ra</h4>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header với filters - cải tiến */}
        <DebtManagementHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedAgent={selectedAgent}
          agentsList={agentsList}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onAgentChange={setSelectedAgent}
          onCreateReport={handleCreateReport}
          onSummarizeReports={handleSummarizeReports}
          onViewReport={handleViewReport}
          onResetFilters={handleResetFilters}
          totalDebt={totalDebt}
          loading={loading}
          permissions={permissions}
        />

        {/* No Data State - cải tiến */}
        {!loading && !error && !reportExists && selectedMonth && selectedYear && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Không có dữ liệu công nợ cho tháng {selectedMonth}/{selectedYear}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedAgent 
                ? `Đại lý "${agentsList.find(a => a.id == selectedAgent)?.name || selectedAgent}" chưa có báo cáo công nợ`
                : "Chưa có báo cáo công nợ cho thời gian này"
              }
            </p>
            <div className="flex justify-center gap-4">
              {permissions?.canCreate && (
                <button
                  onClick={() => handleCreateReport()}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <FaPlus />
                  Tạo Báo Cáo Mới
                </button>
              )}
              
            </div>
          </div>
        )}

        {/* Report Content - cải tiến */}
        {!loading && !error && reportExists && debtData && (
          <>
            {/* Summary Cards */}
            <DebtSummaryCards debtData={debtData} />

            {/* Detail Table */}
            <DebtDetailsTable
              debtDetails={debtDetails}
              onViewDetail={handleViewDetail}
              onExportExcel={handleExportExcel}
            />

            {/* Analytics Charts */}
            <DebtAnalyticsCharts 
              debtDetails={debtDetails} 
              monthlyData={monthlyStatistics}
            />
          </>
        )}

        {/* Modal chi tiết công nợ - cải tiến */}
        {showDetailModal && selectedDebtDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Chi Tiết Công Nợ - {selectedDebtDetail.agent?.agentName || selectedDebtDetail.agentName || `Đại lý ${selectedDebtDetail.agentId}`}
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Thông tin tổng quan */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-gray-600 mb-1">Nợ Đầu Kỳ</p>
                      <p className="text-xl font-bold text-blue-600">
                        {(selectedDebtDetail.openingBalance || 0).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-600 mb-1">Phát Sinh</p>
                      <p className="text-xl font-bold text-orange-600">
                        {(selectedDebtDetail.totalTransactions || selectedDebtDetail.transactions || 0).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                      <p className="text-sm text-gray-600 mb-1">Nợ Cuối Kỳ</p>
                      <p className="text-xl font-bold text-red-600">
                        {(selectedDebtDetail.closingBalance || 0).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Thông Tin Chi Tiết</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Mã đại lý:</span>
                        <span className="ml-2 font-medium">{selectedDebtDetail.agent?.agentCode || selectedDebtDetail.agentId}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className="ml-2">
                          {getDebtStatus(selectedDebtDetail.closingBalance) === 'Nguy hiểm' ? (
                            <span className="text-red-600 font-medium">🔴 Nguy hiểm</span>
                          ) : getDebtStatus(selectedDebtDetail.closingBalance) === 'Cảnh báo' ? (
                            <span className="text-yellow-600 font-medium">🟡 Cảnh báo</span>
                          ) : (
                            <span className="text-green-600 font-medium">🟢 Bình thường</span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Thời gian báo cáo:</span>
                        <span className="ml-2 font-medium">
                          {selectedDebtDetail.month || selectedMonth}/{selectedDebtDetail.year || selectedYear}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tỷ lệ tăng trưởng:</span>
                        <span className="ml-2 font-medium">
                          {selectedDebtDetail.openingBalance > 0 ? 
                            (((selectedDebtDetail.closingBalance - selectedDebtDetail.openingBalance) / selectedDebtDetail.openingBalance) * 100).toFixed(1) + '%' : 
                            'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Loại đại lý:</span>
                        <span className="ml-2 font-medium">{selectedDebtDetail.agent?.agentType?.typeName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Khu vực:</span>
                        <span className="ml-2 font-medium">{selectedDebtDetail.agent?.district?.districtName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Biểu đồ nhỏ cho chi tiết */}
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Biến Động Công Nợ</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart 
                        data={[
                          { name: 'Đầu kỳ', value: selectedDebtDetail.openingBalance || 0 },
                          { name: 'Phát sinh', value: selectedDebtDetail.totalTransactions || selectedDebtDetail.transactions || 0 },
                          { name: 'Cuối kỳ', value: selectedDebtDetail.closingBalance || 0 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => (value / 1000000).toFixed(0) + 'M'} />
                        <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`} />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => handleExportExcel([selectedDebtDetail])}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                  >
                    <FaDownload />
                    Xuất Excel
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal tạo báo cáo công nợ */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Tạo Báo Cáo Công Nợ Mới
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-700 mb-2">💡 Hướng dẫn</p>
                    <p className="text-sm text-blue-600">
                      Chức năng tạo báo cáo cần được tích hợp với component DebtReportForm. 
                      Hiện tại đang hiển thị modal cơ bản.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={selectedMonth}
                      >
                        <option value="">Chọn tháng</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>Tháng {month}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={selectedYear}
                      >
                        <option value="">Chọn năm</option>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đại lý</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Chọn đại lý</option>
                      {agentsList.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      toast.info("Chức năng đang phát triển. Vui lòng tích hợp với DebtReportForm component.");
                      setShowCreateModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <FaPlus />
                    Tạo Báo Cáo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtManagement; 