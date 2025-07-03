import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
	FiPlus, 
	FiEye, 
	FiEdit, 
	FiTrash2, 
	FiSearch, 
	FiFilter,
	FiRefreshCw,
	FiPackage,
	FiTruck,
	FiCalendar,
	FiDollarSign,
	FiUser
} from 'react-icons/fi';
import exportReceiptService from '../../../utils/exportReceiptService';
import { getAllAgents } from '../../../utils/agentService';
import AddExportReceiptPopup from './AddExportReceiptPopup';
import EditExportReceiptModal from './EditExportReceiptModal';
import DeleteExportReceiptModal from './DeleteExportReceiptModal';
import ViewExportPopup from './ViewExportPopup';

/**
 * Component chính quản lý phiếu xuất hàng
 * 
 * Features:
 * - Hiển thị danh sách phiếu xuất
 * - Thêm phiếu xuất mới (nhiều sản phẩm)
 * - Xem chi tiết phiếu xuất
 * - Tìm kiếm và lọc
 * - Pagination
 * - Loading states
 * - Error handling
 */
const ExportReceiptManagement = () => {
	// States cho danh sách phiếu xuất
	const [exportReceipts, setExportReceipts] = useState([]);
	const [agents, setAgents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	
	// States cho search và filter
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedAgent, setSelectedAgent] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [dateFilter, setDateFilter] = useState('');
	
	// States cho pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(10);
	
	// States cho modals
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showViewPopup, setShowViewPopup] = useState(false);
	const [selectedReceipt, setSelectedReceipt] = useState(null);

	// Load dữ liệu ban đầu
	useEffect(() => {
		loadExportReceipts();
		loadAgents();
	}, []);

	// Load danh sách phiếu xuất
	const loadExportReceipts = async () => {
		setLoading(true);
		setError('');
		try {
			const data = await exportReceiptService.getAllExportReceipts();
			setExportReceipts(data || []);
		} catch (err) {
			console.error('Error loading export receipts:', err);
			setError('Không thể tải danh sách phiếu xuất hàng');
			setExportReceipts([]);
		} finally {
			setLoading(false);
		}
	};

	// Load danh sách đại lý cho filter
	const loadAgents = async () => {
		try {
			const result = await getAllAgents();
			if (result.status === 'success') {
				setAgents(result.data || []);
			}
		} catch (err) {
			console.error('Error loading agents:', err);
		}
	};

	// Xử lý thêm phiếu xuất mới
	const handleAddSuccess = () => {
		setShowAddModal(false);
		loadExportReceipts();
		toast.success('Thêm phiếu xuất hàng thành công!');
	};

	// Xử lý xem chi tiết
	const handleViewReceipt = (receipt) => {
		console.log('🔍 Viewing export receipt:', receipt);
		try {
			setSelectedReceipt(receipt);
			setShowViewPopup(true);
		} catch (error) {
			console.error('Error opening view popup:', error);
			toast.error('Không thể hiển thị chi tiết phiếu xuất');
		}
	};

	// Xử lý chỉnh sửa phiếu xuất
	const handleEditReceipt = (receipt) => {
		setSelectedReceipt(receipt);
		setShowEditModal(true);
	};

	// Xử lý success sau khi chỉnh sửa
	const handleEditSuccess = () => {
		setShowEditModal(false);
		setSelectedReceipt(null);
		loadExportReceipts();
		toast.success('Cập nhật phiếu xuất thành công!');
	};

	// Xử lý hủy chỉnh sửa
	const handleEditCancel = () => {
		setShowEditModal(false);
		setSelectedReceipt(null);
	};

	// Xử lý hiển thị modal xóa
	const handleShowDeleteModal = (receipt) => {
		setSelectedReceipt(receipt);
		setShowDeleteModal(true);
	};

	// Xử lý success sau khi xóa
	const handleDeleteSuccess = () => {
		setShowDeleteModal(false);
		setSelectedReceipt(null);
		loadExportReceipts();
		toast.success('Xóa phiếu xuất thành công!');
	};

	// Xử lý hủy xóa
	const handleDeleteCancel = () => {
		setShowDeleteModal(false);
		setSelectedReceipt(null);
	};

	// Xử lý xóa phiếu xuất (legacy - keep for backward compatibility)
	const handleDeleteReceipt = async (receiptId) => {
		if (window.confirm('Bạn có chắc chắn muốn xóa phiếu xuất này?')) {
			try {
				await exportReceiptService.deleteExportReceipt(receiptId);
				toast.success('Xóa phiếu xuất thành công!');
				loadExportReceipts();
			} catch (err) {
				console.error('Error deleting receipt:', err);
				toast.error('Không thể xóa phiếu xuất: ' + err.message);
			}
		}
	};

	// Filter dữ liệu
	const filteredReceipts = exportReceipts.filter(receipt => {
		// Filter by search term
		const matchesSearch = !searchTerm || 
			receipt.exportReceiptId?.toString().includes(searchTerm) ||
			receipt.agent?.agentName?.toLowerCase().includes(searchTerm.toLowerCase());

		// Filter by agent
		const matchesAgent = !selectedAgent || 
			receipt.agent?.agentId?.toString() === selectedAgent ||
			receipt.agent?.agentID?.toString() === selectedAgent;

		// Filter by status
		const matchesStatus = !statusFilter || getPaymentStatus(receipt).value === statusFilter;

		// Filter by date
		const matchesDate = !dateFilter || 
			new Date(receipt.createDate).toDateString() === new Date(dateFilter).toDateString();

		return matchesSearch && matchesAgent && matchesStatus && matchesDate;
	});

	// Pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = filteredReceipts.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);

	// Helper functions
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(amount || 0);
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('vi-VN');
	};

	const getPaymentStatus = (receipt) => {
		const totalAmount = receipt.totalAmount || 0;
		const paidAmount = receipt.paidAmount || 0;
		
		if (paidAmount >= totalAmount) {
			return { 
				label: 'Đã thanh toán', 
				value: 'paid',
				className: 'bg-green-100 text-green-800 border-green-200' 
			};
		} else if (paidAmount > 0) {
			return { 
				label: 'Thanh toán một phần', 
				value: 'partial',
				className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
			};
		} else {
			return { 
				label: 'Chưa thanh toán', 
				value: 'unpaid',
				className: 'bg-red-100 text-red-800 border-red-200' 
			};
		}
	};

	// Reset filters
	const resetFilters = () => {
		setSearchTerm('');
		setSelectedAgent('');
		setStatusFilter('');
		setDateFilter('');
		setCurrentPage(1);
  };

  return (
		<div className="p-6 bg-[#1a2634] rounded-lg min-h-screen">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-blue-600 rounded-lg">
						<FiTruck className="text-white text-xl" />
					</div>
    <div>
						<h2 className="text-2xl font-semibold text-white">QUẢN LÝ PHIẾU XUẤT HÀNG</h2>
						<p className="text-gray-400">Quản lý toàn bộ phiếu xuất hàng trong hệ thống</p>
					</div>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
				>
					<FiPlus /> Thêm Phiếu Xuất Mới
				</button>
			</div>

			{/* Filters */}
			<div className="bg-gray-800 rounded-lg p-4 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
					{/* Search */}
					<div className="relative">
						<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Tìm kiếm theo mã phiếu, tên đại lý..."
							className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					{/* Agent filter */}
					<div className="relative">
						<FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
						<select
							className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={selectedAgent}
							onChange={(e) => setSelectedAgent(e.target.value)}
						>
							<option value="">Tất cả đại lý</option>
							{agents.map(agent => (
								<option key={agent.agentId || agent.agentID} value={agent.agentId || agent.agentID}>
									{agent.agentName}
								</option>
							))}
						</select>
					</div>

					{/* Status filter */}
					<div className="relative">
						<FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
						<select
							className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="">Tất cả trạng thái</option>
							<option value="paid">Đã thanh toán</option>
							<option value="partial">Thanh toán một phần</option>
							<option value="unpaid">Chưa thanh toán</option>
						</select>
					</div>

					{/* Date filter */}
					<div className="relative">
						<FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
						<input
							type="date"
							className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={dateFilter}
							onChange={(e) => setDateFilter(e.target.value)}
						/>
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						<button
							onClick={resetFilters}
							className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-1 transition-colors"
							title="Reset bộ lọc"
						>
							<FiFilter />
						</button>
						<button
							onClick={loadExportReceipts}
							className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 transition-colors"
							title="Làm mới"
						>
							<FiRefreshCw />
						</button>
					</div>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
					{error}
				</div>
			)}

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-blue-600 p-4 rounded-lg text-white">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-blue-100">Tổng phiếu xuất</p>
							<p className="text-2xl font-bold">{exportReceipts.length}</p>
						</div>
						<FiPackage className="text-3xl text-blue-200" />
					</div>
				</div>
				<div className="bg-green-600 p-4 rounded-lg text-white">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-green-100">Đã thanh toán</p>
							<p className="text-2xl font-bold">
								{exportReceipts.filter(r => getPaymentStatus(r).value === 'paid').length}
							</p>
						</div>
						<FiDollarSign className="text-3xl text-green-200" />
					</div>
				</div>
				<div className="bg-yellow-600 p-4 rounded-lg text-white">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-yellow-100">Thanh toán một phần</p>
							<p className="text-2xl font-bold">
								{exportReceipts.filter(r => getPaymentStatus(r).value === 'partial').length}
							</p>
						</div>
						<FiDollarSign className="text-3xl text-yellow-200" />
					</div>
				</div>
				<div className="bg-red-600 p-4 rounded-lg text-white">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-red-100">Chưa thanh toán</p>
							<p className="text-2xl font-bold">
								{exportReceipts.filter(r => getPaymentStatus(r).value === 'unpaid').length}
							</p>
						</div>
						<FiDollarSign className="text-3xl text-red-200" />
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="bg-gray-800 rounded-lg overflow-hidden">
				{loading ? (
					<div className="p-8 text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
						<p className="mt-2 text-gray-400">Đang tải danh sách phiếu xuất...</p>
					</div>
				) : currentItems.length === 0 ? (
					<div className="p-8 text-center">
						<FiPackage className="mx-auto h-12 w-12 text-gray-500 mb-4" />
						<p className="text-gray-400">Không có phiếu xuất nào</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead className="bg-gray-700">
								<tr>
									<th className="py-3 px-4 text-gray-300 font-medium">Mã phiếu</th>
									<th className="py-3 px-4 text-gray-300 font-medium">Ngày xuất</th>
									<th className="py-3 px-4 text-gray-300 font-medium">Đại lý</th>
									<th className="py-3 px-4 text-gray-300 font-medium">Tổng tiền</th>
									<th className="py-3 px-4 text-gray-300 font-medium">Đã trả</th>
									<th className="py-3 px-4 text-gray-300 font-medium">Còn lại</th>
									<th className="py-3 px-4 text-gray-300 font-medium">Trạng thái</th>
									<th className="py-3 px-4 text-gray-300 font-medium">Thao tác</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-700">
								{currentItems.map((receipt, index) => {
									const status = getPaymentStatus(receipt);
									return (
										<tr key={receipt.exportReceiptId} className="hover:bg-gray-700 transition-colors" 
											onClick={(e) => {
												// Prevent row click from interfering with button clicks
												e.stopPropagation();
											}}
										>
											<td className="py-3 px-4 text-white font-medium">
												#{receipt.exportReceiptId}
											</td>
											<td className="py-3 px-4 text-gray-300">
												{formatDate(receipt.createDate)}
											</td>
											<td className="py-3 px-4 text-gray-300">
												{receipt.agent?.agentName || 'N/A'}
											</td>
											<td className="py-3 px-4 text-green-400 font-medium">
												{formatCurrency(receipt.totalAmount)}
											</td>
											<td className="py-3 px-4 text-blue-400 font-medium">
												{formatCurrency(receipt.paidAmount)}
											</td>
											<td className="py-3 px-4 text-red-400 font-medium">
												{formatCurrency(receipt.remainingAmount)}
											</td>
											<td className="py-3 px-4">
												<span className={`px-2 py-1 rounded-full text-xs font-medium border ${status.className}`}>
													{status.label}
												</span>
											</td>
											<td className="py-3 px-4">
												<div className="flex space-x-2">
													<button
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															handleViewReceipt(receipt);
														}}
														className="text-blue-400 hover:text-blue-300 transition-colors"
														title="Xem chi tiết"
														type="button"
													>
														<FiEye />
													</button>
													<button
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															handleEditReceipt(receipt);
														}}
														className="text-green-400 hover:text-green-300 transition-colors"
														title="Chỉnh sửa"
														type="button"
													>
														<FiEdit />
													</button>
													<button
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															handleShowDeleteModal(receipt);
														}}
														className="text-red-400 hover:text-red-300 transition-colors"
														title="Xóa"
														type="button"
													>
														<FiTrash2 />
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex justify-between items-center mt-6">
					<div className="text-gray-400 text-sm">
						Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredReceipts.length)} 
						/{filteredReceipts.length} phiếu xuất
					</div>
					<div className="flex space-x-2">
						<button
							onClick={() => setCurrentPage(currentPage - 1)}
							disabled={currentPage === 1}
							className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
						>
							Trước
						</button>
						<span className="px-4 py-2 bg-gray-700 text-white rounded-lg">
							{currentPage} / {totalPages}
						</span>
						<button
							onClick={() => setCurrentPage(currentPage + 1)}
							disabled={currentPage === totalPages}
							className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
						>
							Sau
						</button>
					</div>
				</div>
			)}

			{/* Modals */}
			{showAddModal && (
				<AddExportReceiptPopup
					onClose={() => setShowAddModal(false)}
					onAdded={handleAddSuccess}
				/>
			)}

			{showViewPopup && selectedReceipt && (
				<ViewExportPopup
					exportReceipt={selectedReceipt}
					onClose={() => {
						console.log('🔒 Closing view popup');
						setShowViewPopup(false);
						setSelectedReceipt(null);
					}}
				/>
			)}

			{/* Edit Modal */}
			{showEditModal && selectedReceipt && (
				<EditExportReceiptModal
					isOpen={showEditModal}
					onClose={handleEditCancel}
					receipt={selectedReceipt}
					onSuccess={handleEditSuccess}
				/>
			)}

			{/* Delete Modal */}
			{showDeleteModal && selectedReceipt && (
				<DeleteExportReceiptModal
					isOpen={showDeleteModal}
					onClose={handleDeleteCancel}
					receipt={selectedReceipt}
					onDeleted={handleDeleteSuccess}
				/>
			)}
    </div>
  );
};

export default ExportReceiptManagement; 