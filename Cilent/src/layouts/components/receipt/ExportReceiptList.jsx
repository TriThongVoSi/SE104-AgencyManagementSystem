import React, { useState, useEffect } from 'react';
import exportReceiptService from '../../../utils/exportReceiptService';
import exportDetailService from '../../../utils/exportDetailService';
import agentService from '../../../utils/agentService';

const ExportReceiptList = () => {
  const [exportReceipts, setExportReceipts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [selectedAgent, setSelectedAgent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptDetails, setReceiptDetails] = useState([]);

  useEffect(() => {
    loadExportReceipts();
    loadAgents();
  }, []);

  const loadExportReceipts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await exportReceiptService.getAllExportReceipts();
      setExportReceipts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const data = await agentService.getAllAgents();
      setAgents(data);
    } catch (err) {
      console.error('Error loading agents:', err);
    }
  };

  const loadReceiptDetails = async (receiptId) => {
    try {
      const details = await exportDetailService.getExportDetailsByReceiptId(receiptId);
      setReceiptDetails(details);
    } catch (err) {
      console.error('Error loading receipt details:', err);
      setReceiptDetails([]);
    }
  };

  const handleFilterByAgent = async (agentId) => {
    if (!agentId) {
      loadExportReceipts();
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const data = await exportReceiptService.getExportReceiptsByAgent(agentId);
      setExportReceipts(data);
    } catch (err) {
      setError(err.message);
      setExportReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (receiptId) => {
    try {
      setError('');
      await exportReceiptService.deleteExportReceipt(receiptId);
      setSuccess('Xóa phiếu xuất hàng thành công');
      setShowDeleteModal(false);
      setSelectedReceipt(null);
      loadExportReceipts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleView = async (receipt) => {
    setSelectedReceipt(receipt);
    await loadReceiptDetails(receipt.exportReceiptId);
    setShowViewModal(true);
  };

  const handleEdit = (receipt) => {
    setSelectedReceipt(receipt);
    setShowEditModal(true);
  };

  const handleShowDelete = (receipt) => {
    setSelectedReceipt(receipt);
    setShowDeleteModal(true);
  };

  // Filter and search logic
  const filteredReceipts = exportReceipts.filter(receipt => {
    const matchesAgent = !selectedAgent || receipt.agent?.agentId?.toString() === selectedAgent;
    const matchesSearch = !searchTerm || 
      receipt.exportReceiptId?.toString().includes(searchTerm) ||
      receipt.agent?.agentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.agent?.agentCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAgent && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getPaymentStatus = (totalAmount, paidAmount) => {
    if (paidAmount >= totalAmount) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Đã thanh toán</span>;
    } else if (paidAmount > 0) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Thanh toán một phần</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Chưa thanh toán</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý phiếu xuất hàng</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + Tạo phiếu xuất
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, tên đại lý..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo đại lý
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value);
                handleFilterByAgent(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả đại lý</option>
              {agents.map(agent => (
                <option key={agent.agentId} value={agent.agentId}>
                  {agent.agentCode} - {agent.agentName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadExportReceipts}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Export Receipts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : paginatedReceipts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có phiếu xuất hàng nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã phiếu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đại lý
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã trả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Còn lại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReceipts.map((receipt) => (
                    <tr key={receipt.exportReceiptId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        PX{receipt.exportReceiptId?.toString().padStart(6, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{receipt.agent?.agentName}</div>
                          <div className="text-gray-500">{receipt.agent?.agentCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(receipt.createDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(receipt.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(receipt.paidAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(receipt.remainingAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatus(receipt.totalAmount, receipt.paidAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(receipt)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => handleEdit(receipt)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleShowDelete(receipt)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị{' '}
                      <span className="font-medium">{startIndex + 1}</span>
                      {' '}đến{' '}
                      <span className="font-medium">
                        {Math.min(startIndex + itemsPerPage, filteredReceipts.length)}
                      </span>
                      {' '}trong{' '}
                      <span className="font-medium">{filteredReceipts.length}</span>
                      {' '}kết quả
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ‹
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ›
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals would be added here */}
      {/* ViewExportReceiptModal, EditExportReceiptModal, CreateExportReceiptModal, DeleteConfirmModal */}
    </div>
  );
};

export default ExportReceiptList; 