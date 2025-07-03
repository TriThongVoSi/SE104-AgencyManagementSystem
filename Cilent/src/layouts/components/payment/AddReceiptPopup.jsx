import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaUser, FaCalendarAlt, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import agentService from '../../../utils/agentService';
import paymentReceiptService from '../../../utils/paymentReceiptService';
import DebtLimitService from '../../../utils/debtLimitService';

const AddReceiptPopup = ({ onClose, onAdded }) => {
  const { user } = useAuth();
	const [agents, setAgents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	
	// Form data
	const [formData, setFormData] = useState({
		agentId: '',
		paymentDate: new Date().toISOString().split('T')[0], // Today's date as default
		revenue: ''
	});
	
	// Form errors
	const [errors, setErrors] = useState({});
	
	// Selected agent info
	const [selectedAgent, setSelectedAgent] = useState(null);
	
	// Payment validation info
	const [paymentValidation, setPaymentValidation] = useState(null);

	/**
	 * Fetch danh sách đại lý
	 */
	const fetchAgents = async () => {
		setLoading(true);
		try {
			const result = await agentService.getAllAgents();
			if (result.success) {
				setAgents(result.data);
			} else {
				toast.error(result.error || 'Không thể lấy danh sách đại lý');
				setAgents([]);
			}
		} catch (error) {
			console.error('Error fetching agents:', error);
			toast.error('Có lỗi khi lấy danh sách đại lý');
			setAgents([]);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Validate payment amount against agent debt
	 */
	const validatePaymentAmount = (paymentAmount, agentDebt) => {
		if (!paymentAmount || !agentDebt || agentDebt <= 0) {
			return {
				isValid: true,
				type: 'no_debt',
				message: 'Đại lý không có nợ'
			};
		}

		const payment = parseFloat(paymentAmount) || 0;
		const debt = parseFloat(agentDebt) || 0;

		if (payment <= 0) {
			return {
				isValid: true,
				type: 'no_payment',
				message: ''
			};
		}

		if (payment > debt) {
			return {
				isValid: false,
				type: 'exceeds_debt',
				message: 'Số tiền thu vượt quá số tiền nợ',
				paymentAmount: payment,
				debtAmount: debt,
				excessAmount: payment - debt,
				maxAllowed: debt
			};
		}

		const percentage = (payment / debt * 100).toFixed(1);
		
		if (payment === debt) {
			return {
				isValid: true,
				type: 'full_payment',
				message: 'Thu đủ số tiền nợ',
				paymentAmount: payment,
				debtAmount: debt,
				percentage: percentage,
				remainingDebt: 0
			};
		}

		return {
			isValid: true,
			type: 'partial_payment',
			message: 'Thu một phần số tiền nợ',
			paymentAmount: payment,
			debtAmount: debt,
			percentage: percentage,
			remainingDebt: debt - payment
		};
	};

	/**
	 * Xử lý thay đổi input
	 */
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		
		setFormData(prev => ({
			...prev,
			[name]: value
		}));

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => ({
				...prev,
				[name]: ''
			}));
		}

		// Update selected agent when agent changes
		if (name === 'agentId') {
			const agent = agents.find(a => a.agentId === parseInt(value));
			setSelectedAgent(agent || null);
			
			// Reset payment validation when agent changes
			setPaymentValidation(null);
		}

		// Validate payment amount when revenue changes
		if (name === 'revenue' && selectedAgent) {
			const validation = validatePaymentAmount(value, selectedAgent.debtMoney);
			setPaymentValidation(validation);
		}
	};

	/**
	 * Validate form data
	 */
	const validateForm = () => {
		const newErrors = {};

		// Validate agent
		if (!formData.agentId) {
			newErrors.agentId = 'Vui lòng chọn đại lý';
		}

		// Validate payment date
		if (!formData.paymentDate) {
			newErrors.paymentDate = 'Vui lòng chọn ngày thu tiền';
		} else {
			const paymentDate = new Date(formData.paymentDate);
			const today = new Date();
			today.setHours(23, 59, 59, 999); // Set to end of today
			
			if (paymentDate > today) {
				newErrors.paymentDate = 'Ngày thu tiền không được là tương lai';
			}
		}

		// Validate revenue
		if (!formData.revenue) {
			newErrors.revenue = 'Vui lòng nhập số tiền thu';
		} else {
			const revenue = parseFloat(formData.revenue);
			if (isNaN(revenue) || revenue <= 0) {
				newErrors.revenue = 'Số tiền thu phải lớn hơn 0';
			} else if (revenue > 999999999) {
				newErrors.revenue = 'Số tiền thu quá lớn';
			} else if (selectedAgent && selectedAgent.debtMoney > 0) {
				// Validate against agent debt
				const validation = validatePaymentAmount(revenue, selectedAgent.debtMoney);
				if (!validation.isValid) {
					newErrors.revenue = `Số tiền thu (${DebtLimitService.formatCurrency(revenue)}) vượt quá số tiền nợ (${DebtLimitService.formatCurrency(selectedAgent.debtMoney)})`;
				}
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Xử lý submit form
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Check permissions
		if (!paymentReceiptService.canCreatePaymentReceipt(user?.role)) {
			toast.error('Bạn không có quyền tạo phiếu thu tiền');
			return;
		}

		// Validate form
		if (!validateForm()) {
			toast.error('Vui lòng kiểm tra lại thông tin');
			return;
		}

		setSubmitting(true);

		try {
			const paymentReceiptData = {
				agent: {
					agentId: parseInt(formData.agentId)
				},
				paymentDate: formData.paymentDate,
				revenue: parseInt(formData.revenue)
			};

			const result = await paymentReceiptService.createPaymentReceipt(paymentReceiptData);

			if (result.success) {
				toast.success(result.message || 'Tạo phiếu thu tiền thành công');
				onAdded(); // Callback to refresh the parent list
				onClose(); // Close the popup
			} else {
				toast.error(result.error || 'Không thể tạo phiếu thu tiền');
			}
		} catch (error) {
			console.error('Error creating payment receipt:', error);
			toast.error('Có lỗi khi tạo phiếu thu tiền');
		} finally {
			setSubmitting(false);
		}
	};

	/**
	 * Handle ESC key to close popup
	 */
	const handleKeyDown = (e) => {
		if (e.key === 'Escape') {
			onClose();
		}
	};

	// Effects
	useEffect(() => {
		fetchAgents();
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 text-black max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-bold text-gray-800">
						Tạo Phiếu Thu Mới
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 transition-colors"
						disabled={submitting}
					>
						<FaTimes size={20} />
					</button>
				</div>

				{/* Loading agents */}
				{loading && (
					<div className="text-center py-8">
						<FaSpinner className="animate-spin text-2xl text-gray-500 mx-auto" />
						<p className="mt-2 text-gray-600">Đang tải danh sách đại lý...</p>
					</div>
				)}

				{/* Form */}
				{!loading && (
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Agent Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								<FaUser className="inline mr-2" />
								Chọn Đại Lý *
							</label>
							<select
								name="agentId"
								className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
									errors.agentId 
										? 'border-red-500 focus:ring-red-500' 
										: 'border-gray-300 focus:ring-blue-500'
								}`}
								value={formData.agentId}
								onChange={handleInputChange}
								disabled={submitting || agents.length === 0}
							>
								<option value="">-- Chọn đại lý --</option>
								{agents.map((agent) => (
									<option key={agent.agentId} value={agent.agentId}>
										{agent.agentName} - {agent.email}
									</option>
								))}
							</select>
							{errors.agentId && (
								<p className="text-red-500 text-sm mt-1">{errors.agentId}</p>
							)}
						</div>

						{/* Selected Agent Info */}
						{selectedAgent && (
							<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
								<h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
									<FiInfo className="text-blue-600" />
									Thông tin đại lý đã chọn
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
									<div className="space-y-2">
										<p><span className="text-gray-600">Tên:</span> <span className="font-medium">{selectedAgent.agentName}</span></p>
										<p><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedAgent.email}</span></p>
									</div>
									<div className="space-y-2">
										<p><span className="text-gray-600">Địa chỉ:</span> <span className="font-medium">{selectedAgent.address}</span></p>
										<p><span className="text-gray-600">Điện thoại:</span> <span className="font-medium">{selectedAgent.phone}</span></p>
									</div>
								</div>
								
								{/* Debt Information */}
								{selectedAgent.debtMoney !== undefined && (
									<div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
										<div className="flex items-center gap-2 mb-2">
											<FiDollarSign className="text-red-500" />
											<span className="font-medium text-gray-800">Thông tin công nợ</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-600">Số tiền đang nợ:</span>
											<span className="font-bold text-red-600 text-lg">
												{DebtLimitService.formatCurrency(selectedAgent.debtMoney)}
											</span>
										</div>
										{selectedAgent.debtMoney > 0 && (
											<div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
												<FiInfo className="inline mr-1" />
												<strong>Lưu ý:</strong> Số tiền thu không được vượt quá số tiền nợ hiện tại
											</div>
										)}
									</div>
								)}
							</div>
						)}

						{/* Payment Date */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								<FaCalendarAlt className="inline mr-2" />
								Ngày Thu Tiền *
							</label>
							<input
								type="date"
								name="paymentDate"
								className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
									errors.paymentDate 
										? 'border-red-500 focus:ring-red-500' 
										: 'border-gray-300 focus:ring-blue-500'
								}`}
								value={formData.paymentDate}
								onChange={handleInputChange}
								disabled={submitting}
								max={new Date().toISOString().split('T')[0]} // Prevent future dates
							/>
							{errors.paymentDate && (
								<p className="text-red-500 text-sm mt-1">{errors.paymentDate}</p>
							)}
						</div>

						{/* Revenue */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								<FaMoneyBillWave className="inline mr-2" />
								Số Tiền Thu (VND) *
							</label>
							<input
								type="number"
								name="revenue"
								className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
									errors.revenue 
										? 'border-red-500 focus:ring-red-500 bg-red-50' 
										: paymentValidation && !paymentValidation.isValid
										? 'border-red-400 focus:ring-red-400 bg-red-50'
										: 'border-gray-300 focus:ring-blue-500'
								}`}
								value={formData.revenue}
								onChange={handleInputChange}
								placeholder={selectedAgent && selectedAgent.debtMoney > 0 
									? `Tối đa: ${DebtLimitService.formatCurrency(selectedAgent.debtMoney)}`
									: "Nhập số tiền thu"
								}
								disabled={submitting}
								min="1"
								max={selectedAgent && selectedAgent.debtMoney > 0 ? selectedAgent.debtMoney : "999999999"}
							/>
							
							{/* Error Message */}
							{errors.revenue && (
								<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
									<div className="flex items-center gap-2">
										<FiAlertTriangle className="text-red-500 flex-shrink-0" />
										<span className="text-red-700 text-sm font-medium">{errors.revenue}</span>
									</div>
								</div>
							)}

							{/* Payment Validation Display */}
							{!errors.revenue && paymentValidation && formData.revenue && (
								<div className="mt-3">
									{paymentValidation.type === 'exceeds_debt' && (
										<div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-lg">
											<div className="flex items-start gap-3">
												<div className="p-2 bg-red-200 rounded-full flex-shrink-0">
													<FiAlertTriangle className="text-red-700 text-lg" />
												</div>
												<div className="flex-1">
													<h4 className="text-red-800 font-bold text-sm mb-2">
														❌ SỐ TIỀN THU VƯỢT QUÁ SỐ TIỀN NỢ!
													</h4>
													<div className="text-red-700 text-xs space-y-1">
														<div>💰 Số tiền bạn muốn thu: <span className="font-semibold">{DebtLimitService.formatCurrency(paymentValidation.paymentAmount)}</span></div>
														<div>🚫 Số tiền nợ hiện tại: <span className="font-semibold">{DebtLimitService.formatCurrency(paymentValidation.debtAmount)}</span></div>
														<div>⚠️ Vượt quá: <span className="font-bold text-red-800">{DebtLimitService.formatCurrency(paymentValidation.excessAmount)}</span></div>
													</div>
													<div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-xs">
														<div className="flex items-center gap-1">
															<FiInfo className="text-red-600 flex-shrink-0" />
															<span>
																<strong>Giải pháp:</strong> Vui lòng nhập số tiền nhỏ hơn hoặc bằng {DebtLimitService.formatCurrency(paymentValidation.maxAllowed)}
															</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}

									{paymentValidation.type === 'full_payment' && (
										<div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg">
											<div className="flex items-center gap-3">
												<FiCheckCircle className="text-green-600 text-xl flex-shrink-0" />
												<div className="flex-1">
													<h4 className="text-green-800 font-semibold text-sm">✅ Thu đủ số tiền nợ</h4>
													<p className="text-green-700 text-xs mt-1">
														Đại lý sẽ thanh toán hết nợ sau khi thu phiếu này
													</p>
													<div className="mt-2 text-xs text-green-600">
														💰 Số tiền thu: <span className="font-semibold">{DebtLimitService.formatCurrency(paymentValidation.paymentAmount)}</span>
													</div>
												</div>
											</div>
										</div>
									)}

									{paymentValidation.type === 'partial_payment' && (
										<div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300 rounded-lg">
											<div className="flex items-center gap-3">
												<FiInfo className="text-blue-600 text-xl flex-shrink-0" />
												<div className="flex-1">
													<h4 className="text-blue-800 font-semibold text-sm">📊 Thu một phần nợ ({paymentValidation.percentage}%)</h4>
													<div className="mt-2 text-xs text-blue-700 space-y-1">
														<div>💰 Số tiền thu: <span className="font-semibold">{DebtLimitService.formatCurrency(paymentValidation.paymentAmount)}</span></div>
														<div>📋 Nợ còn lại: <span className="font-semibold">{DebtLimitService.formatCurrency(paymentValidation.remainingDebt)}</span></div>
													</div>
												</div>
											</div>
										</div>
									)}

									{paymentValidation.type === 'no_debt' && selectedAgent && selectedAgent.debtMoney <= 0 && (
										<div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-300 rounded-lg">
											<div className="flex items-center gap-3">
												<FiInfo className="text-gray-600 text-xl flex-shrink-0" />
												<div className="flex-1">
													<h4 className="text-gray-800 font-semibold text-sm">ℹ️ Đại lý không có nợ</h4>
													<p className="text-gray-600 text-xs mt-1">
														Đại lý này hiện tại không có công nợ. 
													</p>
												</div>
											</div>
										</div>
									)}
								</div>
							)}

							{/* Amount Display */}
							{formData.revenue && !errors.revenue && !paymentValidation && (
								<p className="text-green-600 text-sm mt-2 font-medium">
									{DebtLimitService.formatCurrency(parseInt(formData.revenue))}
								</p>
							)}
						</div>

						{/* Buttons */}
						<div className="flex justify-end space-x-3 pt-4">
							<button
								type="button"
								className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
								onClick={onClose}
								disabled={submitting}
							>
								Hủy
							</button>
							<button
								type="submit"
								className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
									submitting || agents.length === 0 || (paymentValidation && !paymentValidation.isValid)
										? 'bg-gray-400 text-gray-600 cursor-not-allowed'
										: 'bg-yellow-600 hover:bg-yellow-700 text-white'
								}`}
								disabled={submitting || agents.length === 0 || (paymentValidation && !paymentValidation.isValid)}
							>
								{submitting ? (
									<>
										<FaSpinner className="animate-spin" />
										Đang tạo...
									</>
								) : (
									'Tạo Phiếu Thu'
								)}
							</button>
						</div>

						{/* Help text for button state */}
						{paymentValidation && !paymentValidation.isValid && (
							<div className="mt-2 text-center">
								<p className="text-xs text-gray-500 italic">
									⚠️ Không thể tạo phiếu thu khi số tiền vượt quá số tiền nợ
								</p>
							</div>
						)}
					</form>
				)}

				{/* No agents message */}
				{!loading && agents.length === 0 && (
					<div className="text-center py-8">
						<p className="text-gray-600 mb-4">Không có đại lý nào trong hệ thống</p>
						<button
							onClick={onClose}
							className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
						>
							Đóng
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default AddReceiptPopup;
