import React, { useState, useEffect } from 'react';
import { 
  getAllImportReceipts,
  getImportReceiptById,
  createImportReceipt,
  updateImportReceipt,
  updateImportReceiptQuantity,
  formatCreateImportReceiptRequest
} from '../../../utils/importReceiptService.js';
import { getAllProducts } from '../../../utils/productService.jsx';
import DeleteImportReceiptModal from './DeleteImportReceiptModal.jsx';
import EditImportReceiptModal from './EditImportReceiptModal.jsx';

/**
 * Import Receipt Management Component
 * Quản lý phiếu nhập hàng với đầy đủ chức năng CRUD
 */
const ImportReceiptManagement = () => {
  // States
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [receiptToEdit, setReceiptToEdit] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    productID: '',
    quantityImport: '',
    createDate: new Date().toISOString().split('T')[0]
  });

  const [updateForm, setUpdateForm] = useState({
    importReceiptId: '',
    quantityImport: ''
  });

  // Load data on mount
  useEffect(() => {
    fetchAllReceipts();
    fetchProducts();
  }, []);

  /**
   * Lấy tất cả phiếu nhập hàng
   */
  const fetchAllReceipts = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAllImportReceipts();
      if (result.success) {
        setReceipts(result.data);
      } else {
        setError(result.message);
        setReceipts([]);
      }
    } catch (err) {
      setError('Lỗi kết nối server');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lấy danh sách sản phẩm cho dropdown
   */
  const fetchProducts = async () => {
    try {
      const result = await getAllProducts();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách sản phẩm:', err);
    }
  };

  /**
   * Xem chi tiết phiếu nhập
   */
  const handleViewDetails = async (id) => {
    setLoading(true);
    try {
      const result = await getImportReceiptById(id);
      if (result.success) {
        setSelectedReceipt(result.data);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Lỗi lấy chi tiết phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tạo phiếu nhập mới
   */
  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!createForm.productID || !createForm.quantityImport) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (createForm.quantityImport <= 0) {
      alert('Số lượng nhập phải lớn hơn 0');
      return;
    }

    setLoading(true);
    try {
      const request = formatCreateImportReceiptRequest({
        productId: parseInt(createForm.productID),
        quantity: parseInt(createForm.quantityImport),
        date: createForm.createDate
      });

      const result = await createImportReceipt(request);
      if (result.success) {
        alert('Tạo phiếu nhập thành công!');
        setShowCreateForm(false);
        setCreateForm({
          productID: '',
          quantityImport: '',
          createDate: new Date().toISOString().split('T')[0]
        });
        fetchAllReceipts(); // Refresh list
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (err) {
      alert('Lỗi tạo phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật số lượng phiếu nhập
   */
  const handleUpdateQuantity = async (e) => {
    e.preventDefault();
    
    if (!updateForm.importReceiptId || !updateForm.quantityImport) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (updateForm.quantityImport <= 0) {
      alert('Số lượng nhập phải lớn hơn 0');
      return;
    }

    setLoading(true);
    try {
      const request = {
        importReceiptId: parseInt(updateForm.importReceiptId),
        quantityImport: parseInt(updateForm.quantityImport)
      };

      const result = await updateImportReceiptQuantity(request);
      if (result.success) {
        alert('Cập nhật số lượng thành công!');
        setShowUpdateForm(false);
        setUpdateForm({ importReceiptId: '', quantityImport: '' });
        fetchAllReceipts(); // Refresh list
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (err) {
      alert('Lỗi cập nhật số lượng');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format tiền tệ
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  /**
   * Format ngày
   */
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
    fetchAllReceipts(); // Refresh danh sách
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
    fetchAllReceipts(); // Refresh danh sách
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Quản Lý Phiếu Nhập Hàng
          </h1>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={loading}
            >
              ➕ Tạo Phiếu Nhập
            </button>
            
            <button
              onClick={() => setShowUpdateForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={loading}
            >
              ✏️ Cập Nhật Số Lượng
            </button>
            
            <button
              onClick={fetchAllReceipts}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={loading}
            >
              🔄 Làm Mới
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ❌ {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        )}

        {/* Receipts table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Danh Sách Phiếu Nhập ({receipts.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng Tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <tr key={receipt.importReceiptId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{receipt.importReceiptId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(receipt.createDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(receipt.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewDetails(receipt.importReceiptId)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 flex items-center gap-1"
                          disabled={loading}
                        >
                          👁️ Xem Chi Tiết
                        </button>
                        <button
                          onClick={() => handleEditClick(receipt)}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200 flex items-center gap-1"
                          disabled={loading}
                        >
                          ✏️ Chỉnh Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(receipt)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center gap-1"
                          disabled={loading}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {receipts.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                📝 Chưa có phiếu nhập hàng nào
              </div>
            )}
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Tạo Phiếu Nhập Mới</h3>
              
              <form onSubmit={handleCreateReceipt}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sản Phẩm
                  </label>
                  <select
                    value={createForm.productID}
                    onChange={(e) => setCreateForm({...createForm, productID: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.productName} (Giá: {formatCurrency(product.importPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Lượng Nhập
                  </label>
                  <input
                    type="number"
                    value={createForm.quantityImport}
                    onChange={(e) => setCreateForm({...createForm, quantityImport: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min="1"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày Tạo
                  </label>
                  <input
                    type="date"
                    value={createForm.createDate}
                    onChange={(e) => setCreateForm({...createForm, createDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Đang tạo...' : 'Tạo Phiếu Nhập'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Update Form Modal */}
        {showUpdateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Cập Nhật Số Lượng</h3>
              
              <form onSubmit={handleUpdateQuantity}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phiếu Nhập
                  </label>
                  <select
                    value={updateForm.importReceiptId}
                    onChange={(e) => setUpdateForm({...updateForm, importReceiptId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Chọn phiếu nhập</option>
                    {receipts.map((receipt) => (
                      <option key={receipt.importReceiptId} value={receipt.importReceiptId}>
                        #{receipt.importReceiptId} - {formatDate(receipt.createDate)} - {formatCurrency(receipt.totalAmount)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Lượng Mới
                  </label>
                  <input
                    type="number"
                    value={updateForm.quantityImport}
                    onChange={(e) => setUpdateForm({...updateForm, quantityImport: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min="1"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập Nhật'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpdateForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail View Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Chi Tiết Phiếu Nhập #{selectedReceipt.importReceiptId}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <strong>ID:</strong> #{selectedReceipt.importReceiptId}
                </div>
                <div>
                  <strong>Ngày tạo:</strong> {formatDate(selectedReceipt.createDate)}
                </div>
                <div>
                  <strong>Tổng tiền:</strong> {formatCurrency(selectedReceipt.totalAmount)}
                </div>
              </div>

              {selectedReceipt.importDetails && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Chi tiết nhập hàng:</h4>
                  <div className="space-y-2">
                    {selectedReceipt.importDetails.map((detail, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div><strong>Sản phẩm:</strong> {detail.product?.productName}</div>
                        <div><strong>Số lượng:</strong> {detail.quantityImport}</div>
                        <div><strong>Giá nhập:</strong> {formatCurrency(detail.importPrice)}</div>
                        <div><strong>Thành tiền:</strong> {formatCurrency(detail.intoMoney)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Đóng
              </button>
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
    </div>
  );
};

export default ImportReceiptManagement; 