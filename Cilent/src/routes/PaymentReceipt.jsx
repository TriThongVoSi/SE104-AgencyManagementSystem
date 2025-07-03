import React, { useEffect, useState } from 'react';
import { FaEye, FaPlus, FaSearch, FaCalendarAlt, FaMoneyBillWave, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import AddReceiptPopup from '../layouts/components/payment/AddReceiptPopup';
import ViewReceiptPopup from '../layouts/components/payment/ViewReceiptPopup';
import paymentReceiptService from '../utils/paymentReceiptService';

const PaymentReceipt = () => {
  const { user } = useAuth();
	const [receipts, setReceipts] = useState([]);
	const [originalReceipts, setOriginalReceipts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [showAddPopup, setShowAddPopup] = useState(false);
	const [selectedReceipt, setSelectedReceipt] = useState(null);
	
	// Filter states
	const [filterVisible, setFilterVisible] = useState(false);
	const [dateFilter, setDateFilter] = useState({
		startDate: '',
		endDate: ''
	});
	const [agentFilter, setAgentFilter] = useState('');

	// Statistics
	const [statistics, setStatistics] = useState({
		totalReceipts: 0,
		totalRevenue: 0,
		filteredReceipts: 0,
		filteredRevenue: 0
	});

	/**
	 * Fetch danh sách phiếu thu tiền
	 */
	const fetchReceipts = async () => {
		if (!paymentReceiptService.canViewPaymentReceipts(user?.role)) {
			toast.error('Bạn không có quyền xem phiếu thu tiền');
			return;
		}

		setLoading(true);
		try {
			const result = await paymentReceiptService.getAllPaymentReceipts();
			
			if (result.success) {
				setOriginalReceipts(result.data);
				setReceipts(result.data);
				calculateStatistics(result.data, result.data);
				toast.success(result.message);
			} else {
				toast.error(result.error);
				setReceipts([]);
				setOriginalReceipts([]);
			}
		} catch (error) {
			console.error('Error fetching receipts:', error);
			toast.error('Có lỗi khi lấy danh sách phiếu thu');
			setReceipts([]);
			setOriginalReceipts([]);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Tính toán thống kê
	 */
	const calculateStatistics = (allReceipts, filteredReceipts) => {
		setStatistics({
			totalReceipts: allReceipts.length,
			totalRevenue: paymentReceiptService.calculateTotalRevenue(allReceipts),
			filteredReceipts: filteredReceipts.length,
			filteredRevenue: paymentReceiptService.calculateTotalRevenue(filteredReceipts)
		});
	};

	/**
	 * Áp dụng bộ lọc
	 */
	const applyFilters = () => {
		let filtered = [...originalReceipts];

		// Filter by search term
		if (searchTerm.trim()) {
			filtered = paymentReceiptService.filterReceipts(filtered, searchTerm);
		}

		// Filter by date range
		if (dateFilter.startDate && dateFilter.endDate) {
			filtered = paymentReceiptService.filterReceiptsByDateRange(
				filtered,
				dateFilter.startDate,
				dateFilter.endDate
			);
		}

		// Filter by agent
		if (agentFilter.trim()) {
			const agentLower = agentFilter.toLowerCase();
			filtered = filtered.filter(receipt => 
				receipt.agent?.agentName?.toLowerCase().includes(agentLower)
			);
		}

		setReceipts(filtered);
		calculateStatistics(originalReceipts, filtered);
	};

	/**
	 * Reset bộ lọc
	 */
	const resetFilters = () => {
		setSearchTerm('');
		setDateFilter({ startDate: '', endDate: '' });
		setAgentFilter('');
		setReceipts(originalReceipts);
		calculateStatistics(originalReceipts, originalReceipts);
	};

	/**
	 * Xử lý khi thêm phiếu thu thành công
	 */
	const handleReceiptAdded = () => {
		fetchReceipts();
		setShowAddPopup(false);
	};

	// Effects
	useEffect(() => {
		fetchReceipts();
	}, []);

	useEffect(() => {
		applyFilters();
	}, [searchTerm, dateFilter, agentFilter, originalReceipts]);

	// Check permissions
	const canCreateReceipt = paymentReceiptService.canCreatePaymentReceipt(user?.role);

	return (
		<div className="p-6 bg-gray-900 min-h-screen text-white">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-yellow-400">
					Phiếu Thu Tiền
				</h1>
				<p className="text-gray-400 mt-2">
					Tạo phiếu thu và xem lịch sử thu tiền từ các đại lý
				</p>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-gray-800 p-4 rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-sm">Tổng phiếu thu</p>
							<p className="text-white text-xl font-bold">{statistics.totalReceipts}</p>
						</div>
						<FaMoneyBillWave className="text-yellow-400 text-2xl" />
					</div>
				</div>
				
				<div className="bg-gray-800 p-4 rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-sm">Tổng tiền thu</p>
							<p className="text-white text-xl font-bold">
								{paymentReceiptService.formatCurrency(statistics.totalRevenue)}
							</p>
						</div>
						<FaMoneyBillWave className="text-green-400 text-2xl" />
					</div>
				</div>

				<div className="bg-gray-800 p-4 rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-sm">Phiếu hiển thị</p>
							<p className="text-white text-xl font-bold">{statistics.filteredReceipts}</p>
						</div>
						<FaFilter className="text-blue-400 text-2xl" />
					</div>
				</div>

				<div className="bg-gray-800 p-4 rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-400 text-sm">Tiền thu hiển thị</p>
							<p className="text-white text-xl font-bold">
								{paymentReceiptService.formatCurrency(statistics.filteredRevenue)}
							</p>
						</div>
						<FaMoneyBillWave className="text-purple-400 text-2xl" />
					</div>
				</div>
			</div>

			{/* Search & Actions */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
				<div className="flex flex-col sm:flex-row gap-4 flex-1">
					{/* Search input */}
					<div className="relative">
						<input
							type="text"
							style={{ color: 'white' }}
							placeholder="Tìm theo tên đại lý, ngày, số tiền..."
							className="w-full lg:w-80 p-2 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
					</div>

					{/* Filter toggle */}
					<button
						onClick={() => setFilterVisible(!filterVisible)}
						className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
							filterVisible ? 'bg-yellow-600' : 'bg-gray-700'
						} hover:bg-yellow-700 transition-colors`}
					>
						<FaFilter />
						Bộ lọc
					</button>
				</div>

				{/* Add receipt button */}
				{canCreateReceipt && (
					<button
						className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
						onClick={() => setShowAddPopup(true)}
						disabled={loading}
					>
						<FaPlus /> Tạo Phiếu Thu
					</button>
				)}
			</div>

			{/* Advanced Filters */}
			{filterVisible && (
				<div className="bg-gray-800 p-4 rounded-lg mb-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Từ ngày
							</label>
							<input
								type="date"
								className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
								value={dateFilter.startDate}
								onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
							/>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Đến ngày
							</label>
							<input
								type="date"
								className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
								value={dateFilter.endDate}
								onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
							/>
						</div>

						
					</div>
					
					<div className="flex justify-end gap-2 mt-4">
						<button
							onClick={resetFilters}
							className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
						>
							Xóa bộ lọc
						</button>
					</div>
				</div>
			)}

			{/* Loading */}
			{loading && (
				<div className="text-center py-8">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
					<p className="mt-2 text-gray-400">Đang tải dữ liệu...</p>
				</div>
			)}

			{/* Data table */}
			{!loading && (
				<div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead className="bg-gray-700">
								<tr>
									<th className="py-3 px-4 font-medium">STT</th>
									<th className="py-3 px-4 font-medium">Mã phiếu</th>
									<th className="py-3 px-4 font-medium">Tên đại lý</th>
									<th className="py-3 px-4 font-medium">Ngày thu tiền</th>
									<th className="py-3 px-4 font-medium">Số tiền thu</th>
									<th className="py-3 px-4 font-medium">Hành động</th>
								</tr>
							</thead>
							<tbody>
								{receipts.length === 0 ? (
									<tr>
										<td colSpan="6" className="py-8 px-4 text-center text-gray-400">
											{originalReceipts.length === 0 
												? 'Chưa có phiếu thu tiền nào' 
												: 'Không tìm thấy phiếu thu phù hợp với bộ lọc'
											}
										</td>
									</tr>
								) : (
									receipts.map((receipt, index) => (
										<tr
											key={receipt.paymentId}
											className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
										>
											<td className="py-3 px-4 text-gray-300">
												{index + 1}
											</td>
											<td className="py-3 px-4 font-medium">
												#{receipt.paymentId}
											</td>
											<td className="py-3 px-4">
												{receipt.agent?.agentName || 'N/A'}
											</td>
											<td className="py-3 px-4">
												<div className="flex items-center gap-2">
													<FaCalendarAlt className="text-blue-400 text-sm" />
													{paymentReceiptService.formatDate(receipt.paymentDate)}
												</div>
											</td>
											<td className="py-3 px-4 font-bold text-green-400">
												{paymentReceiptService.formatCurrency(receipt.revenue)}
											</td>
											<td className="py-3 px-4">
												<button
													onClick={() => setSelectedReceipt(receipt)}
													className="text-green-400 hover:text-green-300 transition-colors p-2"
													title="Xem chi tiết"
												>
													<FaEye />
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Popups */}
			{showAddPopup && (
				<AddReceiptPopup
					onClose={() => setShowAddPopup(false)}
					onAdded={handleReceiptAdded}
				/>
			)}

			{selectedReceipt && (
				<ViewReceiptPopup
					receipt={selectedReceipt}
					onClose={() => setSelectedReceipt(null)}
				/>
			)}
		</div>
	);
};

export default PaymentReceipt;
