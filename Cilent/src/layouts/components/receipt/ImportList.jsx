import React, { useState } from "react";
import { FaEye, FaTrash, FaEdit } from "react-icons/fa";

const ImportList = ({ receipts, onDelete, onShowDetailView, onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = receipts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(receipts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800 text-gray-300">
            <th className="py-3 px-4">Số phiếu</th>
            <th className="py-3 px-4">Ngày lập</th>
            <th className="py-3 px-4">Tổng tiền</th>
            <th className="py-3 px-4">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((receipt) => {
            // Hỗ trợ cả API cũ và API mới
            const receiptId = receipt.importReceiptID || receipt.importReceiptId;
            const receiptDate = receipt.dateReceipt || receipt.createDate;
            const totalAmount = receipt.totalPrice || receipt.totalAmount || 0;
            
            return (
              <tr
                key={receiptId}
                className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200"
              >
                <td className="py-3 px-4 text-gray-200">#{receiptId}</td>
                <td className="py-3 px-4 text-gray-200">{new Date(receiptDate).toLocaleDateString('vi-VN')}</td>
                <td className="py-3 px-4 text-gray-200">{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onShowDetailView(receiptId)}
                      className="text-green-400 hover:text-green-300 transition-colors duration-200"
                      title="Xem chi tiết"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(receipt)}
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        title="Chỉnh sửa phiếu nhập"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(receiptId)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      title="Xóa phiếu nhập"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {receipts.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p>Chưa có phiếu nhập hàng nào</p>
        </div>
      )}
      
      {receipts.length > itemsPerPage && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
              currentPage === 1
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Trang trước
          </button>
          <span className="text-gray-400 text-sm">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
              currentPage === totalPages
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportList;