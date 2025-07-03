import React, { useState, useEffect } from 'react';
import {
	FiX,
	FiPackage,
	FiShoppingCart,
	FiDollarSign,
	FiHash,
	FiTruck,
	FiEye,
	FiCalendar,
	FiUser,
	FiLoader,
	FiMapPin,
	FiLayers,
} from 'react-icons/fi';
import { getImportDetailsByImportReceiptId } from '../../../utils/importDetailService';

const ViewImportPopup = ({ importReceipt, onClose }) => {
	const [importDetails, setImportDetails] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (importReceipt?.importReceiptId) {
			fetchImportDetails();
		}
	}, [importReceipt]);

	const fetchImportDetails = async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await getImportDetailsByImportReceiptId(importReceipt.importReceiptId);
			
			if (result.success) {
				setImportDetails(result.data || []);
			} else {
				setError(result.message || 'Không thể tải chi tiết phiếu nhập');
			}
		} catch (error) {
			console.error('Error fetching import details:', error);
			setError('Lỗi kết nối API hoặc bạn không có quyền truy cập');
		} finally {
			setLoading(false);
		}
	};

	if (!importReceipt) return null;

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

	const DetailItem = ({ detail, index }) => (
		<div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
			<div className="flex items-center gap-2 mb-3">
				<div className="p-1.5 bg-purple-100 rounded-full">
					<FiPackage className="text-purple-600 text-sm" />
				</div>
				<h4 className="font-semibold text-gray-800">
					Sản phẩm #{index + 1}
				</h4>
			</div>
			<div className="grid grid-cols-2 gap-3 text-sm">
				<div className="bg-white p-2 rounded">
					<span className="text-gray-500 text-xs">ID Chi tiết:</span>
					<p className="font-semibold text-gray-800">{detail.importDetailId}</p>
				</div>
				<div className="bg-white p-2 rounded">
					<span className="text-gray-500 text-xs">Tên sản phẩm:</span>
					<p className="font-semibold text-gray-800">
						{detail.product?.productName || `SP-${detail.productId}` || 'Chưa có tên'}
					</p>
				</div>
				<div className="bg-white p-2 rounded">
					<span className="text-gray-500 text-xs">Đơn vị:</span>
					<p className="font-semibold text-gray-800">
						{detail.product?.unit?.unitName || 'Chưa xác định'}
					</p>
				</div>
				<div className="bg-white p-2 rounded">
					<span className="text-gray-500 text-xs">Số lượng nhập:</span>
					<p className="font-semibold text-blue-600">
						{detail.quantityImport?.toLocaleString('vi-VN')}
					</p>
				</div>
				<div className="bg-white p-2 rounded">
					<span className="text-gray-500 text-xs">Giá nhập (VND):</span>
					<p className="font-semibold text-green-600">
						{detail.importPrice?.toLocaleString('vi-VN')}₫
					</p>
				</div>
				<div className="bg-white p-2 rounded">
					<span className="text-gray-500 text-xs">Thành tiền:</span>
					<p className="font-bold text-red-600 text-base">
						{detail.intoMoney?.toLocaleString('vi-VN')}₫
					</p>
				</div>
			</div>
		</div>
	);

	const calculateTotalMoney = () => {
		return importDetails.reduce((total, detail) => total + (detail.intoMoney || 0), 0);
	};

	const calculateTotalQuantity = () => {
		return importDetails.reduce((total, detail) => total + (detail.quantityImport || 0), 0);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
			<div className="bg-white text-gray-800 p-8 rounded-2xl w-[800px] shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
					<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
						<div className="p-2 bg-purple-100 rounded-full">
							<FiEye className="text-purple-600 text-xl" />
						</div>
						Chi Tiết Phiếu Nhập Hàng
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
					>
						<FiX className="text-gray-500 hover:text-gray-700 text-xl" />
					</button>
				</div>

				{/* Import Receipt Info */}
				<div className="space-y-2 mb-6">
					<InfoRow
						icon={FiHash}
						label="Mã phiếu nhập"
						value={`PN-${importReceipt.importReceiptId}`}
						colorClass="blue"
					/>

					<InfoRow
						icon={FiCalendar}
						label="Ngày lập phiếu"
						value={new Date(importReceipt.dateOfReceipt || importReceipt.createDate).toLocaleDateString('vi-VN')}
						colorClass="green"
					/>
				</div>

				{/* Import Details Section */}
				<div className="border-t border-gray-200 pt-6">
					<div className="flex items-center gap-2 mb-4">
						<div className="p-1.5 bg-orange-100 rounded-full">
							<FiTruck className="text-orange-600" />
						</div>
						<h3 className="text-lg font-semibold text-gray-800">
							Danh Sách Hàng Hóa Nhập
						</h3>
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
								onClick={fetchImportDetails}
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
							>
								Thử lại
							</button>
						</div>
					) : importDetails.length > 0 ? (
						<>
							<div className="space-y-3 max-h-80 overflow-y-auto pr-2">
								{importDetails.map((detail, index) => (
									<DetailItem
										key={detail.importDetailId || index}
										detail={detail}
										index={index}
									/>
								))}
							</div>

							{/* Summary Statistics */}
							<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
									<div className="flex items-center gap-2">
										<FiLayers className="text-blue-600" />
										<span className="font-semibold text-gray-800">Tổng mặt hàng:</span>
									</div>
									<span className="text-xl font-bold text-blue-600">
										{importDetails.length}
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
										{calculateTotalMoney().toLocaleString('vi-VN')}₫
									</span>
								</div>
							</div>
						</>
					) : (
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
							<FiPackage className="text-gray-400 text-4xl mx-auto mb-2" />
							<p className="text-gray-600 font-medium">
								Không có chi tiết hàng nhập trong phiếu này
							</p>
							<p className="text-gray-500 text-sm mt-1">
								Phiếu nhập có thể chưa được thêm hàng hóa
							</p>
						</div>
					)}
				</div>

				{/* Close Button */}
				<div className="flex justify-center mt-8 pt-4 border-t border-gray-200">
					<button
						onClick={onClose}
						className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
					>
						Đóng
					</button>
				</div>
			</div>
		</div>
	);
};

export default ViewImportPopup; 