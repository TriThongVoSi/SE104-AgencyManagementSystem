import React, { useState } from 'react';

const ReportList = ({ reports, setReports, reportType, onViewReport }) => {
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const filteredReports = reports.filter((report) => {
    const matchesMonth = filterMonth ? report.month === parseInt(filterMonth) : true;
    const matchesYear = filterYear ? report.year === parseInt(filterYear) : true;
    return matchesMonth && matchesYear;
  });

  // Hàm xóa báo cáo (giả lập để sử dụng setReports)
  const handleDelete = (reportId) => {
    const updatedReports = reports.filter((report) => report.reportId !== reportId);
    setReports(updatedReports);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {reportType === 'debt' ? 'Danh sách Báo cáo công nợ' : 'Danh sách Báo cáo doanh số'}
      </h2>
      
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="number"
          placeholder="Tháng"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
        />
        <input
          type="number"
          placeholder="Năm"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
              {reportType === 'debt' && (
                <>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nợ đầu kỳ</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nợ phát sinh</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nợ cuối kỳ</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </>
              )}
              {reportType === 'sales' && (
                <>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng phiếu xuất</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng giá trị</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ (%)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <tr key={report.reportId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">{report.month}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{report.year}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{report.agentId}</td>
                {reportType === 'debt' && (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.firstDebt?.toLocaleString()} đ</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.arisenDebt?.toLocaleString()} đ</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.lastDebt?.toLocaleString()} đ</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {onViewReport && (
                          <button
                            onClick={() => onViewReport(report)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Xem
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(report.reportId)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </>
                )}
                {reportType === 'sales' && (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.quantityExportReceipt}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.totalValue?.toLocaleString()} đ</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.proportion?.toFixed(2)}%</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {onViewReport && (
                          <button
                            onClick={() => onViewReport(report)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Xem
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(report.reportId)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có báo cáo nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportList; 