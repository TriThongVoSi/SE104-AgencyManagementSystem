import React from 'react';
import { FaTimes, FaUser, FaCalendarAlt, FaMoneyBillWave, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPrint } from 'react-icons/fa';
import paymentReceiptService from '../../../utils/paymentReceiptService';

const ViewReceiptPopup = ({ receipt, onClose }) => {
	/**
	 * Handle ESC key to close popup
	 */
	const handleKeyDown = (e) => {
		if (e.key === 'Escape') {
			onClose();
		}
	};

	/**
	 * Print receipt
	 */
	const handlePrint = () => {
		const printContent = document.getElementById('receipt-content');
		const printWindow = window.open('', '', 'width=800,height=600');
		
		printWindow.document.write(`
			<html>
				<head>
					<title>Phiếu Thu Tiền #${receipt.paymentId}</title>
					<style>
						body { font-family: Arial, sans-serif; padding: 20px; }
						.header { text-align: center; margin-bottom: 30px; }
						.info-section { margin-bottom: 20px; }
						.info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
						.label { font-weight: bold; }
						.value { text-align: right; }
						.total { font-size: 18px; font-weight: bold; color: #059669; }
						.signature { margin-top: 50px; display: flex; justify-content: space-between; }
						.signature-box { text-align: center; width: 200px; }
						@media print { 
							body { margin: 0; }
							.no-print { display: none; }
						}
					</style>
				</head>
				<body>
					<div class="header">
						<h1>PHIẾU THU TIỀN</h1>
						<p>Số: ${receipt.paymentId}</p>
						<p>Ngày: ${paymentReceiptService.formatDate(receipt.paymentDate)}</p>
					</div>
					
					<div class="info-section">
						<h3>Thông tin đại lý</h3>
						<div class="info-row">
							<span class="label">Tên đại lý:</span>
							<span class="value">${receipt.agent?.agentName || 'N/A'}</span>
						</div>
						<div class="info-row">
							<span class="label">Email:</span>
							<span class="value">${receipt.agent?.email || 'N/A'}</span>
						</div>
						<div class="info-row">
							<span class="label">Điện thoại:</span>
							<span class="value">${receipt.agent?.phone || 'N/A'}</span>
						</div>
						<div class="info-row">
							<span class="label">Địa chỉ:</span>
							<span class="value">${receipt.agent?.address || 'N/A'}</span>
						</div>
					</div>
					
					<div class="info-section">
						<h3>Thông tin thanh toán</h3>
						<div class="info-row">
							<span class="label">Ngày thu:</span>
							<span class="value">${paymentReceiptService.formatDate(receipt.paymentDate)}</span>
						</div>
						<div class="info-row total">
							<span class="label">Số tiền thu:</span>
							<span class="value">${paymentReceiptService.formatCurrency(receipt.revenue)}</span>
						</div>
					</div>
					
					<div class="signature">
						<div class="signature-box">
							<p>Người thu</p>
							<br><br><br>
							<p>_________________</p>
						</div>
						<div class="signature-box">
							<p>Người nộp</p>
							<br><br><br>
							<p>_________________</p>
						</div>
					</div>
				</body>
			</html>
		`);
		
		printWindow.document.close();
		printWindow.focus();
		printWindow.print();
		printWindow.close();
	};

	// Add event listener for ESC key
	React.useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	if (!receipt) {
		return null;
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 text-black max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-800">
						Chi tiết phiếu thu
					</h2>
					<div className="flex gap-2">
						<button
							onClick={handlePrint}
							className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
							title="In phiếu thu"
						>
							<FaPrint size={20} />
						</button>
						<button
							onClick={onClose}
							className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
							title="Đóng"
						>
							<FaTimes size={20} />
						</button>
					</div>
				</div>

				{/* Receipt Content */}
				<div id="receipt-content" className="space-y-6">
					{/* Receipt Info */}
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<div className="flex items-center gap-4 mb-3">
							<FaIdCard className="text-yellow-600 text-xl" />
							<h3 className="text-lg font-semibold text-gray-800">Thông tin phiếu</h3>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<span className="text-sm font-medium text-gray-600">Mã phiếu thu:</span>
								<p className="text-lg font-bold text-gray-800">#{receipt.paymentId}</p>
							</div>
							
							<div>
								<span className="text-sm font-medium text-gray-600">Ngày tạo:</span>
								<div className="flex items-center gap-2 mt-1">
									<FaCalendarAlt className="text-blue-500" />
									<span className="text-gray-800 font-medium">
										{paymentReceiptService.formatDate(receipt.paymentDate)}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Agent Info */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-center gap-4 mb-3">
							<FaUser className="text-blue-600 text-xl" />
							<h3 className="text-lg font-semibold text-gray-800">Thông tin đại lý</h3>
						</div>
						
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<FaUser className="text-gray-500 mt-1" />
								<div>
									<span className="text-sm font-medium text-gray-600">Tên đại lý:</span>
									<p className="text-gray-800 font-medium">
										{receipt.agent?.agentName || 'N/A'}
									</p>
								</div>
							</div>
							
							<div className="flex items-start gap-3">
								<FaEnvelope className="text-gray-500 mt-1" />
								<div>
									<span className="text-sm font-medium text-gray-600">Email:</span>
									<p className="text-gray-800">
										{receipt.agent?.email || 'N/A'}
									</p>
								</div>
							</div>
							
							<div className="flex items-start gap-3">
								<FaPhone className="text-gray-500 mt-1" />
								<div>
									<span className="text-sm font-medium text-gray-600">Điện thoại:</span>
									<p className="text-gray-800">
										{receipt.agent?.phone || 'N/A'}
									</p>
								</div>
							</div>
							
							<div className="flex items-start gap-3">
								<FaMapMarkerAlt className="text-gray-500 mt-1" />
								<div>
									<span className="text-sm font-medium text-gray-600">Địa chỉ:</span>
									<p className="text-gray-800">
										{receipt.agent?.address || 'N/A'}
									</p>
								</div>
							</div>

							{receipt.agent?.debtMoney !== undefined && (
								<div className="flex items-start gap-3">
									<FaMoneyBillWave className="text-red-500 mt-1" />
									<div>
										<span className="text-sm font-medium text-gray-600">Số nợ hiện tại:</span>
										<p className="text-red-600 font-bold">
											{paymentReceiptService.formatCurrency(receipt.agent.debtMoney)}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Payment Info */}
					<div className="bg-green-50 border border-green-200 rounded-lg p-4">
						<div className="flex items-center gap-4 mb-3">
							<FaMoneyBillWave className="text-green-600 text-xl" />
							<h3 className="text-lg font-semibold text-gray-800">Thông tin thanh toán</h3>
						</div>
						
						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<FaCalendarAlt className="text-gray-500" />
								<div>
									<span className="text-sm font-medium text-gray-600">Ngày thu tiền:</span>
									<p className="text-gray-800 font-medium">
										{paymentReceiptService.formatDate(receipt.paymentDate)}
									</p>
								</div>
							</div>
							
							<div className="flex items-center gap-3">
								<FaMoneyBillWave className="text-green-500" />
								<div className="flex-1">
									<span className="text-sm font-medium text-gray-600">Số tiền thu:</span>
									<p className="text-2xl font-bold text-green-600">
										{paymentReceiptService.formatCurrency(receipt.revenue)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Summary */}
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
						<h3 className="text-lg font-semibold text-gray-800 mb-3">Tóm tắt</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-600">Đại lý:</span>
								<span className="ml-2 font-medium">{receipt.agent?.agentName || 'N/A'}</span>
							</div>
							<div>
								<span className="text-gray-600">Ngày thu:</span>
								<span className="ml-2 font-medium">{paymentReceiptService.formatDate(receipt.paymentDate)}</span>
							</div>
							<div className="md:col-span-2">
								<span className="text-gray-600">Tổng tiền thu:</span>
								<span className="ml-2 font-bold text-lg text-green-600">
									{paymentReceiptService.formatCurrency(receipt.revenue)}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
					<button
						onClick={handlePrint}
						className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
					>
						<FaPrint />
						In phiếu thu
					</button>
					<button
						onClick={onClose}
						className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
					>
						Đóng
					</button>
				</div>
			</div>
		</div>
	);
};

export default ViewReceiptPopup;
