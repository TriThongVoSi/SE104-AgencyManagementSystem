import React, { useState, useEffect } from 'react';
import { 
	FiX, 
	FiPackage, 
	FiCalendar, 
	FiUser, 
	FiMapPin, 
	FiPhone, 
	FiMail,
	FiDollarSign,
	FiFileText,
	FiTruck,
	FiEye
} from 'react-icons/fi';
import exportReceiptService from '../../../utils/exportReceiptService';

/**
 * Modal component để xem chi tiết phiếu xuất hàng
 * 
 * Features:
 * - Hiển thị thông tin phiếu xuất đầy đủ
 * - Thông tin đại lý chi tiết
 * - Danh sách sản phẩm xuất
 * - Tính toán tổng tiền, còn lại
 * - Giao diện đẹp với icons
 */
const ViewExportReceiptModal = ({ isOpen, onClose, receipt }) => {
	const [loading, setLoading] = useState(false);
	const [receiptDetails, setReceiptDetails] = useState(null);
	const [error, setError] = useState('');

	// Load chi tiết phiếu xuất khi modal mở
	useEffect(() => {
		if (isOpen && receipt?.exportReceiptId) {
			loadReceiptDetails();
		}
	}, [isOpen, receipt]);

	const loadReceiptDetails = async () => {
		setLoading(true);
		setError('');
		try {
			const details = await exportReceiptService.getExportReceiptById(receipt.exportReceiptId);
			setReceiptDetails(details);
		} catch (err) {
			console.error('Error loading receipt details:', err);
			setError('Không thể tải chi tiết phiếu xuất hàng');
		} finally {
			setLoading(false);
		}
	};

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
		const date = new Date(dateString);
		return date.toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	};

	if (!isOpen) return null;

	const displayReceipt = receiptDetails || receipt;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
			<div className="bg-white text-gray-800 p-6 rounded-2xl w-[900px] shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-6 border-b pb-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-100 rounded-lg">
							<FiEye className="text-blue-600 text-xl" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-800">Chi Tiết Phiếu Xuất</h2>
							<p className="text-gray-600">Mã phiếu: #{displayReceipt?.exportReceiptId || 'N/A'}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
					>
						<FiX className="text-gray-500 hover:text-gray-700 text-xl" />
					</button>
				</div>

				{/* Loading */}
				{loading && (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<span className="ml-3 text-gray-600">Đang tải chi tiết...</span>
					</div>
				)}

				{/* Error */}
				{error && (
					<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
						{error}
					</div>
				)}

				{/* Content */}
				{!loading && !error && (
					<div className="space-y-6">
						{/* Thông tin phiếu xuất */}
						<div className="bg-blue-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
								<FiFileText className="text-blue-600" />
								Thông tin phiếu xuất
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="flex items-center gap-2">
									<FiCalendar className="text-gray-500" />
									<div>
										<span className="text-gray-600 text-sm">Ngày xuất:</span>
										<div className="font-medium">{formatDate(displayReceipt?.createDate)}</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<FiDollarSign className="text-green-500" />
									<div>
										<span className="text-gray-600 text-sm">Tổng tiền:</span>
										<div className="font-medium text-green-600">{formatCurrency(displayReceipt?.totalAmount)}</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<FiDollarSign className="text-blue-500" />
									<div>
										<span className="text-gray-600 text-sm">Đã trả:</span>
										<div className="font-medium text-blue-600">{formatCurrency(displayReceipt?.paidAmount)}</div>
									</div>
								</div>
							</div>
							<div className="mt-4 pt-4 border-t border-blue-200">
								<div className="flex items-center gap-2">
									<FiDollarSign className="text-red-500" />
									<div>
										<span className="text-gray-600 text-sm">Còn lại:</span>
										<div className="font-medium text-red-600">{formatCurrency(displayReceipt?.remainingAmount)}</div>
									</div>
								</div>
							</div>
						</div>

						{/* Thông tin đại lý */}
						{displayReceipt?.agent && (
							<div className="bg-green-50 p-4 rounded-lg">
								<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
									<FiUser className="text-green-600" />
									Thông tin đại lý
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<FiUser className="text-gray-500" />
											<div>
												<span className="text-gray-600 text-sm">Tên đại lý:</span>
												<div className="font-medium">{displayReceipt.agent.agentName || 'N/A'}</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<FiPhone className="text-gray-500" />
											<div>
												<span className="text-gray-600 text-sm">Điện thoại:</span>
												<div className="font-medium">{displayReceipt.agent.phone || 'N/A'}</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<FiMail className="text-gray-500" />
											<div>
												<span className="text-gray-600 text-sm">Email:</span>
												<div className="font-medium">{displayReceipt.agent.email || 'N/A'}</div>
											</div>
										</div>
									</div>
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<FiMapPin className="text-gray-500" />
											<div>
												<span className="text-gray-600 text-sm">Địa chỉ:</span>
												<div className="font-medium">{displayReceipt.agent.address || 'N/A'}</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<FiMapPin className="text-gray-500" />
											<div>
												<span className="text-gray-600 text-sm">Quận:</span>
												<div className="font-medium">{displayReceipt.agent.district?.districtName || 'N/A'}</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<FiDollarSign className="text-red-500" />
											<div>
												<span className="text-gray-600 text-sm">Công nợ hiện tại:</span>
												<div className="font-medium text-red-600">{formatCurrency(displayReceipt.agent.debtMoney)}</div>
											</div>
										</div>
									</div>
								</div>

								{/* Thông tin loại đại lý */}
								{displayReceipt.agent.agentType && (
									<div className="mt-4 pt-4 border-t border-green-200">
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="flex items-center gap-2">
												<FiTruck className="text-gray-500" />
												<div>
													<span className="text-gray-600 text-sm">Loại đại lý:</span>
													<div className="font-medium">{displayReceipt.agent.agentType.agentTypeName || 'N/A'}</div>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<FiDollarSign className="text-gray-500" />
												<div>
													<span className="text-gray-600 text-sm">Nợ tối đa:</span>
													<div className="font-medium">{formatCurrency(displayReceipt.agent.agentType.maximumDebt)}</div>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<FiCalendar className="text-gray-500" />
												<div>
													<span className="text-gray-600 text-sm">Ngày tiếp nhận:</span>
													<div className="font-medium">{formatDate(displayReceipt.agent.receptionDate)}</div>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Danh sách sản phẩm xuất - Placeholder */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
								<FiPackage className="text-gray-600" />
								Danh sách sản phẩm xuất
							</h3>
							
							{/* Note: Backend response chỉ có tổng tiền chứ không có chi tiết sản phẩm */}
							<div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
								<FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
								<p className="text-gray-500">
									Chi tiết sản phẩm sẽ được hiển thị khi backend hỗ trợ API lấy export details
								</p>
								<p className="text-gray-400 text-sm mt-2">
									Hiện tại chỉ hiển thị thông tin tổng hợp từ phiếu xuất
								</p>
							</div>
						</div>

						{/* Tóm tắt tài chính */}
						<div className="bg-purple-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
								<FiDollarSign className="text-purple-600" />
								Tóm tắt tài chính
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<div className="text-center p-3 bg-white rounded-lg shadow-sm">
									<div className="text-2xl font-bold text-green-600">{formatCurrency(displayReceipt?.totalAmount)}</div>
									<div className="text-gray-600 text-sm">Tổng tiền hàng</div>
								</div>
								<div className="text-center p-3 bg-white rounded-lg shadow-sm">
									<div className="text-2xl font-bold text-blue-600">{formatCurrency(displayReceipt?.paidAmount)}</div>
									<div className="text-gray-600 text-sm">Đã thanh toán</div>
								</div>
								<div className="text-center p-3 bg-white rounded-lg shadow-sm">
									<div className="text-2xl font-bold text-red-600">{formatCurrency(displayReceipt?.remainingAmount)}</div>
									<div className="text-gray-600 text-sm">Còn lại</div>
								</div>
								<div className="text-center p-3 bg-white rounded-lg shadow-sm">
									<div className="text-2xl font-bold text-purple-600">
										{displayReceipt?.totalAmount > 0 ? 
											`${Math.round((displayReceipt?.paidAmount / displayReceipt?.totalAmount) * 100)}%` : 
											'0%'
										}
									</div>
									<div className="text-gray-600 text-sm">Đã thanh toán</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Footer */}
				<div className="flex justify-end mt-8 pt-6 border-t">
					<button
						onClick={onClose}
						className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300"
					>
						Đóng
					</button>
				</div>
			</div>
		</div>
	);
};

export default ViewExportReceiptModal; 