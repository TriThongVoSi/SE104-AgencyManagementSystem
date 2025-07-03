import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ExportReceiptForm from '../layouts/components/receipt/ExportReceiptForm';
import ExportList from '../layouts/components/receipt/ExportList';
import ExportDetailForm from '../layouts/components/receipt/ExportDetailForm';
import AddExportReceiptPopup from '../layouts/components/receipt/AddExportReceiptPopup';
import EditExportReceiptModal from '../layouts/components/receipt/EditExportReceiptModal';
import ViewExportPopup from '../layouts/components/receipt/ViewExportPopup';
import { ReceiptContext } from '../App';
import exportReceiptService from '../utils/exportReceiptService';
import { toast } from 'react-toastify';

const ExportReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const navigate = useNavigate();
  const { updateReceipts } = useContext(ReceiptContext);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const receipts = await exportReceiptService.getAllExportReceipts();
        setReceipts(receipts);
        updateReceipts({ export: receipts });
      } catch (err) {
        toast.error('Lỗi khi tải danh sách phiếu xuất: ' + err.message);
        console.error('Error loading receipts:', err);
      }
    };
    fetchReceipts();
  }, [updateReceipts]);

  const handleAddReceipt = () => {
    setShowForm(false);
    const fetchReceipts = async () => {
      try {
        const receipts = await exportReceiptService.getAllExportReceipts();
        setReceipts(receipts);
        updateReceipts({ export: receipts });
      } catch (err) {
        toast.error('Lỗi khi tải danh sách phiếu xuất: ' + err.message);
      }
    };
    fetchReceipts();
  };

  const handleAddDetail = () => {
    setShowDetailForm(false);
    const fetchReceipts = async () => {
      try {
        const receipts = await exportReceiptService.getAllExportReceipts();
        setReceipts(receipts);
        updateReceipts({ export: receipts });
      } catch (err) {
        toast.error('Lỗi khi tải danh sách phiếu xuất: ' + err.message);
      }
    };
    fetchReceipts();
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowAddPopup(false);
    setShowEditModal(false);
    setShowDetailForm(false);
    setShowViewPopup(false);
    setSelectedReceiptId(null);
    setSelectedReceipt(null);
  };

  // Handle edit receipt
  const handleEditReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setSelectedReceipt(null);
    // Reload receipts
    try {
      const receipts = await exportReceiptService.getAllExportReceipts();
      setReceipts(receipts);
      updateReceipts({ export: receipts });
      toast.success('Cập nhật phiếu xuất thành công!');
    } catch (err) {
      toast.error('Lỗi khi tải lại danh sách phiếu xuất: ' + err.message);
    }
  };

  const handleDelete = async (receiptId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu xuất này?')) {
      try {
        await exportReceiptService.deleteExportReceipt(receiptId);
        const updatedReceipts = receipts.filter(r => r.exportReceiptID !== receiptId);
        setReceipts(updatedReceipts);
        updateReceipts({ export: updatedReceipts });
        toast.success('Xóa phiếu xuất thành công!');
      } catch (err) {
        toast.error('Lỗi khi xóa phiếu xuất: ' + err.message);
      }
    }
  };

  const handleShowDetailForm = (receiptId) => {
    setSelectedReceiptId(receiptId);
    setShowDetailForm(true);
  };

  const handleShowReceiptDetails = (receiptId, receipt) => {
    console.log('🔍 Viewing export receipt:', receiptId, receipt);
    try {
      // Find the receipt by ID if not provided
      const receiptToShow = receipt || receipts.find(r => 
        (r.exportReceiptID === receiptId || r.exportReceiptId === receiptId)
      );
      
      if (receiptToShow) {
        setSelectedReceipt(receiptToShow);
        setShowViewPopup(true);
      } else {
        console.error('Receipt not found:', receiptId);
        toast.error('Không tìm thấy phiếu xuất');
      }
    } catch (error) {
      console.error('Error opening view popup:', error);
      toast.error('Không thể hiển thị chi tiết phiếu xuất');
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-yellow-400">QUẢN LÝ PHIẾU XUẤT</h2>
          <p className="text-sm text-gray-400">Quản lý danh sách phiếu xuất và thông tin chi tiết</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddPopup(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            + Thêm Phiếu Xuất Mới
          </button>
        </div>
      </div>
      {showForm && <ExportReceiptForm onCancel={handleCancel} onSuccess={handleAddReceipt} />}
      {showAddPopup && (
        <AddExportReceiptPopup
          onClose={handleCancel}
          onAdded={handleAddReceipt}
        />
      )}
      {showDetailForm && selectedReceiptId && (
        <ExportDetailForm
          receiptId={selectedReceiptId}
          receipt={receipts.find(r => r.exportReceiptID === selectedReceiptId)}
          onClose={handleCancel}
          onAddDetail={handleAddDetail}
        />
      )}
      <ExportList
        receipts={receipts}
        onDelete={handleDelete}
        onEdit={handleEditReceipt}
        onShowDetailAdd={handleShowDetailForm}
        onShowDetailView={handleShowReceiptDetails}
      />
      
      {/* View Export Popup */}
      {showViewPopup && selectedReceipt && (
        <ViewExportPopup
          exportReceipt={selectedReceipt}
          onClose={() => {
            console.log('🔒 Closing view popup');
            setShowViewPopup(false);
            setSelectedReceipt(null);
          }}
        />
      )}

      {/* Edit Export Modal */}
      {showEditModal && selectedReceipt && (
        <EditExportReceiptModal
          isOpen={showEditModal}
          onClose={handleCancel}
          receipt={selectedReceipt}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default ExportReceipts;