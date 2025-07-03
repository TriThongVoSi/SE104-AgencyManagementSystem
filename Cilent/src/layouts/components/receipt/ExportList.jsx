import React, { useState } from 'react';

const ExportList = ({ receipts, onDelete, onEdit, onShowDetailAdd, onShowDetailView }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination logic
  const totalPages = Math.ceil(receipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceipts = receipts.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getAgentName = (receipt) => {
    if (receipt.agent && receipt.agent.agentName) {
      return receipt.agent.agentName;
    }
    return 'N/A';
  };

  const calculateRemainingAmount = (totalAmount, paidAmount) => {
    return (totalAmount || 0) - (paidAmount || 0);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">Danh sách phiếu xuất</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                STT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tên đại lý
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ngày lập phiếu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Số tiền trả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Còn lại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {paginatedReceipts.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                  Không có dữ liệu phiếu xuất
                </td>
              </tr>
            ) : (
              paginatedReceipts.map((receipt, index) => (
                <tr key={receipt.exportReceiptID || index} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {getAgentName(receipt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(receipt.createDate || receipt.createdDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                    {formatCurrency(receipt.totalAmount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">
                    {formatCurrency(receipt.paidAmount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                    {formatCurrency(calculateRemainingAmount(receipt.totalAmount, receipt.paidAmount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {/* View Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onShowDetailView(receipt.exportReceiptID || receipt.exportReceiptId, receipt);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-500 hover:bg-opacity-20"
                        title="Xem chi tiết"
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* Edit Button */}
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEdit(receipt);
                          }}
                          className="text-green-400 hover:text-green-300 transition-colors p-1 rounded hover:bg-green-500 hover:bg-opacity-20"
                          title="Chỉnh sửa"
                          type="button"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}

                      {/* Delete Button */}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.confirm('Bạn có chắc chắn muốn xóa phiếu xuất này?')) {
                              onDelete(receipt.exportReceiptID || receipt.exportReceiptId);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-500 hover:bg-opacity-20"
                          title="Xóa"
                          type="button"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, receipts.length)} của {receipts.length} phiếu xuất
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded text-sm bg-gray-600 text-gray-300 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === i + 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded text-sm bg-gray-600 text-gray-300 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportList;