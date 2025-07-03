import React, { useState, useEffect } from 'react';
import {
	FiX,
	FiPackage,
	FiShoppingCart,
	FiDollarSign,
	FiHash,
	FiTrendingUp,
	FiEye,
	FiCalendar,
	FiUser,
	FiLoader,
	FiMapPin,
	FiLayers,
} from 'react-icons/fi';
import exportDetailService from '../../../utils/exportDetailService';

const ViewExportPopup = ({ exportReceipt, onClose }) => {
	const [exportDetails, setExportDetails] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (exportReceipt?.exportReceiptId || exportReceipt?.exportReceiptID) {
			console.log('🚀 ViewExportPopup mounted with receipt:', exportReceipt);
			fetchExportDetails();
		}
	}, [exportReceipt]);

	// Handle ESC key to close popup
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [onClose]);

	const fetchExportDetails = async () => {
		setLoading(true);
		setError(null);
		try {
			const receiptId = exportReceipt.exportReceiptId || exportReceipt.exportReceiptID;
			console.log('📡 Fetching export details for receipt ID:', receiptId);
			const result = await exportDetailService.getExportDetailsByReceiptId(receiptId);
			console.log('✅ Export details fetched:', result);
			
			// Handle both wrapped (with success) and direct array response
			let details = [];
			if (result && typeof result === 'object') {
				if (result.success !== undefined) {
					// Wrapped response
					if (result.success) {
						details = result.data || [];
					} else {
						console.log('❌ Failed to fetch details:', result.message);
						setError(result.message || 'Không thể tải chi tiết phiếu xuất');
						setExportDetails([]);
						return;
					}
				} else if (Array.isArray(result)) {
					// Direct array response
					details = result;
				} else if (result.data && Array.isArray(result.data)) {
					// Response with data field
					details = result.data;
				}
			}
			
			console.log('🔍 Export details data:', details);
			console.log('🔢 Number of details:', details.length);
			if (details.length > 0) {
				console.log('📋 First detail structure:', details[0]);
			}
			setExportDetails(details);
		} catch (error) {
			console.error('❌ Error fetching export details:', error);
			setError(`Lỗi kết nối API: ${error.message}`);
			setExportDetails([]);
		} finally {
			setLoading(false);
		}
	};

	if (!exportReceipt) return null;

	const InfoRow = ({ icon: Icon, label, value, colorClass = "blue" }) => (
		<div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
			<div className={`p-2 bg-${colorClass}-100 rounded-full mt-1`}>
				<Icon className={`text-${colorClass}-600 text-sm`} />
			</div>
			<div className="flex-1">
				<p className="text-sm font-medium text-gray-600 mb-1">
					{label}
				</p>
				<p className="text-gray-900 font-medium">
					{value || 'Chưa có thông tin'}
				</p>
			</div>
		</div>
	);

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(amount || 0);
	};

	const calculateTotalMoney = () => {
		return exportDetails.reduce((total, detail) => {
			const intoMoney = detail.intoMoney || (detail.quantityExport * (detail.exportPrice || detail.product?.exportPrice));
			return total + (intoMoney || 0);
		}, 0);
	};

	const calculateTotalQuantity = () => {
		return exportDetails.reduce((total, detail) => total + (detail.quantityExport || 0), 0);
	};

	return (
		<div 
			className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm"
			onClick={(e) => {
				// Only close if clicking on the backdrop, not the modal content
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div 
				className="bg-white text-gray-800 p-8 rounded-2xl w-[900px] shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
					<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
						<div className="p-2 bg-blue-100 rounded-full">
							<FiEye className="text-blue-600 text-xl" />
						</div>
						Chi Tiết Phiếu Xuất Hàng
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
					>
						<FiX className="text-gray-500 hover:text-gray-700 text-xl" />
					</button>
				</div>

				{/* Export Receipt Info */}
				<div className="space-y-2 mb-6">
					<InfoRow
						icon={FiHash}
						label="Mã phiếu xuất"
						value={`PX-${exportReceipt.exportReceiptId || exportReceipt.exportReceiptID}`}
						colorClass="blue"
					/>

					<InfoRow
						icon={FiCalendar}
						label="Ngày lập phiếu"
						value={new Date(exportReceipt.createDate).toLocaleDateString('vi-VN')}
						colorClass="green"
					/>

					<InfoRow
						icon={FiUser}
						label="Đại lý cung cấp"
						value={exportReceipt.agent?.agentName}
						colorClass="purple"
					/>

					<InfoRow
						icon={FiMapPin}
						label="Địa chỉ đại lý"
						value={exportReceipt.agent?.address}
						colorClass="orange"
					/>

					<InfoRow
						icon={FiLayers}
						label="Loại đại lý"
						value={exportReceipt.agent?.agentType?.agentTypeName}
						colorClass="indigo"
					/>

					<InfoRow
						icon={FiDollarSign}
						label="Tổng tiền"
						value={formatCurrency(exportReceipt.totalAmount)}
						colorClass="green"
					/>

					<InfoRow
						icon={FiDollarSign}
						label="Số tiền đã trả"
						value={formatCurrency(exportReceipt.paidAmount)}
						colorClass="blue"
					/>

					<InfoRow
						icon={FiDollarSign}
						label="Số tiền còn lại"
						value={formatCurrency(exportReceipt.remainingAmount)}
						colorClass="red"
					/>
				</div>

				{/* Export Details Section */}
				<div className="border-t border-gray-200 pt-6">
					<div className="flex items-center gap-2 mb-4">
						<div className="p-1.5 bg-orange-100 rounded-full">
							<FiTrendingUp className="text-orange-600" />
						</div>
						<h3 className="text-lg font-semibold text-gray-800">
							Danh Sách Hàng Hóa Xuất
						</h3>
						{/* Debug Panel - Tạm thời để debug */}
						
					</div>

					{loading ? (
						<div className="flex items-center justify-center py-8">
							<FiLoader className="animate-spin text-blue-600 text-2xl mr-2" />
							<span className="text-gray-600">Đang tải chi tiết hàng hóa...</span>
						</div>
					) : error ? (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
							<p className="text-red-600 mb-2">{error}</p>
							<button
								onClick={fetchExportDetails}
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
							>
								Thử lại
							</button>
						</div>
					) : exportDetails.length > 0 ? (
						<>
							{/* Table */}
							<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												STT
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Tên sản phẩm
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Đơn vị
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Số lượng xuất
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Đơn giá xuất
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Thành tiền
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{exportDetails.map((detail, index) => (
											<tr key={detail.exportDetailId || index} className="hover:bg-gray-50">
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{index + 1}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center">
														<div className="flex-shrink-0 h-8 w-8">
															<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
																<FiPackage className="text-blue-600 text-sm" />
															</div>
														</div>
														<div className="ml-3">
															<div className="text-sm font-medium text-gray-900">
																{detail.product?.productName || detail.productName || `Sản phẩm ID: ${detail.productID || detail.productId || 'N/A'}`}
															</div>
															{detail.product?.productCode && (
																<div className="text-xs text-gray-500">
																	Mã: {detail.product.productCode}
																</div>
															)}
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{detail.product?.unit?.unitName || detail.unitName || 'N/A'}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
														{detail.quantityExport?.toLocaleString('vi-VN')}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													<span className="text-green-600 font-medium">
														{formatCurrency(detail.exportPrice || detail.product?.exportPrice)}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													<span className="text-red-600 font-bold">
														{formatCurrency(detail.intoMoney || (detail.quantityExport * (detail.exportPrice || detail.product?.exportPrice)))}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Summary Statistics */}
							<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
									<div className="flex items-center gap-2">
										<FiLayers className="text-blue-600" />
										<span className="font-semibold text-gray-800">Tổng mặt hàng:</span>
									</div>
									<span className="text-xl font-bold text-blue-600">
										{exportDetails.length}
									</span>
								</div>

								<div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
									<div className="flex items-center gap-2">
										<FiShoppingCart className="text-purple-600" />
										<span className="font-semibold text-gray-800">Tổng số lượng:</span>
									</div>
									<span className="text-xl font-bold text-purple-600">
										{calculateTotalQuantity().toLocaleString('vi-VN')}
									</span>
								</div>

								<div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
									<div className="flex items-center gap-2">
										<FiDollarSign className="text-green-600" />
										<span className="font-semibold text-gray-800">Tổng tiền:</span>
									</div>
									<span className="text-xl font-bold text-green-600">
										{formatCurrency(calculateTotalMoney())}
									</span>
								</div>
							</div>
						</>
					) : (
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
							<FiPackage className="text-gray-400 text-4xl mx-auto mb-2" />
							<p className="text-gray-600 font-medium">
								Không có chi tiết hàng xuất trong phiếu này
							</p>
							<p className="text-gray-500 text-sm mt-1">
								Phiếu xuất có thể chưa được thêm hàng hóa
							</p>
						</div>
					)}
				</div>

				{/* Close Button */}
				<div className="flex justify-center mt-8 pt-4 border-t border-gray-200">
					<button
						onClick={onClose}
						className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
					>
						Đóng
					</button>
				</div>
			</div>
		</div>
	);
};

export default ViewExportPopup; 