import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiX, FiTrash2, FiDollarSign } from 'react-icons/fi';
import { API_CONFIG } from '../../../constants/api.js';
import api from '../../../utils/api.js';
import DebtLimitWarning from '../common/DebtLimitWarning';

const DeleteAgentPopup = ({ agent, onClose, onDeleted }) => {
	const [loading, setLoading] = useState(false);
	const [agentDebt, setAgentDebt] = useState(null);
	const [loadingDebt, setLoadingDebt] = useState(false);

	// Function to fetch agent debt information
	// Hàm lấy thông tin công nợ của đại lý
	const fetchAgentDebt = async () => {
		const token = localStorage.getItem('authToken');
		if (!token) return;

		const agentId = agent?.agentID || agent?.agentId;
		if (!agentId) return;

		setLoadingDebt(true);
		try {
			console.log(`💰 Fetching debt for agent ID: ${agentId}`);
			
			// Try to get agent details first (most reliable source)
			// Thử lấy chi tiết đại lý trước (nguồn đáng tin cậy nhất)
			const detailResponse = await fetch(
				`${API_CONFIG.BASE_URL}/agents/${agentId}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					}
				}
			);
			
			if (detailResponse.ok) {
				const detailData = await detailResponse.json();
				console.log('📊 Agent detail response:', detailData);
				
				const agentDetail = detailData.data || detailData;
				
				// Try different possible field names for debt
				// Thử các tên trường khác nhau cho công nợ
				const debtAmount = agentDetail.debt_money || 
							 agentDetail.debtMoney || 
							 agentDetail.debt || 
							 agentDetail.balance || 
							 agentDetail.currentDebt || 
							 0;
				
				// Get agent type information for debt limit
				// Lấy thông tin loại đại lý để kiểm tra giới hạn nợ
				let maxDebt = null;
				let agentTypeName = null;
				let isDebtExceeded = false;
				
				if (agentDetail.agentType) {
					maxDebt = agentDetail.agentType.maximumDebt || agentDetail.agentType.maxDebt || agentDetail.agentType.maxImumDebt;
					agentTypeName = agentDetail.agentType.agentTypeName || agentDetail.agentType.typeName;
					isDebtExceeded = maxDebt && debtAmount > maxDebt;
				}
				
				console.log(`💰 Debt amount: ${debtAmount}, Max debt: ${maxDebt}, Exceeded: ${isDebtExceeded}`);
				
				setAgentDebt({
					balance: debtAmount,
					hasDebt: debtAmount > 0,
					debtMoney: debtAmount,
					maxDebt: maxDebt,
					agentTypeName: agentTypeName,
					isDebtExceeded: isDebtExceeded,
					remainingLimit: maxDebt ? Math.max(0, maxDebt - debtAmount) : null
				});
				return;
			}

			// Fallback: Try dedicated debt endpoint
			// Thử endpoint chuyên biệt cho công nợ
			const debtResponse = await fetch(
				`${API_CONFIG.BASE_URL}/agents/${agentId}/debt`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					}
				}
			);

			if (debtResponse.ok) {
				const debtData = await debtResponse.json();
				console.log('📊 Debt endpoint response:', debtData);
				
				const debtInfo = debtData.data || debtData;
				const debtAmount = debtInfo.debt_money || 
								  debtInfo.debtMoney || 
								  debtInfo.amount || 
								  debtInfo.balance || 
								  0;
				
				setAgentDebt({
					balance: debtAmount,
					hasDebt: debtAmount > 0,
					debtMoney: debtAmount
				});
			} else {
				console.warn('⚠️ Could not fetch debt from dedicated endpoint');
				// Set default no debt
				// Thiết lập mặc định không có công nợ
				setAgentDebt({
					balance: 0,
					hasDebt: false,
					debtMoney: 0
				});
			}
		} catch (error) {
			console.error('❌ Error fetching agent debt:', error);
			// On error, assume no debt data available
			// Nếu lỗi, giả định không có dữ liệu công nợ
			setAgentDebt({
				balance: 0,
				hasDebt: false,
				debtMoney: 0,
				error: true
			});
		} finally {
			setLoadingDebt(false);
		}
	};

	// Fetch debt info when component mounts
	// Lấy thông tin công nợ khi component mount
	useEffect(() => {
		if (agent) {
			fetchAgentDebt();
		}
	}, [agent]);

	const handleDelete = async () => {
		// Validate token exists
		// Kiểm tra token tồn tại
		const token = localStorage.getItem('authToken');
		if (!token) {
			toast.error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại!');
			return;
		}

		// Validate agent data - support both agentID and agentId
		// Kiểm tra dữ liệu đại lý - hỗ trợ cả agentID và agentId
		const agentId = agent?.agentID || agent?.agentId;
		if (!agent || !agentId) {
			toast.error('Dữ liệu đại lý không hợp lệ!');
			console.error('Agent data:', agent);
			return;
		}

		console.log(`🗑️ Attempting to delete agent ID: ${agentId}`);
		console.log(`🔑 Using token: ${token.substring(0, 20)}...`);
		console.log(`📡 DELETE URL: ${API_CONFIG.BASE_URL}/agents/${agentId}`);

		// Decode and validate token before sending request
		// Giải mã và kiểm tra token trước khi gửi yêu cầu
		const tokenInfo = decodeAndValidateToken(token);
		if (tokenInfo.expired) {
			toast.error('Token đã hết hạn. Vui lòng đăng nhập lại!');
			localStorage.removeItem('authToken');
			return;
		}
		if (tokenInfo.error) {
			toast.error('Token không hợp lệ. Vui lòng đăng nhập lại!');
			localStorage.removeItem('authToken');
			return;
		}

		// Note: Role checking removed - all authenticated users can delete agents
		// Lưu ý: Đã bỏ kiểm tra vai trò - tất cả người dùng đã xác thực đều có thể xóa đại lý
		console.log('👤 User authenticated, proceeding with deletion...');

		setLoading(true);
		try {
			console.log(`🗑️ Deleting agent using api.js with ID: ${agentId}`);
			
			// Use api.js which has proper interceptors for token handling
			// Sử dụng api.js có sẵn interceptor xử lý token
			const response = await api.delete(`/agents/${agentId}`);

			console.log('✅ Delete successful:', response.data);
			
			// Check API response structure
			// Kiểm tra cấu trúc phản hồi API
			if (response.data && (response.data.code === 200 || response.data.status === 'success' || response.status === 200)) {
				const agentName = agent.agentName || agent.name || 'Không xác định';
				toast.success(`Xóa đại lý "${agentName}" thành công!`);
				
				// Call parent callback to refresh the list
				// Gọi callback cha để làm mới danh sách
				if (onDeleted && typeof onDeleted === 'function') {
					onDeleted();
				}
				onClose();
			} else {
				// Handle API error response
				// Xử lý phản hồi lỗi từ API
				const errorMessage = response.data?.message || response.data?.error || 'Xóa đại lý thất bại!';
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error('❌ Error deleting agent:', error);
			
			// Handle axios error response
			// Xử lý lỗi axios
			if (error.response) {
				const response = error.response;
				const status = response.status;
				const errorData = response.data;
				
				console.error(`❌ HTTP error! status: ${status}, response:`, errorData);
				
				let errorMessage = 'Đã xảy ra lỗi khi xóa đại lý!';
				
				try {
					// Handle specific HTTP status codes
					// Xử lý các mã trạng thái HTTP cụ thể
					if (status === 401) {
						errorMessage = 'Token đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!';
						localStorage.removeItem('authToken');
						// Có thể redirect về trang login
						if (typeof window !== 'undefined') {
							window.location.href = '/login';
						}
					} else if (status === 403) {
						// Enhanced 403 handling - simplified for all users
						// Xử lý 403 nâng cao - đơn giản hóa cho tất cả người dùng
						console.error('🚫 403 Forbidden - Access Denied');
						console.error('🔍 Response headers:', response.headers);
						console.error('🔍 Request config:', error.config);
						console.error('🔍 Error data:', errorData);
						
						const errorText = typeof errorData === 'string' ? errorData : (errorData?.message || JSON.stringify(errorData));
						
						// General permission error message for all users
						// Thông báo lỗi quyền cho tất cả người dùng
						if (errorText.toLowerCase().includes('access denied') || 
							errorText.toLowerCase().includes('insufficient') ||
							errorText.toLowerCase().includes('forbidden') ||
							errorText.toLowerCase().includes('unauthorized')) {
							errorMessage = 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên!';
						} else {
							errorMessage = 'Bạn không có quyền thực hiện thao tác này!';
						}
					} else if (status === 404) {
						errorMessage = 'Không tìm thấy đại lý!';
					} else if (status === 400) {
						// Handle business logic errors for status 400
						// Xử lý lỗi nghiệp vụ cho mã 400
						if (errorData && errorData.message) {
							if (errorData.message.includes('còn nợ') || 
								errorData.message.includes('debt') || 
								errorData.message.includes('balance') ||
								errorData.message.includes('AGENT_HAS_DEBT')) {
								
								// Try to extract debt amount from error response
								// Thử lấy số tiền nợ từ phản hồi lỗi
								if (errorData.data && errorData.data.debt_money) {
									const debtAmount = errorData.data.debt_money;
									errorMessage = `Không thể xóa đại lý "${agent.agentName || agent.name}" do đại lý còn nợ ${formatCurrency(debtAmount)}. Vui lòng thanh toán hết nợ trước khi xóa!`;
									
									// Update debt information from error response
									// Cập nhật thông tin công nợ từ phản hồi lỗi
									setAgentDebt({
										balance: debtAmount,
										hasDebt: true,
										debtMoney: debtAmount
									});
								} else {
									errorMessage = `Không thể xóa đại lý "${agent.agentName || agent.name}" do đại lý còn nợ tiền. Vui lòng thanh toán hết nợ trước khi xóa!`;
									
									// Re-fetch debt information after error
									// Lấy lại thông tin công nợ sau khi lỗi
									fetchAgentDebt();
								}
							} else if (errorData.message.includes('transaction') || 
									   errorData.message.includes('giao dịch') ||
									   errorData.message.includes('AGENT_HAS_TRANSACTIONS')) {
								errorMessage = `Không thể xóa đại lý "${agent.agentName || agent.name}" do đại lý đã có giao dịch trong hệ thống!`;
							} else if (errorData.message.includes('receipt') || 
									   errorData.message.includes('phiếu') ||
									   errorData.message.includes('AGENT_HAS_RECEIPTS')) {
								errorMessage = `Không thể xóa đại lý "${agent.agentName || agent.name}" do đại lý đã có phiếu xuất/nhập trong hệ thống!`;
							} else {
								errorMessage = errorData.message;
							}
						} else {
							errorMessage = 'Không thể xóa đại lý. Có thể đại lý còn nợ hoặc đã có giao dịch trong hệ thống!';
						}
					} else if (status === 500) {
						errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau!';
					} else {
						// Use error message from response if available
						// Sử dụng thông báo lỗi từ phản hồi nếu có
						if (errorData && errorData.message) {
							errorMessage = errorData.message;
						} else {
							const errorText = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
							errorMessage = `Lỗi HTTP ${status}: ${errorText || 'Không xác định'}`;
						}
					}
				} catch (parseError) {
					console.error('Error parsing response:', parseError);
					if (status === 400) {
						errorMessage = `Không thể xóa đại lý "${agent.agentName || agent.name}". Có thể đại lý còn nợ hoặc đã có giao dịch trong hệ thống!`;
					}
				}
				
				toast.error(errorMessage, {
					autoClose: 5000, // Show longer for debt-related messages
					hideProgressBar: false,
				});
			} else if (error.request) {
				// Network error
				// Lỗi mạng
				console.error('❌ Network error:', error.request);
				toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối!');
			} else {
				// Other error
				// Lỗi khác
				console.error('❌ Other error:', error.message);
				toast.error('Đã xảy ra lỗi khi xóa đại lý!');
			}
		} finally {
			setLoading(false);
		}
	};

	// Helper function to format currency
	// Hàm hỗ trợ định dạng tiền tệ
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
	};

	// Helper function to decode and validate JWT token
	// Hàm hỗ trợ giải mã và kiểm tra JWT token
	const decodeAndValidateToken = (token) => {
		try {
			// Decode JWT payload (without verification - only for debugging)
			// Giải mã payload JWT (không xác thực - chỉ để debug)
			const payload = JSON.parse(atob(token.split('.')[1]));
			console.log('🔍 Token payload:', payload);
			console.log('🕐 Token exp:', new Date(payload.exp * 1000));
			console.log('🕐 Current time:', new Date());
			console.log('👤 User info:', payload.sub || payload.username || 'Unknown');
			
			// Check if token is expired
			// Kiểm tra token hết hạn
			const isExpired = payload.exp * 1000 < Date.now();
			if (isExpired) {
				console.warn('⚠️ Token is expired!');
				return { expired: true, payload };
			}
			
			return { expired: false, payload };
		} catch (error) {
			console.error('❌ Error decoding token:', error);
			return { error: true, message: error.message };
		}
	};

	// Don't render if no agent data
	// Không render nếu không có dữ liệu đại lý
	if (!agent) {
		return null;
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
			<div className="bg-white rounded-2xl p-8 w-[450px] text-gray-800 shadow-2xl transform transition-all duration-300 scale-100">
				{/* Header */}
				{/* Tiêu đề */}
				<div className="flex justify-between items-start mb-6">
					<div className="flex items-center gap-3">
						<div className="p-3 bg-red-100 rounded-full">
							<FiAlertTriangle className="text-red-600 text-2xl" />
						</div>
						<h2 className="text-2xl font-bold text-red-600">
							Xác Nhận Xóa
						</h2>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
						disabled={loading}
					>
						<FiX className="text-gray-500 hover:text-gray-700 text-xl" />
					</button>
				</div>

				{/* Content */}
				{/* Nội dung */}
				<div className="mb-8">
					<p className="text-gray-700 text-lg leading-relaxed">
						Bạn có chắc chắn muốn xóa đại lý{' '}
						<span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
							{agent.agentName || agent.name || 'Không xác định'}
						</span>{' '}
						không?
					</p>
					
					{/* Additional agent info */}
					{/* Thông tin bổ sung về đại lý */}
					{(agent.agentCode || agent.code) && (
						<p className="text-gray-600 text-sm mt-2">
							Mã đại lý: <span className="font-medium">{agent.agentCode || agent.code}</span>
						</p>
					)}

					{/* Debt information */}
					{/* Thông tin công nợ */}
					<div className="mt-4">
						{loadingDebt ? (
							<div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
								<span className="text-blue-700 text-sm">Đang kiểm tra công nợ...</span>
							</div>
						) : agentDebt !== null ? (
							<div className="space-y-3">
								{/* Debt Limit Warning - Highest Priority */}
								{/* Cảnh báo giới hạn nợ - Ưu tiên cao nhất */}
								{agentDebt.maxDebt && agentDebt.debtMoney > 0 && (agentDebt.isDebtExceeded || agentDebt.debtMoney / agentDebt.maxDebt > 0.8) && (
									<DebtLimitWarning
										debtAmount={agentDebt.debtMoney}
										maxDebt={agentDebt.maxDebt}
										agentTypeName={agentDebt.agentTypeName}
										agentName={agent.agentName || agent.name}
										size="md"
										showDetails={true}
										variant="alert"
									/>
								)}

								{/* Normal Debt Information */}
								{/* Thông tin công nợ thông thường */}
								<div className={`p-3 border rounded-lg ${
									agentDebt.isDebtExceeded 
										? 'bg-red-50 border-red-200'
										: agentDebt.hasDebt || (agentDebt.debtMoney && agentDebt.debtMoney > 0)
											? 'bg-yellow-50 border-yellow-200'
											: 'bg-green-50 border-green-200'
								}`}>
									<div className="flex items-center gap-2">
										<FiDollarSign className={`${
											agentDebt.isDebtExceeded
												? 'text-red-600'
												: agentDebt.hasDebt || (agentDebt.debtMoney && agentDebt.debtMoney > 0)
													? 'text-yellow-600'
													: 'text-green-600'
										}`} />
										<div className="flex-1">
											<span className={`text-sm font-medium ${
												agentDebt.isDebtExceeded
													? 'text-red-700'
													: agentDebt.hasDebt || (agentDebt.debtMoney && agentDebt.debtMoney > 0)
														? 'text-yellow-700'
														: 'text-green-700'
											}`}>
												{agentDebt.hasDebt || (agentDebt.debtMoney && agentDebt.debtMoney > 0)
													? `Đại lý có công nợ`
													: 'Đại lý không có công nợ'
												}
											</span>
											<div className="grid grid-cols-1 gap-1 mt-2 text-xs">
												<div className={`${
													agentDebt.isDebtExceeded
														? 'text-red-600'
														: agentDebt.hasDebt || (agentDebt.debtMoney && agentDebt.debtMoney > 0)
															? 'text-yellow-600'
															: 'text-green-600'
												}`}>
													Số tiền nợ hiện tại: <span className="font-semibold">{formatCurrency(agentDebt.debtMoney || 0)}</span>
												</div>
												{agentDebt.maxDebt && (
													<>
														<div className="text-gray-600">
															Giới hạn tối đa: <span className="font-semibold">{formatCurrency(agentDebt.maxDebt)}</span>
														</div>
														{!agentDebt.isDebtExceeded && agentDebt.remainingLimit !== null && (
															<div className="text-blue-600">
																Còn lại có thể nợ: <span className="font-semibold">{formatCurrency(agentDebt.remainingLimit)}</span>
															</div>
														)}
													</>
												)}
											</div>
										</div>
									</div>
								</div>

								{/* Action Warning */}
								{/* Cảnh báo hành động */}
								{(agentDebt.hasDebt || (agentDebt.debtMoney && agentDebt.debtMoney > 0)) && (
									<div className={`p-2 border rounded text-xs ${
										agentDebt.isDebtExceeded
											? 'bg-red-100 border-red-200 text-red-700'
											: 'bg-yellow-100 border-yellow-200 text-yellow-700'
									}`}>
										<div className="flex items-center gap-1">
											<FiAlertTriangle className={agentDebt.isDebtExceeded ? 'text-red-500' : 'text-yellow-500'} />
											<span className="font-medium">Lưu ý:</span>
											{agentDebt.isDebtExceeded 
												? 'Không thể xóa vì số tiền nợ vượt quá giới hạn cho phép!'
												: 'Không thể xóa vì đại lý còn nợ!'
											}
										</div>
									</div>
								)}

								{agentDebt.error && (
									<div className="mt-2 text-xs text-gray-500 p-2 bg-gray-100 rounded">
										⚠️ Không thể lấy thông tin nợ chi tiết
									</div>
								)}
							</div>
						) : (
							<div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
								<div className="flex items-center gap-2">
									<FiDollarSign className="text-gray-400" />
									<span className="text-gray-600 text-sm">
										Chưa có thông tin công nợ
									</span>
								</div>
							</div>
						)}
					</div>
					
					{/* Debug info in development */}
					{/* Thông tin debug khi phát triển */}
					{process.env.NODE_ENV === 'development' && (
						<p className="text-xs text-gray-500 mt-2">
							Agent ID: {agent?.agentID || agent?.agentId || 'Không có'}
						</p>
					)}
					
					<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-700 text-sm">
							<strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
						</p>
					</div>
				</div>

				{/* Buttons */}
				{/* Các nút thao tác */}
				<div className="flex justify-end space-x-3">
					<button
						className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300"
						onClick={onClose}
						disabled={loading}
					>
						Hủy
					</button>
					<button
						className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 ${
							loading ? 'opacity-75 cursor-not-allowed' : ''
						}`}
						onClick={handleDelete}
						disabled={loading}
					>
						{loading ? (
							<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
						) : (
							<FiTrash2 />
						)}
						{loading ? 'Đang xóa...' : 'Xóa'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteAgentPopup;
