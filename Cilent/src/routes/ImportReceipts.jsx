import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ImportReceiptForm from "../layouts/components/receipt/ImportReceiptForm";
import ImportList from "../layouts/components/receipt/ImportList";
import AddImportReceiptPopup from "../layouts/components/receipt/AddImportReceiptPopup";
import ViewImportPopup from "../layouts/components/receipt/ViewImportPopup";
import EditImportReceiptModal from "../layouts/components/receipt/EditImportReceiptModal";
import ErrorBoundary from "../layouts/components/ErrorBoundary";
import { ReceiptContext } from "../App";
import { getAllImportReceipts, getImportReceiptById } from "../utils/importReceiptService.js";
import { toast } from "react-toastify";

const ImportReceipts = () => {
  const [showForm, setShowForm] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptToEdit, setReceiptToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const { receipts, updateReceipts } = useContext(ReceiptContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const result = await getAllImportReceipts();
        if (result.success) {
          updateReceipts({ import: result.data });
        } else {
          console.error("Lỗi lấy phiếu nhập:", result.message);
          toast.error("Lỗi khi tải danh sách phiếu nhập!");
        }
      } catch (err) {
        console.error("Exception lấy phiếu nhập:", err);
        toast.error("Lỗi khi tải danh sách phiếu nhập!");
      }
    };
    fetchReceipts();
  }, [updateReceipts]);

  const handleAddReceipt = async (newReceipt) => {
    setShowForm(false);
    setShowAddPopup(false);
    
    // Refresh lại danh sách phiếu nhập
    try {
      const result = await getAllImportReceipts();
      if (result.success) {
        updateReceipts({ import: result.data });
        toast.success("Thêm phiếu nhập thành công!");
      } else {
        console.error("Lỗi refresh danh sách:", result.message);
      }
    } catch (err) {
      console.error("Exception refresh danh sách:", err);
    }
  };

  const handleShowReceiptDetails = async (receiptId) => {
    setLoading(true);
    try {
      const result = await getImportReceiptById(receiptId);
      if (result.success) {
        setSelectedReceipt(result.data);
        setShowViewPopup(true);
      } else {
        toast.error("Không thể tải thông tin phiếu nhập: " + result.message);
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết phiếu nhập:", err);
      toast.error("Lỗi khi tải chi tiết phiếu nhập!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReceipt = async (receiptId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?')) {
      return;
    }
    
    // TODO: Implement delete functionality
    toast.info("Chức năng xóa phiếu nhập đang được phát triển");
  };

  const handleRefresh = async () => {
    try {
      const result = await getAllImportReceipts();
      if (result.success) {
        updateReceipts({ import: result.data });
        toast.success("Làm mới danh sách thành công!");
      } else {
        toast.error("Lỗi khi làm mới danh sách!");
      }
    } catch (err) {
      toast.error("Lỗi khi làm mới danh sách!");
    }
  };

  const handleCloseViewPopup = () => {
    setShowViewPopup(false);
    setSelectedReceipt(null);
  };

  const handleEditReceipt = (receipt) => {
    setReceiptToEdit(receipt);
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setReceiptToEdit(null);
    
    // Refresh lại danh sách phiếu nhập
    try {
      const result = await getAllImportReceipts();
      if (result.success) {
        updateReceipts({ import: result.data });
        toast.success("Cập nhật phiếu nhập thành công!");
      } else {
        console.error("Lỗi refresh danh sách:", result.message);
      }
    } catch (err) {
      console.error("Exception refresh danh sách:", err);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setReceiptToEdit(null);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-yellow-400">QUẢN LÝ PHIẾU NHẬP</h2>
          <p className="text-sm text-gray-400">
            Quản lý toàn bộ phiếu nhập hàng trong hệ thống
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Tổng số phiếu nhập: {receipts.import?.length || 0}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddPopup(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            + Thêm Phiếu Nhập Mới
          </button>
        </div>
      </div>
      
      {showForm && (
        <ImportReceiptForm
          onCancel={() => setShowForm(false)}
          onSuccess={handleAddReceipt}
        />
      )}
      
      {/* Popup Thêm Phiếu Nhập */}
      {showAddPopup && (
        <ErrorBoundary>
          <AddImportReceiptPopup
            onClose={() => setShowAddPopup(false)}
            onAdded={handleAddReceipt}
          />
        </ErrorBoundary>
      )}
      
      {/* Popup Xem Chi Tiết Phiếu Nhập */}
      {showViewPopup && selectedReceipt && (
        <ErrorBoundary>
          <ViewImportPopup
            importReceipt={selectedReceipt}
            onClose={handleCloseViewPopup}
          />
        </ErrorBoundary>
      )}

      {/* Modal Chỉnh Sửa Phiếu Nhập */}
      {showEditModal && receiptToEdit && (
        <ErrorBoundary>
          <EditImportReceiptModal
            isOpen={showEditModal}
            onClose={handleEditCancel}
            receipt={receiptToEdit}
            onSuccess={handleEditSuccess}
          />
        </ErrorBoundary>
      )}
      
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-400">Đang tải...</span>
        </div>
      )}
      
      <ImportList
        receipts={receipts.import}
        onShowDetailView={handleShowReceiptDetails}
        onDelete={handleDeleteReceipt}
        onEdit={handleEditReceipt}
      />
    </div>
  );
};

export default ImportReceipts;