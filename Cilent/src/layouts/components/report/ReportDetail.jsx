import React from 'react';
import { FaTimes, FaCalendarAlt, FaUser, FaMoneyBillWave, FaFileExport } from 'react-icons/fa';

const ReportDetail = ({ report, onClose, reportType }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            {reportType === 'debt' ? (
              <>
                <FaMoneyBillWave className="mr-3 text-red-600" />
                Chi tiết báo cáo công nợ
              </>
            ) : (
              <>
                <FaFileExport className="mr-3 text-blue-600" />
                Chi tiết báo cáo doanh số
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FaCalendarAlt className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Thời gian</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                Tháng {report.month}/{report.year}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FaUser className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Agent ID</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {report.agentId}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FaFileExport className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Report ID</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {report.reportId}
              </p>
            </div>
          </div>

          {/* Debt Report Details */}
          {reportType === 'debt' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Thông tin công nợ
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Nợ đầu kỳ</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.firstDebt?.toLocaleString()} đ
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Nợ phát sinh</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {report.arisenDebt?.toLocaleString()} đ
                  </p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Nợ cuối kỳ</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {report.lastDebt?.toLocaleString()} đ
                  </p>
                </div>
              </div>

              {/* Debt Analysis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Phân tích</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng nợ tích lũy:</span>
                    <span className="font-semibold text-gray-800">
                      {((report.firstDebt || 0) + (report.arisenDebt || 0)).toLocaleString()} đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tỷ lệ nợ phát sinh:</span>
                    <span className="font-semibold text-gray-800">
                      {report.firstDebt > 0 ? ((report.arisenDebt / report.firstDebt) * 100).toFixed(2) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Report Details */}
          {reportType === 'sales' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Thông tin doanh số
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-1">Số phiếu xuất</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {report.quantityExportReceipt}
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Tổng giá trị</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.totalValue?.toLocaleString()} đ
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-medium text-purple-800 mb-1">Tỷ lệ</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {report.proportion?.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Sales Analysis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Phân tích</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá trị trung bình mỗi phiếu:</span>
                    <span className="font-semibold text-gray-800">
                      {report.quantityExportReceipt > 0 
                        ? (report.totalValue / report.quantityExportReceipt).toLocaleString() 
                        : 0
                      } đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đánh giá hiệu suất:</span>
                    <span className={`font-semibold ${
                      report.proportion >= 5 ? 'text-green-600' :
                      report.proportion >= 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {report.proportion >= 5 ? 'Xuất sắc' :
                       report.proportion >= 2 ? 'Tốt' : 'Cần cải thiện'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail; 