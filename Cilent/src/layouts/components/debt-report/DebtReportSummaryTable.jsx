import React, { useState, useEffect } from 'react';
import { 
  FaEye, 
  FaDownload, 
  FaSpinner, 
  FaFileExcel,
  FaChartLine,
  FaUsers,
  FaMoneyBillWave,
  FaCalculator,
  FaInfoCircle
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

const DebtReportSummaryTable = ({ 
  summaryData, 
  loading, 
  onViewAgentDetail,
  month,
  year 
}) => {
  const [sortConfig, setSortConfig] = useState({ 
    key: 'lastDebt', 
    direction: 'desc' 
  });

  /**
   * Format tiền tệ VND
   */
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  /**
   * Lấy màu cho số tiền dựa trên giá trị
   */
  const getAmountColor = (amount) => {
    if (amount > 0) return 'text-red-600'; // Nợ - màu đỏ
    if (amount < 0) return 'text-green-600'; // Dư - màu xanh
    return 'text-gray-600'; // Bằng 0 - màu xám
  };

  /**
   * Lấy màu nền cho dòng dựa trên mức độ nợ
   */
  const getRowBgColor = (amount) => {
    if (amount > 50000000) return 'bg-red-50 hover:bg-red-100'; // Nợ cao
    if (amount > 10000000) return 'bg-yellow-50 hover:bg-yellow-100'; // Nợ trung bình
    if (amount > 0) return 'bg-orange-50 hover:bg-orange-100'; // Nợ thấp
    if (amount < 0) return 'bg-green-50 hover:bg-green-100'; // Dư tiền
    return 'bg-gray-50 hover:bg-gray-100'; // Cân bằng
  };

  /**
   * Sắp xếp dữ liệu
   */
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /**
   * Lấy dữ liệu đã sắp xếp
   */
  const getSortedData = () => {
    if (!summaryData?.agentSummaries) return [];
    
    const sortableData = [...summaryData.agentSummaries];
    sortableData.sort((a, b) => {
      if (sortConfig.key === 'agentName') {
        if (sortConfig.direction === 'asc') {
          return a.agentName.localeCompare(b.agentName, 'vi');
        }
        return b.agentName.localeCompare(a.agentName, 'vi');
      }
      
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      
      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });

    // Cập nhật lại STT sau khi sắp xếp
    return sortableData.map((item, index) => ({
      ...item,
      stt: index + 1
    }));
  };

  /**
   * Xuất báo cáo Excel
   */
  const handleExportExcel = () => {
    if (!summaryData?.agentSummaries) return;

    const sortedData = getSortedData();
    
    // Chuẩn bị dữ liệu cho Excel
    const excelData = [
      // Header
      ['BÁO CÁO TỔNG HỢP CÔNG NỢ'],
      [`Tháng ${month}/${year}`],
      [''],
      // Tổng kết
      ['TỔNG KẾT:'],
      ['Tổng Nợ Đầu:', formatCurrency(summaryData.totalFirstDebt)],
      ['Tổng Phát Sinh:', formatCurrency(summaryData.totalArisenDebt)],
      ['Tổng Nợ Cuối:', formatCurrency(summaryData.totalLastDebt)],
      [''],
      // Table headers
      ['STT', 'Tên Đại Lý', 'Nợ Đầu (VNĐ)', 'Phát Sinh (VNĐ)', 'Nợ Cuối (VNĐ)'],
      // Data rows
      ...sortedData.map(agent => [
        agent.stt,
        agent.agentName,
        agent.firstDebt,
        agent.arisenDebt,
        agent.lastDebt
      ])
    ];

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Style cho header
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Merge title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }  // Merge subtitle
    ];

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo công nợ');

    // Download file
    XLSX.writeFile(wb, `BaoCaoCongNo_${month}_${year}.xlsx`);
  };

  /**
   * Render icon sắp xếp
   */
  const renderSortIcon = (column) => {
    if (sortConfig.key !== column) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="text-blue-600">↑</span> : 
      <span className="text-blue-600">↓</span>;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải bảng tổng hợp báo cáo công nợ...</p>
        </div>
      </div>
    );
  }

  if (!summaryData || !summaryData.agentSummaries || summaryData.agentSummaries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-8 text-center">
          <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có dữ liệu</h3>
          <p className="text-gray-600">
            Chưa có báo cáo công nợ nào cho tháng {month}/{year}
          </p>
        </div>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Bảng Tổng Hợp Báo Cáo Công Nợ
            </h2>
            <p className="text-blue-100">
              Tháng {month}/{year} • {sortedData.length} đại lý
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <FaFileExcel />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
        <div className="bg-blue-100 rounded-lg p-4 text-center">
          <FaMoneyBillWave className="text-2xl text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-800 font-medium">Tổng Nợ Đầu</p>
          <p className={`text-lg font-bold ${getAmountColor(summaryData.totalFirstDebt)}`}>
            {formatCurrency(summaryData.totalFirstDebt)} VNĐ
          </p>
        </div>
        
        <div className="bg-orange-100 rounded-lg p-4 text-center">
          <FaCalculator className="text-2xl text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-orange-800 font-medium">Tổng Phát Sinh</p>
          <p className={`text-lg font-bold ${getAmountColor(summaryData.totalArisenDebt)}`}>
            {formatCurrency(summaryData.totalArisenDebt)} VNĐ
          </p>
        </div>
        
        <div className="bg-red-100 rounded-lg p-4 text-center">
          <FaChartLine className="text-2xl text-red-600 mx-auto mb-2" />
          <p className="text-sm text-red-800 font-medium">Tổng Nợ Cuối</p>
          <p className={`text-lg font-bold ${getAmountColor(summaryData.totalLastDebt)}`}>
            {formatCurrency(summaryData.totalLastDebt)} VNĐ
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                STT
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('agentName')}
              >
                <div className="flex items-center gap-1">
                  Tên Đại Lý
                  {renderSortIcon('agentName')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('firstDebt')}
              >
                <div className="flex items-center justify-end gap-1">
                  Nợ Đầu (VNĐ)
                  {renderSortIcon('firstDebt')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('arisenDebt')}
              >
                <div className="flex items-center justify-end gap-1">
                  Phát Sinh (VNĐ)
                  {renderSortIcon('arisenDebt')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('lastDebt')}
              >
                <div className="flex items-center justify-end gap-1">
                  Nợ Cuối (VNĐ)
                  {renderSortIcon('lastDebt')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((agent) => (
              <tr 
                key={agent.agentId} 
                className={`transition-colors duration-150 ${getRowBgColor(agent.lastDebt)}`}
              >
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {agent.stt}
                </td>
                
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaUsers className="text-blue-600 text-sm" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {agent.agentName}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {agent.agentId}
                      </p>
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-medium ${getAmountColor(agent.firstDebt)}`}>
                    {formatCurrency(agent.firstDebt)}
                  </span>
                </td>
                
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-medium ${getAmountColor(agent.arisenDebt)}`}>
                    {formatCurrency(agent.arisenDebt)}
                  </span>
                </td>
                
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-bold ${getAmountColor(agent.lastDebt)}`}>
                    {formatCurrency(agent.lastDebt)}
                  </span>
                </td>
                
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onViewAgentDetail && onViewAgentDetail(agent)}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded"
                    title="Xem chi tiết"
                  >
                    <FaEye className="text-sm" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          
          {/* Footer với tổng cộng */}
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr className="font-bold">
              <td colSpan="2" className="px-4 py-4 text-sm text-gray-900">
                TỔNG CỘNG ({sortedData.length} đại lý)
              </td>
              <td className="px-4 py-4 text-right text-sm">
                <span className={`font-bold ${getAmountColor(summaryData.totalFirstDebt)}`}>
                  {formatCurrency(summaryData.totalFirstDebt)}
                </span>
              </td>
              <td className="px-4 py-4 text-right text-sm">
                <span className={`font-bold ${getAmountColor(summaryData.totalArisenDebt)}`}>
                  {formatCurrency(summaryData.totalArisenDebt)}
                </span>
              </td>
              <td className="px-4 py-4 text-right text-sm">
                <span className={`font-bold ${getAmountColor(summaryData.totalLastDebt)}`}>
                  {formatCurrency(summaryData.totalLastDebt)}
                </span>
              </td>
              <td className="px-4 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Ghi chú */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="text-xs text-gray-600">
          <p className="mb-1">
            <span className="font-medium">Ghi chú:</span> 
            Nợ Cuối = Nợ Đầu + Phát Sinh (Xuất hàng - Thu tiền)
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-200 rounded"></span>
              Nợ cao (&gt; 50M)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-200 rounded"></span>
              Nợ trung bình (10M - 50M)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-orange-200 rounded"></span>
              Nợ thấp (&lt; 10M)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-200 rounded"></span>
              Dư tiền
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtReportSummaryTable; 