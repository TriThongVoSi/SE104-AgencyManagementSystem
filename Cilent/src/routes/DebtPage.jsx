import React, { useEffect, useState } from 'react';
import { FaSearch, FaEye, FaSyncAlt, FaList, FaUsers, FaSpinner, FaExclamationTriangle, FaPlug } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { debtReportApi } from '../utils/debtReportService';

const DebtPage = () => {
	const [debts, setDebts] = useState([]);
	const [allDebts, setAllDebts] = useState([]);
	const [specificDebt, setSpecificDebt] = useState(null);
	const [month, setMonth] = useState('');
	const [year, setYear] = useState('');
	const [selectedAgentId, setSelectedAgentId] = useState('');
	const [selectedDebt, setSelectedDebt] = useState(null);
	const [showDetailPopup, setShowDetailPopup] = useState(false);
	const [agents, setAgents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [viewMode, setViewMode] = useState('all'); // 'all', 'filtered', 'specific'
	const [apiStatus, setApiStatus] = useState({ connected: null, error: null });

	// Test API connection
	const testConnection = async () => {
		console.log('🧪 Testing API connection...');
		try {
			const result = await debtReportApi.testConnection();
			setApiStatus({ connected: result.healthy, error: result.error || null });
			
			if (result.healthy) {
				toast.success('✅ Kết nối API thành công!');
			} else {
				toast.warning('⚠️ API có thể chưa sẵn sàng, nhưng vẫn thử kết nối...');
			}
		} catch (error) {
			console.error('❌ Connection test failed:', error);
			setApiStatus({ connected: false, error: error.message });
			toast.error('❌ Không thể kết nối tới API server');
		}
	};

	// Fetch all debt reports
	const fetchAllDebts = async () => {
		console.log('🔄 Starting fetchAllDebts...');
		setLoading(true);
		try {
			// Check if token exists first
			const token = localStorage.getItem('authToken') || localStorage.getItem('token');
			if (!token) {
				throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
			}

			const data = await debtReportApi.getAllDebtReports();
			console.log('📋 Raw debt reports data:', data);
			
			if (!Array.isArray(data)) {
				console.warn('⚠️ Data is not an array:', data);
				setAllDebts([]);
				toast.info('Không có dữ liệu báo cáo công nợ');
				return;
			}

			// Transform data to match display format
			const transformedData = data.map(item => {
				console.log('🔄 Transforming item:', item);
				return {
					debtReportID: item.debtReportId,
					month: item.month,
					year: item.year,
					agentName: item.agent?.agentName || 'N/A',
					agentId: item.agent?.agentId,
					agentType: item.agent?.agentType?.agentTypeName || 'N/A',
					maximumDebt: item.agent?.agentType?.maximumDebt || 0,
					phone: item.agent?.phone || 'N/A',
					email: item.agent?.email || 'N/A',
					address: item.agent?.address || 'N/A',
					district: item.agent?.district?.districtName || 'N/A',
					receptionDate: item.agent?.receptionDate || 'N/A',
					currentDebt: item.agent?.debtMoney || 0,
					firstDebt: item.firstDebt || 0,
					arisenDebt: item.arisenDebt || 0,
					lastDebt: item.lastDebt || 0
				};
			});
			
			console.log('✅ Transformed debt reports:', transformedData);
			setAllDebts(transformedData);
			toast.success(`✅ Tải thành công ${transformedData.length} báo cáo công nợ`);
		} catch (err) {
			console.error('❌ Error in fetchAllDebts:', err);
			setAllDebts([]);
			
			if (err.message.includes('token') || err.message.includes('Token expired')) {
				toast.error('🔐 ' + err.message);
				// Could redirect to login here
			} else if (err.message.includes('No authentication token found')) {
				toast.error('🔐 Vui lòng đăng nhập để xem báo cáo công nợ');
			} else {
				toast.error('❌ Lỗi tải báo cáo: ' + err.message);
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch debt report for specific agent/month/year
	const fetchSpecificDebtReport = async () => {
		if (!month || !year || !selectedAgentId) {
			toast.warning('Vui lòng chọn đầy đủ tháng, năm và đại lý');
			return;
		}

		console.log(`🔄 Fetching specific debt report: agent=${selectedAgentId}, month=${month}, year=${year}`);
		setLoading(true);
		try {
			const token = localStorage.getItem('authToken') || localStorage.getItem('token');
			if (!token) {
				throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
			}

			const data = await debtReportApi.getDebtReport(month, year, selectedAgentId);
			console.log('📋 Specific debt report data:', data);
			
			if (!data) {
				setSpecificDebt(null);
				toast.info('Không tìm thấy báo cáo công nợ cho thông tin đã chọn');
				return;
			}

			// Transform single debt report
			const transformedData = {
				debtReportID: data.debtReportId,
				month: data.month,
				year: data.year,
				agentName: data.agent?.agentName || 'N/A',
				agentId: data.agent?.agentId,
				agentType: data.agent?.agentType?.agentTypeName || 'N/A',
				maximumDebt: data.agent?.agentType?.maximumDebt || 0,
				phone: data.agent?.phone || 'N/A',
				email: data.agent?.email || 'N/A',
				address: data.agent?.address || 'N/A',
				district: data.agent?.district?.districtName || 'N/A',
				receptionDate: data.agent?.receptionDate || 'N/A',
				currentDebt: data.agent?.debtMoney || 0,
				firstDebt: data.firstDebt || 0,
				arisenDebt: data.arisenDebt || 0,
				lastDebt: data.lastDebt || 0
			};
			
			console.log('✅ Transformed specific debt report:', transformedData);
			setSpecificDebt(transformedData);
			toast.success('✅ Tìm thấy báo cáo công nợ');
		} catch (err) {
			console.error('❌ Error in fetchSpecificDebtReport:', err);
			setSpecificDebt(null);
			
			if (err.message.includes('token') || err.message.includes('Token expired')) {
				toast.error('🔐 ' + err.message);
			} else {
				toast.error('❌ Lỗi tải báo cáo: ' + err.message);
			}
		} finally {
			setLoading(false);
		}
	};

	// Summarize debt reports by month/year
	const summarizeDebtReports = async () => {
		if (!month || !year) {
			toast.warning('Vui lòng chọn tháng và năm');
			return;
		}

		console.log(`🔄 Summarizing debt reports: month=${month}, year=${year}`);
		setLoading(true);
		try {
			const token = localStorage.getItem('authToken') || localStorage.getItem('token');
			if (!token) {
				throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
			}

			const data = await debtReportApi.summarizeDebtReports(month, year);
			console.log('📋 Summarized debt reports data:', data);
			
			if (!Array.isArray(data)) {
				console.warn('⚠️ Summarized data is not an array:', data);
				setDebts([]);
				toast.info('Không có dữ liệu báo cáo công nợ cho tháng/năm đã chọn');
				return;
			}

			// Transform summarized data
			const transformedData = data.map(item => ({
				debtReportID: item.debtReportId,
				month: item.month,
				year: item.year,
				agentName: item.agent?.agentName || 'N/A',
				agentId: item.agent?.agentId,
				agentType: item.agent?.agentType?.agentTypeName || 'N/A',
				maximumDebt: item.agent?.agentType?.maximumDebt || 0,
				phone: item.agent?.phone || 'N/A',
				email: item.agent?.email || 'N/A',
				address: item.agent?.address || 'N/A',
				district: item.agent?.district?.districtName || 'N/A',
				receptionDate: item.agent?.receptionDate || 'N/A',
				currentDebt: item.agent?.debtMoney || 0,
				firstDebt: item.firstDebt || 0,
				arisenDebt: item.arisenDebt || 0,
				lastDebt: item.lastDebt || 0
			}));
			
			console.log('✅ Transformed summarized debt reports:', transformedData);
			setDebts(transformedData);
			toast.success(`✅ Tổng hợp thành công ${transformedData.length} báo cáo công nợ`);
		} catch (err) {
			console.error('❌ Error in summarizeDebtReports:', err);
			setDebts([]);
			
			if (err.message.includes('token') || err.message.includes('Token expired')) {
				toast.error('🔐 ' + err.message);
			} else {
				toast.error('❌ Lỗi tổng hợp báo cáo: ' + err.message);
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch all agents
	const fetchAgents = async () => {
		console.log('🔄 Fetching agents...');
		try {
			const data = await debtReportApi.getAllAgents();
			console.log('📋 Agents data:', data);
			
			if (Array.isArray(data) && data.length > 0) {
				setAgents(data);
				toast.success(`✅ Tải thành công ${data.length} đại lý`);
			} else {
				console.warn('⚠️ No agents returned or empty array');
				setAgents([]);
				toast.warning('⚠️ Không tìm thấy đại lý nào');
			}
		} catch (err) {
			console.error('❌ Error in fetchAgents:', err);
			setAgents([]);
			
			if (err.message.includes('token') || err.message.includes('Token expired')) {
				toast.error('🔐 ' + err.message);
			} else {
				toast.warning('⚠️ Không thể tải danh sách đại lý: ' + err.message);
			}
		}
	};

	useEffect(() => {
		console.log('🏁 Component mounted, starting initialization...');
		testConnection();
		fetchAgents();
		fetchAllDebts();
	}, []);

	useEffect(() => {
		if (viewMode === 'filtered' && month && year) {
			summarizeDebtReports();
		} else if (viewMode === 'specific' && month && year && selectedAgentId) {
			fetchSpecificDebtReport();
		}
	}, [month, year, selectedAgentId, viewMode]);

	// Get current data to display based on view mode
	const getCurrentDebts = () => {
		if (viewMode === 'all') {
			return allDebts;
		} else if (viewMode === 'filtered') {
			return debts;
		} else if (viewMode === 'specific' && specificDebt) {
			return [specificDebt];
		}
		return [];
	};

	const currentDebts = getCurrentDebts();

	return (
		<div className="p-6 bg-gray-900 min-h-screen text-white">
			{/* Loading State */}
			{loading && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 flex items-center gap-4 border border-gray-700">
						<FaSpinner className="animate-spin text-2xl text-blue-400" />
						<p className="text-lg font-medium text-white">Đang tải dữ liệu...</p>
					</div>
				</div>
			)}

			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-yellow-400">
						📊 Báo cáo công nợ đại lý
					</h1>
					{/* API Status */}
					{apiStatus.connected !== null && (
						<div className="mt-2 flex items-center gap-2">
							{apiStatus.connected === true ? (
								<>
									<div className="w-2 h-2 bg-green-500 rounded-full"></div>
									<span className="text-green-400 text-sm">API kết nối thành công</span>
								</>
							) : apiStatus.connected === false ? (
								<>
								
									
								</>
							) : (
								<>
									<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
									<span className="text-yellow-400 text-sm">Đang kiểm tra API...</span>
								</>
							)}
						</div>
					)}
				</div>
				
				{/* View Mode Toggle */}
				<div className="flex gap-2">
					<button
						onClick={() => setViewMode('all')}
						className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
							viewMode === 'all' 
								? 'bg-blue-600 text-white' 
								: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
						}`}
					>
						<FaList size={16} />
						Tất cả báo cáo
					</button>
					<button
						onClick={() => setViewMode('filtered')}
						className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
							viewMode === 'filtered' 
								? 'bg-purple-600 text-white' 
								: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
						}`}
					>
						<FaSearch size={16} />
						Theo tháng/năm
					</button>
					<button
						onClick={() => setViewMode('specific')}
						className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
							viewMode === 'specific' 
								? 'bg-green-600 text-white' 
								: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
						}`}
					>
						<FaUsers size={16} />
						Theo đại lý
					</button>
					<button
						onClick={() => {
							if (viewMode === 'all') fetchAllDebts();
							else if (viewMode === 'filtered') summarizeDebtReports();
							else if (viewMode === 'specific') fetchSpecificDebtReport();
						}}
						disabled={loading}
						className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						<FaSyncAlt size={16} />
						Làm mới
					</button>
				</div>
			</div>

			{/* Debug Info */}
			{apiStatus.error && (
				<div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
					<div className="flex items-center gap-2">
						<FaExclamationTriangle className="text-red-400" />
						<div>
							<h4 className="text-red-300 font-medium">Lỗi kết nối API</h4>
							<p className="text-red-400 text-sm">{apiStatus.error}</p>
							<p className="text-red-400 text-xs mt-1">
								Kiểm tra: Backend có đang chạy? Token có hợp lệ? CORS có được cấu hình?
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Filter Controls */}
			{(viewMode === 'filtered' || viewMode === 'specific') && (
				<div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
					<h3 className="text-lg font-semibold text-white mb-4">
						{viewMode === 'filtered' ? 'Lọc theo tháng/năm' : 'Tìm báo cáo cụ thể'}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<select
							value={month}
							onChange={(e) => setMonth(e.target.value)}
							className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
						>
							<option value="">-- Chọn Tháng --</option>
							{[...Array(12)].map((_, i) => (
								<option key={i + 1} value={i + 1}>
									Tháng {i + 1}
								</option>
							))}
						</select>

						<select
							value={year}
							onChange={(e) => setYear(e.target.value)}
							className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
						>
							<option value="">-- Chọn Năm --</option>
							{[2023, 2024, 2025, 2026].map((y) => (
								<option key={y} value={y}>
									{y}
								</option>
							))}
						</select>

						{viewMode === 'specific' && (
							<select
								value={selectedAgentId}
								onChange={(e) => setSelectedAgentId(e.target.value)}
								className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
							>
								<option value="">-- Chọn Đại Lý --</option>
								{agents.map((agent) => (
									<option key={agent.agentID || agent.agentId} value={agent.agentID || agent.agentId}>
										{agent.agentName}
									</option>
								))}
							</select>
						)}

						{viewMode === 'filtered' && (
							<button
								onClick={summarizeDebtReports}
								disabled={loading || !month || !year}
								className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Tổng hợp báo cáo
							</button>
						)}

						{viewMode === 'specific' && (
							<button
								onClick={fetchSpecificDebtReport}
								disabled={loading || !month || !year || !selectedAgentId}
								className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Tìm báo cáo
							</button>
						)}
					</div>
				</div>
			)}

			{/* Debt Reports Table */}
			<div className="bg-gray-800 p-6 rounded-lg shadow-lg overflow-x-auto">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold text-yellow-400">
						{viewMode === 'all' 
							? 'Tất cả báo cáo công nợ' 
							: viewMode === 'filtered'
							? `Báo cáo công nợ ${month && year ? `- Tháng ${month}/${year}` : ''}`
							: `Báo cáo công nợ cụ thể ${month && year && selectedAgentId ? `- Tháng ${month}/${year}` : ''}`
						}
					</h2>
					<div className="text-sm text-gray-400">
						Tổng: {currentDebts.length} báo cáo
					</div>
				</div>

				<table className="w-full text-left">
					<thead>
						<tr className="border-b border-gray-700 bg-gray-700">
							<th className="py-3 px-4 font-semibold">STT</th>
							<th className="py-3 px-4 font-semibold">Tên Đại Lý</th>
							{viewMode === 'all' && <th className="py-3 px-4 font-semibold">Tháng/Năm</th>}
							{viewMode === 'all' && <th className="py-3 px-4 font-semibold">Loại Đại Lý</th>}
							<th className="py-3 px-4 font-semibold text-right">Nợ Đầu Kỳ</th>
							<th className="py-3 px-4 font-semibold text-right">Phát Sinh</th>
							<th className="py-3 px-4 font-semibold text-right">Nợ Cuối Kỳ</th>
							{viewMode === 'all' && <th className="py-3 px-4 font-semibold text-right">Nợ Hiện Tại</th>}
							<th className="py-3 px-4 font-semibold text-center">Hành động</th>
						</tr>
					</thead>
					<tbody>
						{currentDebts.length === 0 ? (
							<tr>
								<td colSpan={viewMode === 'all' ? "9" : "6"} className="py-8 px-4 text-center text-gray-400">
									{loading ? 'Đang tải dữ liệu...' : 
									 viewMode === 'all' ? 'Không có dữ liệu báo cáo công nợ' :
									 viewMode === 'filtered' ? (month && year ? 'Không có dữ liệu báo cáo công nợ cho tháng/năm đã chọn' : 'Vui lòng chọn tháng và năm để xem báo cáo') :
									 'Vui lòng chọn đầy đủ thông tin để tìm báo cáo'}
								</td>
							</tr>
						) : (
							currentDebts.map((d, i) => (
								<tr
									key={d.debtReportID}
									className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
								>
									<td className="py-3 px-4">{i + 1}</td>
									<td className="py-3 px-4 font-medium">{d.agentName}</td>
									{viewMode === 'all' && (
										<td className="py-3 px-4">
											<span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
												{d.month}/{d.year}
											</span>
										</td>
									)}
									{viewMode === 'all' && (
										<td className="py-3 px-4">
											<span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
												{d.agentType}
											</span>
										</td>
									)}
									<td className="py-3 px-4 text-right">
										<span className={d.firstDebt > 0 ? 'text-red-400' : 'text-green-400'}>
											{d.firstDebt.toLocaleString()}₫
										</span>
									</td>
									<td className="py-3 px-4 text-right">
										<span className={d.arisenDebt > 0 ? 'text-red-400' : 'text-green-400'}>
											{d.arisenDebt.toLocaleString()}₫
										</span>
									</td>
									<td className="py-3 px-4 text-right">
										<span className={d.lastDebt > 0 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
											{d.lastDebt.toLocaleString()}₫
										</span>
									</td>
									{viewMode === 'all' && (
										<td className="py-3 px-4 text-right">
											<span className={d.currentDebt > 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
												{d.currentDebt.toLocaleString()}₫
											</span>
										</td>
									)}
									<td className="py-3 px-4 text-center">
										<button
											onClick={() => {
												setSelectedDebt(d);
												setShowDetailPopup(true);
											}}
											className="text-blue-400 hover:text-blue-300 transition-colors"
											title="Xem chi tiết"
										>
											<FaEye size={18} />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Detail Popup */}
			{showDetailPopup && selectedDebt && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
					<div className="bg-white text-black p-6 rounded-lg w-[700px] max-h-[80vh] overflow-y-auto">
						<h2 className="text-xl font-bold mb-4 text-gray-800">
							Chi Tiết Công Nợ - {selectedDebt.agentName}
						</h2>
						
						<div className="grid grid-cols-2 gap-4 mb-6">
							<div className="space-y-3">
								<div className="flex justify-between">
									<strong>Tháng/Năm:</strong>
									<span>{selectedDebt.month}/{selectedDebt.year}</span>
								</div>
								<div className="flex justify-between">
									<strong>Loại đại lý:</strong>
									<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
										{selectedDebt.agentType}
									</span>
								</div>
								<div className="flex justify-between">
									<strong>Quận/Huyện:</strong>
									<span>{selectedDebt.district}</span>
								</div>
								<div className="flex justify-between">
									<strong>Số điện thoại:</strong>
									<span>{selectedDebt.phone}</span>
								</div>
								<div className="flex justify-between">
									<strong>Email:</strong>
									<span>{selectedDebt.email}</span>
								</div>
							</div>
							
							<div className="space-y-3">
								<div className="flex justify-between">
									<strong>Nợ đầu kỳ:</strong>
									<span className={selectedDebt.firstDebt > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
										{selectedDebt.firstDebt.toLocaleString()}₫
									</span>
								</div>
								<div className="flex justify-between">
									<strong>Phát sinh:</strong>
									<span className={selectedDebt.arisenDebt > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
										{selectedDebt.arisenDebt.toLocaleString()}₫
									</span>
								</div>
								<div className="flex justify-between border-t pt-2">
									<strong>Nợ cuối kỳ:</strong>
									<span className={selectedDebt.lastDebt > 0 ? 'text-red-600 font-bold text-lg' : 'text-green-600 font-bold text-lg'}>
										{selectedDebt.lastDebt.toLocaleString()}₫
									</span>
								</div>
								<div className="flex justify-between border-t pt-2">
									<strong>Nợ hiện tại:</strong>
									<span className={selectedDebt.currentDebt > 0 ? 'text-red-600 font-bold text-lg' : 'text-green-600 font-bold text-lg'}>
										{selectedDebt.currentDebt.toLocaleString()}₫
									</span>
								</div>
								<div className="flex justify-between">
									<strong>Giới hạn nợ:</strong>
									<span className="text-blue-600 font-semibold">
										{selectedDebt.maximumDebt.toLocaleString()}₫
									</span>
								</div>
							</div>
						</div>

						{selectedDebt.address && (
							<div className="mb-4">
								<strong>Địa chỉ:</strong>
								<p className="text-gray-600 mt-1">{selectedDebt.address}</p>
							</div>
						)}

						<div className="bg-gray-100 p-4 rounded-lg mb-4">
							<p className="text-sm text-gray-600 italic">
								<strong>Ghi chú:</strong> Báo cáo công nợ được tự động tạo và cập nhật khi có giao dịch xuất hàng hoặc thu tiền.
							</p>
						</div>

						<div className="flex justify-end space-x-3">
							<button
								onClick={() => setShowDetailPopup(false)}
								className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
							>
								Đóng
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DebtPage;
