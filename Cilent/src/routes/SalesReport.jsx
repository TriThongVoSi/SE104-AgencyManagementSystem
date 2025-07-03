import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  FaChartLine, 
  FaUsers, 
  FaFileExport, 
  FaEye, 
  FaDownload,
  FaCalculator,
  FaSpinner
} from "react-icons/fa";
import * as XLSX from "xlsx";
import useSalesReport from "../hooks/useSalesReport";

// Màu sắc cho biểu đồ - updated for dark theme
const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#06B6D4'];

// Component Header Section
const ReportHeader = ({ 
  selectedMonth, 
  selectedYear, 
  onMonthChange, 
  onYearChange, 
  onCreateReport, 
  onViewReport, 
  totalRevenue, 
  loading 
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-red-500 mb-2">
            📊 Báo Cáo Doanh Số
          </h1>
          <p className="text-gray-400">Quản lý và theo dõi doanh thu hệ thống đại lý</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Dropdown chọn tháng/năm */}
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn Tháng --</option>
              {months.map(month => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn Năm --</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tổng doanh thu */}
      {totalRevenue > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Tổng doanh thu tháng {selectedMonth}/{selectedYear}</p>
              <p className="text-2xl font-bold text-blue-400">
                {totalRevenue.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            <FaChartLine className="text-3xl text-blue-400" />
          </div>
        </div>
      )}
    </div>
  );
};

// Component Summary Cards
const SummaryCards = ({ reportData, agentsData }) => {
  const summaryStats = {
    totalRevenue: reportData?.totalRevenue || 0,
    activeAgentsCount: agentsData?.length || 0,
    totalExportReceipts: agentsData?.reduce((sum, agent) => sum + (agent.exportCount || 0), 0) || 0,
  };

  const cards = [
    {
      title: "Tổng Doanh Thu",
      value: summaryStats.totalRevenue.toLocaleString('vi-VN') + " VNĐ",
      icon: <FaChartLine className="text-2xl" />,
      bgColor: "bg-gradient-to-r from-purple-600 to-purple-700",
      textColor: "text-white"
    },
    {
      title: "Đại Lý Có Giao Dịch",
      value: summaryStats.activeAgentsCount,
      icon: <FaUsers className="text-2xl" />,
      bgColor: "bg-gradient-to-r from-green-600 to-green-700",
      textColor: "text-white"
    },
    {
      title: "Tổng Số Phiếu Xuất",
      value: summaryStats.totalExportReceipts,
      icon: <FaFileExport className="text-2xl" />,
      bgColor: "bg-gradient-to-r from-blue-600 to-blue-700",
      textColor: "text-white"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-lg shadow-lg p-6 ${card.textColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
            <div className="opacity-80">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Component Detail Table
const AgentTable = ({ agentsData, totalRevenue, onViewDetail, onExportExcel }) => {
  if (!agentsData || agentsData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Chi Tiết Theo Đại Lý</h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-400">Không có dữ liệu để hiển thị</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-white">Chi Tiết Theo Đại Lý</h3>
        <button
          onClick={() => onExportExcel(agentsData)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <FaDownload />
          Xuất Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-700 border-b border-gray-600">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">STT</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tên Đại Lý</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Số Phiếu Xuất</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tổng Trị Giá</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tỷ Lệ (%)</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {agentsData.map((agent, index) => {
              const ratio = agent.ratio || 0;
              
              return (
                <tr key={agent.agentId || index} className="hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium text-center">
                    {agent.stt || index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {agent.agentName || `Đại lý ${agent.agentId}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 text-center">
                    {agent.exportCount || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 text-right">
                    {(agent.totalAmount || 0).toLocaleString('vi-VN')} VNĐ
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ratio >= 20 ? 'bg-green-800 text-green-200' :
                      ratio >= 10 ? 'bg-yellow-800 text-yellow-200' :
                      'bg-red-800 text-red-200'
                    }`}>
                      {ratio.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => onViewDetail(agent)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Xem Chi Tiết"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => onExportExcel([agent])}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Xuất Excel"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component Charts Section  
const RevenueCharts = ({ agentsData, monthlyData }) => {
  // Dữ liệu cho Pie Chart
  const pieData = agentsData?.slice(0, 6).map((agent, index) => ({
    name: agent.agentName || `Đại lý ${agent.agentId}`,
    value: agent.totalAmount || 0,
    color: COLORS[index % COLORS.length]
  })) || [];

  // Dữ liệu cho Bar Chart (6 tháng gần nhất)
  const barData = monthlyData || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Pie Chart */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          Tỷ Lệ Doanh Thu Theo Đại Lý
        </h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-400">Không có dữ liệu để hiển thị</p>
          </div>
        )}
      </div>

      {/* Placeholder for Bar Chart */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          Thống Kê Theo Tháng
        </h3>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-gray-400">Dữ liệu thống kê theo tháng</p>
          <p className="text-sm text-gray-500 mt-2">Tính năng đang phát triển</p>
        </div>
      </div>
    </div>
  );
};

// Component chính SalesReport
const SalesReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(2);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Sử dụng hook mới
  const { 
    report, 
    details, 
    monthlyStatistics,
    loading, 
    error, 
    reportExists, 
    checkAndFetchReport, 
    createReport,
    fetchMonthlyStatistics,
    refreshData
  } = useSalesReport();

  // Tổng doanh thu từ report
  const totalRevenue = report?.totalRevenue || 0;
  
  // Transform data cho biểu đồ
  const agentsData = details || [];
  const monthlyData = monthlyStatistics || [];

  // Tạo báo cáo mới
  const handleCreateReport = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Vui lòng chọn tháng và năm!");
      return;
    }

    const result = await createReport(selectedMonth, selectedYear);
    
    if (result.success) {
      toast.success("Tạo báo cáo doanh số thành công!");
    } else {
      toast.error(result.error || "Lỗi khi tạo báo cáo doanh số!");
    }
  };

  // Xem báo cáo
  const handleViewReport = async () => {
    await refreshData(selectedMonth, selectedYear);
  };

  // Xem chi tiết đại lý
  const handleViewDetail = async (agent) => {
    setSelectedAgent(agent);
    setShowDetailModal(true);

    // Chi tiết đã có trong details array, không cần gọi API thêm
    console.log('Xem chi tiết đại lý:', agent);
  };

  // Xuất Excel
  const handleExportExcel = (data) => {
    // Sử dụng data được truyền vào, nếu không có thì dùng agentsData, nếu agentsData cũng không có thì dùng mảng rỗng
    const exportData = data || agentsData || [];
    
    if (!Array.isArray(exportData) || exportData.length === 0) {
      toast.warning("Không có dữ liệu để xuất!");
      return;
    }

    try {
      const worksheetData = exportData.map((agent, index) => ({
        "STT": agent.stt || (index + 1),
        "Tên Đại Lý": agent.agentName || `Đại lý ${agent.agentId || 'N/A'}`,
        "Số Phiếu Xuất": agent.exportCount || 0,
        "Tổng Trị Giá": agent.totalAmount || 0,
        "Tỷ Lệ (%)": (agent.ratio || 0).toFixed(2)
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoDoanhSo");
      XLSX.writeFile(workbook, `BaoCaoDoanhSo_${selectedMonth}_${selectedYear}.xlsx`);
      
      toast.success("Xuất Excel thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      toast.error("Có lỗi xảy ra khi xuất Excel!");
    }
  };

  // Load dữ liệu thống kê tháng khi component mount
  useEffect(() => {
    fetchMonthlyStatistics();
  }, [fetchMonthlyStatistics]);

  // Auto load khi thay đổi tháng/năm
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      checkAndFetchReport(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, checkAndFetchReport]);

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-4 border border-gray-700">
              <FaSpinner className="animate-spin text-2xl text-blue-400" />
              <p className="text-lg font-medium text-white">Đang xử lý...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="text-red-400 text-xl">❌</div>
              <div>
                <h4 className="text-red-300 font-medium">Có lỗi xảy ra</h4>
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <ReportHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onCreateReport={handleCreateReport}
          onViewReport={handleViewReport}
          totalRevenue={totalRevenue}
          loading={loading}
        />

        {/* No Data State */}
        {!loading && !error && !reportExists && selectedMonth && selectedYear && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-700">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Không có dữ liệu báo cáo cho tháng {selectedMonth}/{selectedYear}
            </h3>
            <p className="text-gray-400 mb-6">
              Vui lòng tạo báo cáo hoặc chọn thời gian khác
            </p>
            <button
              onClick={handleCreateReport}
              disabled={loading || reportExists}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto transition-colors"
            >
              <FaCalculator />
              Tạo Báo Cáo Ngay
            </button>
          </div>
        )}

        {/* Report Content */}
        {!loading && !error && reportExists && report && (
          <>
            {/* Summary Cards */}
            <SummaryCards reportData={report} agentsData={agentsData} />

            {/* Detail Table */}
            <AgentTable
              agentsData={agentsData}
              totalRevenue={totalRevenue}
              onViewDetail={handleViewDetail}
              onExportExcel={handleExportExcel}
            />

            {/* Charts Section */}
            <RevenueCharts
              agentsData={agentsData}
              monthlyData={monthlyData}
            />
          </>
        )}

        {/* Modal chi tiết đại lý */}
        {showDetailModal && selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Chi Tiết Báo Cáo - {selectedAgent.agentName || `Đại lý ${selectedAgent.agentId}`}
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-white transition-colors text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-900 p-4 rounded-lg border border-purple-700">
                      <p className="text-sm text-purple-300">STT</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {selectedAgent.stt || 0}
                      </p>
                    </div>
                    <div className="bg-green-900 p-4 rounded-lg border border-green-700">
                      <p className="text-sm text-green-300">Số Phiếu Xuất</p>
                      <p className="text-2xl font-bold text-green-400">
                        {selectedAgent.exportCount || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-900 p-4 rounded-lg border border-yellow-700">
                      <p className="text-sm text-yellow-300">Tổng Trị Giá</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {(selectedAgent.totalAmount || 0).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                    <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
                      <p className="text-sm text-blue-300">Tỷ Lệ (%)</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {(selectedAgent.ratio || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {selectedAgent.details && (
                    <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                      <h3 className="font-semibold text-white mb-2">Thông Tin Chi Tiết</h3>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        {JSON.stringify(selectedAgent.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
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
      </div>
    </div>
  );
};

export default SalesReport;