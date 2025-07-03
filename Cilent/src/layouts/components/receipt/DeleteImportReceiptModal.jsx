import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
	FiX,
	FiAlertTriangle,
	FiTrash2,
	FiPackage,
	FiCalendar,
	FiDollarSign
} from 'react-icons/fi';
import { deleteImportReceipt } from '../../../utils/importReceiptService.js';

const DeleteImportReceiptModal = ({ isOpen, onClose, receipt, onDeleted }) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState('');

	if (!isOpen || !receipt) return null;

	// Format currency
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(amount || 0);
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('vi-VN', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});
		} catch {
			return 'N/A';
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		setError('');

		try {
			console.log('🗑️ Deleting import receipt with ID:', receipt.importReceiptId);
			
			const result = await deleteImportReceipt(receipt.importReceiptId);

			if (result.success) {
				toast.success(result.message || 'Xóa phiếu nhập hàng thành công!');
				onDeleted(); // Refresh the list
				onClose(); // Close modal
			} else {
				setError(result.message || 'Có lỗi khi xóa phiếu nhập hàng');
				toast.error(result.message || 'Có lỗi khi xóa phiếu nhập hàng');
			}
		} catch (err) {
			console.error('❌ Delete Error:', err);
			const errorMessage = err.message || 'Lỗi kết nối khi xóa phiếu nhập hàng';
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		if (!isDeleting) {
			setError('');
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
			<div className="bg-white text-gray-800 p-6 rounded-2xl w-[500px] shadow-2xl transform transition-all duration-300 scale-100">
				{/* Header */}
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
						<FiAlertTriangle className="text-red-600" />
						Xác nhận xóa phiếu nhập
					</h2>
					<button
						onClick={handleClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
						disabled={isDeleting}
					>
						<FiX className="text-gray-500 hover:text-gray-700 text-xl" />
					</button>
				</div>

				{/* Warning Message */}
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex items-start gap-3">
						<FiAlertTriangle className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
						<div>
							<h3 className="font-semibold text-red-800 mb-2">Cảnh báo quan trọng!</h3>
							<ul className="text-red-700 text-sm space-y-1">
								<li>• Việc xóa phiếu nhập sẽ giảm số lượng tồn kho của các sản phẩm</li>
								<li>• Hành động này không thể hoàn tác</li>
								<li>• Nếu tồn kho không đủ để trừ, việc xóa sẽ bị từ chối</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Receipt Information */}
				<div className="mb-6 p-4 bg-gray-50 rounded-lg">
					<h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
						<FiPackage className="text-blue-600" />
						Thông tin phiếu nhập
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Số phiếu:</span>
							<span className="font-medium">#{receipt.importReceiptId}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-600 flex items-center gap-1">
								<FiCalendar className="text-sm" />
								Ngày tạo:
							</span>
							<span className="font-medium">{formatDate(receipt.createDate)}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-600 flex items-center gap-1">
								<FiDollarSign className="text-sm" />
								Tổng tiền:
							</span>
							<span className="font-bold text-green-600">{formatCurrency(receipt.totalAmount)}</span>
						</div>
					</div>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-2">
						<FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
						<span className="text-sm">{error}</span>
					</div>
				)}

				{/* Confirmation Text */}
				<div className="mb-6 text-center">
					<p className="text-gray-700 font-medium">
						Bạn có chắc chắn muốn xóa phiếu nhập này không?
					</p>
					<p className="text-sm text-gray-500 mt-1">
						Nhập <strong>"XÓA"</strong> để xác nhận
					</p>
				</div>

				{/* Confirmation Input */}
				<div className="mb-6">
					<input
						type="text"
						placeholder='Nhập "XÓA" để xác nhận'
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
						disabled={isDeleting}
						id="confirmationInput"
					/>
				</div>

				{/* Buttons */}
				<div className="flex justify-end space-x-3">
					<button
						onClick={handleClose}
						disabled={isDeleting}
						className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300 disabled:opacity-50"
					>
						Hủy
					</button>
					<button
						onClick={() => {
							const input = document.getElementById('confirmationInput');
							if (input.value.toUpperCase() === 'XÓA') {
								handleDelete();
							} else {
								toast.error('Vui lòng nhập "XÓA" để xác nhận');
								input.focus();
							}
						}}
						disabled={isDeleting}
						className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
					>
						{isDeleting && (
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
						)}
						<FiTrash2 />
						{isDeleting ? 'Đang xóa...' : 'Xóa phiếu nhập'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteImportReceiptModal; 