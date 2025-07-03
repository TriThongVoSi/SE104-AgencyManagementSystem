import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
	FiEdit3, FiX, FiDollarSign, FiUser, FiSave, FiAlertTriangle, FiInfo, 
	FiPhone, FiMail, FiMapPin, FiTag, FiMap, FiUserCheck, FiCreditCard 
} from 'react-icons/fi';
import { API_CONFIG } from '../../../constants/api.js';
import DebtLimitWarning from '../common/DebtLimitWarning';
import DebtLimitService from '../../../utils/debtLimitService';
import DebtLimitErrorBoundary from '../common/DebtLimitErrorBoundary';

const EditAgentPopup = ({ agent, onClose, onUpdated }) => {
	const [activeTab, setActiveTab] = useState('info'); // 'info' or 'debt'
	const [loading, setLoading] = useState(false);
	const [agentTypeInfo, setAgentTypeInfo] = useState(null);
	const [debtLimitInfo, setDebtLimitInfo] = useState(null);
	const [error, setError] = useState(null);
	const [agentTypes, setAgentTypes] = useState([]);
	const [districts, setDistricts] = useState([]);

	// Form states
	const [debtMoney, setDebtMoney] = useState(agent.debtMoney || 0);
	const [formData, setFormData] = useState({
		phone: agent.phone || '',
		email: agent.email || '',
		address: agent.address || '',
		agentTypeName: agent.agentType?.agentTypeName || '',
		districtName: agent.district?.districtName || ''
	});

	// Fetch initial data on mount
	// Lấy dữ liệu ban đầu khi component mount
	useEffect(() => {
		fetchAgentTypeInfo();
		fetchAgentTypes();
		fetchDistricts();
	}, []);

	// Update debt limit info when related data changes
	// Cập nhật thông tin giới hạn nợ khi dữ liệu liên quan thay đổi
	useEffect(() => {
		try {
			if (agentTypeInfo && agentTypeInfo.maxDebt) {
				const limitInfo = DebtLimitService.checkDebtLimit(debtMoney, agentTypeInfo.maxDebt);
				setDebtLimitInfo(limitInfo);
			} else {
				setDebtLimitInfo(null);
			}
		} catch (error) {
			console.error('Error checking debt limit:', error);
			setDebtLimitInfo(null);
		}
	}, [debtMoney, agentTypeInfo]);

	// Update debt limit when agent type changes in form
	// Cập nhật giới hạn nợ khi loại đại lý thay đổi trong form
	useEffect(() => {
		if (formData.agentTypeName) {
			const selectedType = agentTypes.find(type => type.agentTypeName === formData.agentTypeName);
			if (selectedType) {
				const limitInfo = DebtLimitService.checkDebtLimit(debtMoney, selectedType.maximumDebt);
				setDebtLimitInfo(limitInfo);
			}
		}
	}, [formData.agentTypeName, agentTypes, debtMoney]);

	const fetchAgentTypeInfo = async () => {
		try {
			const token = localStorage.getItem('authToken');
			const agentId = agent.agentID || agent.agentId || agent.id;
			
			const response = await fetch(`${API_CONFIG.BASE_URL}/agents/${agentId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				const agentDetail = data.data || data;
				
				if (agentDetail.agentType) {
					const maxDebt = agentDetail.agentType.maximumDebt || 
								   agentDetail.agentType.maxDebt || 
								   agentDetail.agentType.maxImumDebt;
					const agentTypeName = agentDetail.agentType.agentTypeName || 
										 agentDetail.agentType.typeName;
					
					setAgentTypeInfo({
						maxDebt,
						agentTypeName
					});
				}
			}
		} catch (error) {
			console.error('Error fetching agent type info:', error);
		}
	};

	const fetchAgentTypes = async () => {
		try {
			const token = localStorage.getItem('authToken');
			const headers = token ? { 
				'Content-Type': 'application/json', 
				'Authorization': `Bearer ${token}` 
			} : { 'Content-Type': 'application/json' };
			
			const response = await fetch('http://localhost:8080/agent-type/all', { headers });
			const data = await response.json();
			if (data.code === 200) {
				setAgentTypes(data.data);
			}
		} catch (error) {
			console.error('Error fetching agent types:', error);
		}
	};

	const fetchDistricts = async () => {
		try {
			const token = localStorage.getItem('authToken');
			const headers = token ? { 
				'Content-Type': 'application/json', 
				'Authorization': `Bearer ${token}` 
			} : { 'Content-Type': 'application/json' };
			
			const response = await fetch('http://localhost:8080/district/all', { headers });
			const data = await response.json();
			if (data.code === 200) {
				setDistricts(data.data);
			}
		} catch (error) {
			console.error('Error fetching districts:', error);
		}
	};

	const handleFormDataChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
		setError(null);
	};

	const validateForm = () => {
		const { phone, email, address, agentTypeName, districtName } = formData;
		
		if (!phone.trim()) {
			setError('Số điện thoại không được để trống');
			return false;
		}
		if (!email.trim()) {
			setError('Email không được để trống');
			return false;
		}
		if (!address.trim()) {
			setError('Địa chỉ không được để trống');
			return false;
		}
		if (!agentTypeName.trim()) {
			setError('Loại đại lý không được để trống');
			return false;
		}
		if (!districtName.trim()) {
			setError('Quận không được để trống');
			return false;
		}

		// Email validation
		// Kiểm tra định dạng email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError('Email không hợp lệ');
			return false;
		}

		// Phone validation
		// Kiểm tra định dạng số điện thoại
		const phoneRegex = /^[0-9]{10,11}$/;
		if (!phoneRegex.test(phone)) {
			setError('Số điện thoại phải có 10-11 chữ số');
			return false;
		}

		return true;
	};

	const handleUpdateInfo = async () => {
		if (!validateForm()) return;

		const agentId = agent.agentID || agent.agentId || agent.id;
		setError(null);
		setLoading(true);

		try {
			const token = localStorage.getItem('authToken');
			const response = await fetch(`${API_CONFIG.BASE_URL}/agents/${agentId}/info`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				const data = await response.json();
				if (data.code === 200 || data.status === 'success') {
					toast.success('Cập nhật thông tin đại lý thành công!', {
						autoClose: 3000
					});
					onUpdated();
					onClose();
				} else {
					throw new Error(data.message || 'Cập nhật thất bại');
				}
			} else {
				const errorText = await response.text();
				let errorData = null;
				
				try {
					errorData = JSON.parse(errorText);
				} catch (parseError) {
					console.warn('Response is not JSON:', errorText);
				}

				throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
			}
		} catch (error) {
			console.error('Error updating agent info:', error);
			
			if (error.message === 'Số lượng đại lý trong quận đã đạt tối đa') {
				setError({
					type: 'district_agent_limit_exceeded',
					message: error.message
				});
				toast.error('⚠️ ' + error.message, {
					autoClose: 5000
				});
			} else {
				setError(error.message || 'Đã xảy ra lỗi khi cập nhật thông tin đại lý!');
				toast.error(error.message || 'Đã xảy ra lỗi khi cập nhật thông tin đại lý!');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateDebt = async () => {
		const agentId = agent.agentID || agent.agentId || agent.id;
		const debt = parseInt(debtMoney, 10);
		
		if (!agentId || isNaN(debt)) {
			setError('Thiếu thông tin đại lý hoặc số tiền nợ không hợp lệ!');
			return;
		}

		if (debt < 0) {
			setError('Số tiền nợ không được âm!');
			return;
		}

		setError(null);
		setLoading(true);

		try {
			const token = localStorage.getItem('authToken');
			const response = await fetch(`${API_CONFIG.BASE_URL}/agents/${agentId}/debt?debtMoney=${debt}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.code === 200 || data.status === 'success') {
					toast.success('Cập nhật số tiền nợ thành công!', {
						autoClose: 3000
					});
					onUpdated();
					onClose();
				} else {
					throw new Error(data.message || 'Cập nhật thất bại');
				}
			} else {
				const errorText = await response.text();
				let errorData = null;
				
				try {
					errorData = JSON.parse(errorText);
				} catch (parseError) {
					console.warn('Response is not JSON:', errorText);
				}

				if (response.status === 400 && errorData) {
					if (errorData.message && (
						errorData.message.includes('vượt quá giới hạn') ||
						errorData.message.includes('AGENT_DEBT_LIMIT_EXCEEDED') ||
						errorData.message.includes('debt.*limit.*exceeded')
					)) {
						setError({
							type: 'debt_limit_exceeded',
							message: errorData.message,
							data: errorData.data
						});
						return;
					}
					
					if (errorData.message === 'Số lượng đại lý trong quận đã đạt tối đa') {
						setError({
							type: 'district_agent_limit_exceeded',
							message: errorData.message,
							data: errorData.data
						});
						return;
					}
				}

				throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
			}
		} catch (error) {
			console.error('Error updating debt:', error);
			
			if (error.message.includes('vượt quá giới hạn')) {
				setError({
					type: 'debt_limit_exceeded',
					message: error.message
				});
			} else if (error.message === 'Số lượng đại lý trong quận đã đạt tối đa') {
				setError({
					type: 'district_agent_limit_exceeded',
					message: error.message
				});
			} else {
				setError(error.message || 'Đã xảy ra lỗi khi cập nhật số tiền nợ!');
			}
		} finally {
			setLoading(false);
		}
	};

	const renderInfoTab = () => (
		<div className="space-y-6">
			{/* Agent Info */}
			<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
				<div className="flex items-center gap-2 mb-2">
					<FiUser className="text-gray-600" />
					<label className="text-sm font-medium text-gray-700">
						Tên đại lý:
					</label>
				</div>
				<p className="font-semibold text-gray-900 text-lg ml-6">
					{agent.agentName}
				</p>
			</div>

			{/* Phone */}
			<div>
				<label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
					<FiPhone className="text-gray-600" />
					Số điện thoại:
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
						<FiPhone className="text-gray-400" />
					</div>
					<input
						type="text"
						name="phone"
						value={formData.phone}
						onChange={handleFormDataChange}
						className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
						placeholder="Nhập số điện thoại"
						disabled={loading}
					/>
				</div>
			</div>

			{/* Email */}
			<div>
				<label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
					<FiMail className="text-gray-600" />
					Email:
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
						<FiMail className="text-gray-400" />
					</div>
					<input
						type="email"
						name="email"
						value={formData.email}
						onChange={handleFormDataChange}
						className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
						placeholder="Nhập email"
						disabled={loading}
					/>
				</div>
			</div>

			{/* Address */}
			<div>
				<label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
					<FiMapPin className="text-gray-600" />
					Địa chỉ:
				</label>
				<div className="relative">
					<div className="absolute top-3 left-0 pl-4 pointer-events-none">
						<FiMapPin className="text-gray-400 text-sm" />
					</div>
					<textarea
						name="address"
						value={formData.address}
						onChange={handleFormDataChange}
						rows={3}
						className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none leading-relaxed"
						placeholder="Ví dụ: Hàn Thuyên, khu phố 6, Thủ Đức, Hồ Chí Minh"
						disabled={loading}
					/>
				</div>
			</div>

			{/* Agent Type */}
			<div>
				<label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
					<FiTag className="text-gray-600" />
					Loại đại lý:
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
						<FiTag className="text-gray-400" />
					</div>
					<select
						name="agentTypeName"
						value={formData.agentTypeName}
						onChange={handleFormDataChange}
						className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
						disabled={loading}
					>
						<option value="">Chọn loại đại lý</option>
						{agentTypes.map((type) => (
							<option key={type.agentTypeId} value={type.agentTypeName}>
								{type.agentTypeName}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* District */}
			<div>
				<label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
					<FiMap className="text-gray-600" />
					Quận:
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
						<FiMap className="text-gray-400" />
					</div>
					<select
						name="districtName"
						value={formData.districtName}
						onChange={handleFormDataChange}
						className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
						disabled={loading}
					>
						<option value="">Chọn quận</option>
						{districts.map((district) => (
							<option key={district.districtId} value={district.districtName}>
								{district.districtName}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);

	const renderDebtTab = () => (
		<div className="space-y-6">
			{/* Current Agent Type Info */}
			<DebtLimitErrorBoundary>
				{agentTypeInfo && (
					<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
						<div className="flex items-center gap-2 mb-1">
							<FiInfo className="text-blue-600" />
							<span className="text-sm font-medium text-blue-800">Thông tin loại đại lý</span>
						</div>
						<div className="text-sm text-blue-700 ml-6">
							<div>Loại: <span className="font-semibold">{agentTypeInfo.agentTypeName}</span></div>
							<div>Giới hạn nợ tối đa: <span className="font-semibold">{agentTypeInfo.maxDebt ? DebtLimitService.formatCurrency(agentTypeInfo.maxDebt) : '0 đ'}</span></div>
						</div>
					</div>
				)}

				{/* Debt Limit Warning */}
				{debtLimitInfo && debtLimitInfo.isValid && (debtLimitInfo.isExceeded || debtLimitInfo.isNearLimit) && (
					<div>
						<DebtLimitWarning
							debtAmount={debtMoney}
							maxDebt={agentTypeInfo?.maxDebt}
							agentTypeName={agentTypeInfo?.agentTypeName}
							agentName={agent.agentName}
							size="sm"
							showDetails={true}
							variant="card"
						/>
					</div>
				)}
			</DebtLimitErrorBoundary>

			{/* Debt Money Input */}
			<div>
				<label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
					<FiDollarSign className="text-gray-600" />
					Tiền nợ (VNĐ):
				</label>
				<div className="relative text-gray-900">
					<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
						<span className="text-gray-500 font-medium">₫</span>
					</div>
					<input
						type="number"
						value={debtMoney}
						onChange={(e) => {
							const value = parseInt(e.target.value, 10) || 0;
							setDebtMoney(value);
							setError(null);
						}}
						className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-lg font-medium ${
							error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
						} ${debtLimitInfo && debtLimitInfo.isExceeded ? 'border-red-400 bg-red-50' : ''}`}
						placeholder="0"
						disabled={loading}
					/>
				</div>
				<div className="mt-2 flex justify-between items-center text-sm">
					<span className="text-gray-500">
						Số tiền hiện tại: <span className="font-semibold">{DebtLimitService.formatCurrency(agent.debtMoney || 0)}</span>
					</span>
					{agentTypeInfo && debtLimitInfo && debtLimitInfo.isValid && !debtLimitInfo.isExceeded && debtLimitInfo.remainingLimit !== undefined && (
						<span className="text-blue-600">
							Số tiền có thể nợ: <span className="font-semibold">{DebtLimitService.formatCurrency(debtLimitInfo.remainingLimit)}</span>
						</span>
					)}
				</div>
			</div>
		</div>
	);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
			<div className="bg-white rounded-2xl w-[600px] max-h-[90vh] shadow-2xl transform transition-all duration-300 scale-100 overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
					<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
						<div className="p-2 bg-blue-100 rounded-full">
							<FiEdit3 className="text-blue-600 text-xl" />
						</div>
						Chỉnh Sửa Đại Lý
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
					>
						<FiX className="text-gray-500 hover:text-gray-700 text-xl" />
					</button>
				</div>

				{/* Tabs Navigation */}
				<div className="flex border-b border-gray-200 bg-gray-50 px-6">
					<button
						onClick={() => setActiveTab('info')}
						className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 flex items-center gap-2 ${
							activeTab === 'info'
								? 'border-blue-500 text-blue-600 bg-blue-50'
								: 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
						}`}
					>
						<FiUserCheck />
						Thông tin cá nhân
					</button>
					<button
						onClick={() => setActiveTab('debt')}
						className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 flex items-center gap-2 ${
							activeTab === 'debt'
								? 'border-blue-500 text-blue-600 bg-blue-50'
								: 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
						}`}
					>
						<FiCreditCard />
						Công nợ
					</button>
				</div>

				{/* Content Area */}
				<div className="flex-1 overflow-y-auto p-6">
					{/* Error Display */}
					{error && (
						<div className="mb-4">
							{error.type === 'debt_limit_exceeded' ? (
								<div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-lg shadow-sm">
									<div className="flex items-start gap-3">
										<div className="p-2 bg-red-200 rounded-full flex-shrink-0">
											<FiAlertTriangle className="text-red-700 text-lg" />
										</div>
										<div className="flex-1">
											<h4 className="text-red-800 font-bold text-sm mb-2">
												❌ LỖI CẬP NHẬT: SỐ TIỀN NỢ VƯỢT QUÁ GIỚI HẠN CHO PHÉP!
											</h4>
											<div className="text-red-700 text-xs space-y-1">
												<div>📝 Chi tiết lỗi: <span className="font-medium">{error.message}</span></div>
												{debtLimitInfo && debtLimitInfo.isValid && (
													<>
														<div>💰 Số tiền bạn nhập: <span className="font-semibold">{DebtLimitService.formatCurrency(debtMoney)}</span></div>
														<div>🚫 Giới hạn tối đa cho phép: <span className="font-semibold">{DebtLimitService.formatCurrency(agentTypeInfo?.maxDebt)}</span></div>
														<div>⚠️ Vượt quá: <span className="font-bold text-red-800">{DebtLimitService.formatCurrency(debtLimitInfo.exceededAmount)}</span></div>
													</>
												)}
											</div>
											<div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-xs">
												<div className="flex items-center gap-1">
													<FiInfo className="text-red-600 flex-shrink-0" />
													<span>
														<strong>Giải pháp:</strong> Vui lòng nhập số tiền nhỏ hơn hoặc bằng {DebtLimitService.formatCurrency(agentTypeInfo?.maxDebt || 0)} 
														hoặc liên hệ quản trị viên để tăng giới hạn nợ.
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							) : error.type === 'district_agent_limit_exceeded' ? (
								<div className="p-4 bg-gradient-to-r from-amber-50 to-orange-100 border-2 border-amber-300 rounded-lg shadow-sm">
									<div className="flex items-start gap-3">
										<div className="p-2 bg-amber-200 rounded-full flex-shrink-0">
											<FiAlertTriangle className="text-amber-700 text-lg" />
										</div>
										<div className="flex-1">
											<h4 className="text-amber-800 font-bold text-sm mb-2">
												⚠️ LỖI CẬP NHẬT: SỐ LƯỢNG ĐẠI LÝ TRONG QUẬN ĐÃ ĐẠT TỐI ĐA!
											</h4>
											<div className="text-amber-700 text-xs space-y-1">
												<div>📍 Quận bạn chọn: <span className="font-medium">{formData.districtName}</span></div>
												<div>📝 Chi tiết lỗi: <span className="font-medium">{error.message}</span></div>
												<div>🚫 Không thể chuyển đại lý đến quận này vì đã vượt quá giới hạn cho phép</div>
											</div>
											<div className="mt-3 p-2 bg-amber-100 border border-amber-200 rounded text-amber-700 text-xs">
												<div className="flex items-center gap-1">
													<FiInfo className="text-amber-600 flex-shrink-0" />
													<span>
														<strong>Giải pháp:</strong> Vui lòng chọn quận khác có số lượng đại lý ít hơn 
														hoặc liên hệ quản trị viên để tăng giới hạn đại lý cho quận này.
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
									<div className="flex items-center gap-2">
										<FiAlertTriangle className="text-red-500 flex-shrink-0" />
										<span className="text-red-700 text-sm font-medium">{error}</span>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Tab Content */}
					{activeTab === 'info' ? renderInfoTab() : renderDebtTab()}
				</div>

				{/* Footer Buttons */}
				<div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 bg-gray-50">
					<button
						onClick={onClose}
						className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300"
						disabled={loading}
					>
						Hủy
					</button>
					<button
						onClick={activeTab === 'info' ? handleUpdateInfo : handleUpdateDebt}
						disabled={loading || (activeTab === 'debt' && debtLimitInfo && debtLimitInfo.isExceeded) || (error && (error.type === 'debt_limit_exceeded' || error.type === 'district_agent_limit_exceeded'))}
						className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 ${
							loading || (activeTab === 'debt' && debtLimitInfo && debtLimitInfo.isExceeded) || (error && (error.type === 'debt_limit_exceeded' || error.type === 'district_agent_limit_exceeded'))
								? 'bg-gray-400 text-gray-600 cursor-not-allowed'
								: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
						}`}
					>
						{loading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
								Đang cập nhật...
							</>
						) : (
							<>
								<FiSave />
								{activeTab === 'info' ? 'Lưu thông tin' : 'Lưu công nợ'}
							</>
						)}
					</button>
				</div>

				{/* Help text for button state */}
				{(activeTab === 'debt' && (debtLimitInfo && debtLimitInfo.isExceeded)) || (error && error.type === 'district_agent_limit_exceeded') ? (
					<div className="px-6 pb-3 text-center">
						<p className="text-xs text-gray-500 italic">
							{activeTab === 'debt' && (debtLimitInfo && debtLimitInfo.isExceeded) 
								? '⚠️ Không thể lưu khi số tiền nợ vượt quá giới hạn cho phép'
								: '⚠️ Không thể lưu khi quận đã đạt số lượng đại lý tối đa'
							}
						</p>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default EditAgentPopup;
