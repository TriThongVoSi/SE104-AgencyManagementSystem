import React from 'react';

const DebtReportTable = ({ debtReports, loading, onEdit, onDelete }) => {
  /**
   * Format tiền tệ
   */
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Format tháng/năm
   */
  const formatMonthYear = (month, year) => {
    return `${month.toString().padStart(2, '0')}/${year}`;
  };

  /**
   * Lấy màu cho số tiền dựa trên giá trị
   */
  const getAmountColor = (amount) => {
    if (amount > 0) return 'text-red-600'; // Nợ - màu đỏ
    if (amount < 0) return 'text-green-600'; // Dư - màu xanh
    return 'text-gray-600'; // Bằng 0 - màu xám
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!debtReports || debtReports.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">Không có báo cáo công nợ</p>
          <p className="text-gray-600">Chưa có báo cáo công nợ nào cho tháng/năm đã chọn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">
          Danh sách Báo cáo Công nợ ({debtReports.length} báo cáo)
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tháng/Năm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đại lý
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nợ đầu kỳ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nợ phát sinh
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nợ cuối kỳ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {debtReports.map((report, index) => (
              <tr key={`${report.debtReportId || index}`} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {formatMonthYear(report.month, report.year)}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {report.agent?.agentName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {report.agent?.agentId || 'N/A'}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <span className={`font-medium ${getAmountColor(report.firstDebt)}`}>
                    {formatCurrency(report.firstDebt)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <span className={`font-medium ${getAmountColor(report.arisenDebt)}`}>
                    {formatCurrency(report.arisenDebt)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <span className={`font-medium ${getAmountColor(report.lastDebt)}`}>
                    {formatCurrency(report.lastDebt)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.lastDebt > 0 
                      ? 'bg-red-100 text-red-800' 
                      : report.lastDebt < 0 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {report.lastDebt > 0 ? 'Còn nợ' : report.lastDebt < 0 ? 'Dư tiền' : 'Cân bằng'}
                  </span>
                </td>
                
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(report)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      
                      {onDelete && (
                        <button
                          onClick={() => onDelete(report)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {debtReports.length > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">
              Tổng kết ({debtReports.length} báo cáo):
            </span>
            <div className="flex space-x-6">
              <div className="text-right">
                <span className="text-gray-600">Tổng nợ đầu kỳ: </span>
                <span className={`font-medium ${getAmountColor(
                  debtReports.reduce((sum, report) => sum + (report.firstDebt || 0), 0)
                )}`}>
                  {formatCurrency(debtReports.reduce((sum, report) => sum + (report.firstDebt || 0), 0))}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-600">Tổng nợ phát sinh: </span>
                <span className={`font-medium ${getAmountColor(
                  debtReports.reduce((sum, report) => sum + (report.arisenDebt || 0), 0)
                )}`}>
                  {formatCurrency(debtReports.reduce((sum, report) => sum + (report.arisenDebt || 0), 0))}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-600">Tổng nợ cuối kỳ: </span>
                <span className={`font-medium ${getAmountColor(
                  debtReports.reduce((sum, report) => sum + (report.lastDebt || 0), 0)
                )}`}>
                  {formatCurrency(debtReports.reduce((sum, report) => sum + (report.lastDebt || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtReportTable; 