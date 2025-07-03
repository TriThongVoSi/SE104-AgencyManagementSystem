import React, { useState, useEffect } from 'react';
import { 
  getAllImportReceipts,
  getImportReceiptById,
  deleteImportReceipt 
} from '../../../utils/importReceiptService.js';
import { getImportDetailsByImportReceiptId } from '../../../utils/importDetailService.js';
import DeleteImportReceiptModal from './DeleteImportReceiptModal.jsx';
import EditImportReceiptModal from './EditImportReceiptModal.jsx';

/**
 * Component danh sách phiếu nhập hàng
 * Tích hợp với ImportReceiptService và ImportDetailService
 * 
 * Features:
 * - Hiển thị tất cả phiếu nhập hàng
 * - Tìm kiếm theo ID phiếu nhập
 * - Xem chi tiết phiếu nhập
 * - Xóa phiếu nhập
 * - Xử lý lỗi và loading states
 * - Phân trang
 */
const ImportReceiptList = () => {
  const [importReceipts, setImportReceipts] = useState([]);
  const [allReceipts, setAllReceipts] = useState([]); // Lưu trữ tất cả phiếu nhập
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptDetails, setReceiptDetails] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [receiptToEdit, setReceiptToEdit] = useState(null);

  // Load tất cả phiếu nhập hàng
  const loadAllImportReceipts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllImportReceipts();
      
      if (result.success) {
        setAllReceipts(result.data);
        setImportReceipts(result.data);
        setCurrentPage(1); // Reset về trang đầu
      } else {
        setError(result.message);
        setAllReceipts([]);
        setImportReceipts([]);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải danh sách phiếu nhập');
      setAllReceipts([]);
      setImportReceipts([]);
      console.error('Lỗi loadAllImportReceipts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm phiếu nhập theo ID
  const searchReceiptById = async (id) => {
    if (!id || id.trim() === '') {
      // Nếu không có ID, hiển thị lại tất cả phiếu nhập
      setImportReceipts(allReceipts);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await getImportReceiptById(parseInt(id));
      
      if (result.success) {
        setImportReceipts([result.data]);
        setCurrentPage(1);
      } else {
        setError(result.message);
        setImportReceipts([]);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tìm kiếm phiếu nhập');
      setImportReceipts([]);
      console.error('Lỗi searchReceiptById:', err);
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết phiếu nhập
  const viewReceiptDetails = async (receipt) => {
    setLoading(true);
    setSelectedReceipt(receipt);
    setShowDetails(true);
    
    try {
      const result = await getImportDetailsByImportReceiptId(receipt.importReceiptId);
      
      if (result.success) {
        setReceiptDetails(result.data);
      } else {
        setError(result.message);
        setReceiptDetails([]);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải chi tiết phiếu nhập');
      setReceiptDetails([]);
      console.error('Lỗi viewReceiptDetails:', err);
    } finally {
      setLoading(false);
    }
  };

  // Xóa phiếu nhập
  const handleDeleteReceipt = async (importReceiptId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?')) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await deleteImportReceipt(importReceiptId);
      
      if (result.success) {
        // Reload danh sách sau khi xóa thành công
        loadAllImportReceipts();
        alert('Xóa phiếu nhập thành công');
      } else {
        setError(result.message);
        if (result.message.includes('không có quyền')) {
          alert('Bạn không có quyền xóa phiếu nhập hàng');
        }
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi xóa phiếu nhập');
      console.error('Lỗi handleDeleteReceipt:', err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm theo ID
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchReceiptById(searchId);
  };

  // Xử lý làm mới danh sách
  const handleRefresh = () => {
    setSearchId('');
    loadAllImportReceipts();
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = importReceipts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(importReceipts.length / itemsPerPage);

  // Load dữ liệu ban đầu
  useEffect(() => {
    loadAllImportReceipts();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  /**
   * Xử lý mở modal xóa
   */
  const handleDeleteClick = (receipt) => {
    setReceiptToDelete(receipt);
    setShowDeleteModal(true);
  };

  /**
   * Xử lý sau khi xóa thành công
   */
  const handleDeleteSuccess = () => {
    fetchImportReceipts(); // Refresh danh sách
    setShowDeleteModal(false);
    setReceiptToDelete(null);
  };

  /**
   * Xử lý đóng modal xóa
   */
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setReceiptToDelete(null);
  };

  /**
   * Xử lý mở modal chỉnh sửa
   */
  const handleEditClick = (receipt) => {
    setReceiptToEdit(receipt);
    setShowEditModal(true);
  };

  /**
   * Xử lý sau khi chỉnh sửa thành công
   */
  const handleEditSuccess = () => {
    loadAllImportReceipts(); // Refresh danh sách
    setShowEditModal(false);
    setReceiptToEdit(null);
  };

  /**
   * Xử lý đóng modal chỉnh sửa
   */
  const handleEditCancel = () => {
    setShowEditModal(false);
    setReceiptToEdit(null);
  };

  return (
    <div className="import-receipt-list p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách phiếu nhập hàng</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <label htmlFor="searchId" className="text-sm font-medium text-gray-700">
              Tìm theo ID:
            </label>
            <input
              type="number"
              id="searchId"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Nhập ID phiếu nhập"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              Tìm kiếm
            </button>
          </form>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 disabled:opacity-50"
          >
            🔄 Làm mới
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        )}
      </div>

      {/* Receipts table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Tổng số phiếu nhập: {importReceipts.length}
            </h3>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? currentItems.map((receipt) => (
                <tr key={receipt.importReceiptId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {receipt.importReceiptId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(receipt.createDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(receipt.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-3">
                      <button
                        onClick={() => viewReceiptDetails(receipt)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        title="Xem chi tiết"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditClick(receipt)}
                        className="text-green-600 hover:text-green-800 transition-colors duration-200"
                        title="Chỉnh sửa phiếu nhập"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(receipt)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        title="Xóa phiếu nhập"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    {searchId ? 'Không tìm thấy phiếu nhập với ID này' : 'Không có phiếu nhập nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, importReceipts.length)}</span> của{' '}
                    <span className="font-medium">{importReceipts.length}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
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
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Receipt Details Modal */}
      {showDetails && selectedReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chi tiết phiếu nhập #{selectedReceipt.importReceiptId}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Ngày tạo:</strong> {formatDate(selectedReceipt.createDate)}
                  </div>
                  <div>
                    <strong>Tổng tiền:</strong> {formatCurrency(selectedReceipt.totalAmount)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Chi tiết sản phẩm:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Giá nhập</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {receiptDetails.map((detail, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {detail.product?.productName || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {detail.quantityImport}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatCurrency(detail.importPrice)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatCurrency(detail.intoMoney)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteImportReceiptModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        receipt={receiptToDelete}
        onDeleted={handleDeleteSuccess}
      />

      {/* Edit Modal */}
      <EditImportReceiptModal
        isOpen={showEditModal}
        onClose={handleEditCancel}
        receipt={receiptToEdit}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default ImportReceiptList; 