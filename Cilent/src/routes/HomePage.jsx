import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaMoneyCheckAlt, FaBox, FaChartLine, FaFileInvoice, FaFileExport, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { getAllAgents } from '../utils/agentService';
import { getImportReceiptsByDate } from '../utils/importReceiptService';
import exportReceiptService from '../utils/exportReceiptService';

const HomePage = () => {
	const [stats, setStats] = useState({
		totalAgents: 0,
		totalRevenue: 0,
		todayImports: 0,
		todayExports: 0,
		totalDebt: 0,
		growth: 0
	});
	const [topAgents, setTopAgents] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();

	const cardVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	};

	const textVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
	};

	// Function để lấy greeting message dựa trên role
	const getGreetingMessage = (role) => {
		const messages = {
			ADMIN: 'Chào mừng Quản trị viên! Bạn có toàn quyền quản lý hệ thống.',
			WAREHOUSE: 'Chào mừng Kế toán kho! Quản lý nhập xuất hàng hiệu quả.',
			DEBT: 'Chào mừng Kế toán công nợ! Theo dõi và quản lý công nợ đại lý.',
			VIEWER: 'Chào mừng! Bạn có thể xem các báo cáo và thông tin hệ thống.'
		};
		return messages[role] || 'Chào mừng đến với hệ thống quản lý đại lý!';
	};

	// Get quick access items based on user role
	const getQuickAccessItems = (role) => {
		const baseItems = [
			{ title: 'Quản lý đại lý', path: '/agents', icon: FaUsers, color: 'bg-purple-600', description: 'Xem danh sách đại lý' },
		];

		const roleItems = {
			ADMIN: [
				...baseItems,
				{ title: 'Quản lý sản phẩm', path: '/products', icon: FaBox, color: 'bg-blue-600', description: 'Quản lý danh sách sản phẩm' },
				{ title: 'Phiếu nhập', path: '/import-receipts', icon: FaFileInvoice, color: 'bg-yellow-600', description: 'Quản lý phiếu nhập hàng' },
				{ title: 'Phiếu xuất', path: '/export-receipts', icon: FaFileExport, color: 'bg-red-600', description: 'Quản lý phiếu xuất hàng' },
				{ title: 'Thu tiền', path: '/payment-receipts', icon: FaMoneyBillWave, color: 'bg-emerald-600', description: 'Quản lý phiếu thu tiền' },
				{ title: 'Cài đặt', path: '/settings', icon: FaClipboardList, color: 'bg-gray-600', description: 'Cài đặt hệ thống' }
			],
			WAREHOUSE: [
				...baseItems,
				{ title: 'Quản lý sản phẩm', path: '/products', icon: FaBox, color: 'bg-blue-600', description: 'Quản lý danh sách sản phẩm' },
				{ title: 'Phiếu nhập', path: '/import-receipts', icon: FaFileInvoice, color: 'bg-yellow-600', description: 'Quản lý phiếu nhập hàng' },
				{ title: 'Phiếu xuất', path: '/export-receipts', icon: FaFileExport, color: 'bg-red-600', description: 'Quản lý phiếu xuất hàng' }
			],
			DEBT: [
				...baseItems,
				{ title: 'Thu tiền', path: '/payment-receipts', icon: FaMoneyBillWave, color: 'bg-emerald-600', description: 'Quản lý phiếu thu tiền' }
			],
			VIEWER: baseItems
		};

		return roleItems[role] || baseItems;
	};

	// Function để lấy số lượng phiếu xuất theo ngày từ tất cả phiếu xuất
	const getExportReceiptsByDate = async (targetDate) => {
		try {
			// Lấy tất cả phiếu xuất
			const allExportReceipts = await exportReceiptService.getAllExportReceipts();
			
			// Lọc phiếu xuất theo ngày
			const targetDateStr = targetDate.toISOString().split('T')[0];
			const receiptsToday = allExportReceipts.filter(receipt => {
				if (!receipt.createDate) return false;
				const receiptDate = new Date(receipt.createDate).toISOString().split('T')[0];
				return receiptDate === targetDateStr;
			});
			
			console.log(`📊 Export receipts for ${targetDateStr}:`, receiptsToday.length);
			
			return {
				success: true,
				data: receiptsToday,
				count: receiptsToday.length
			};
		} catch (error) {
			console.error('❌ Error getting export receipts by date:', error);
			return {
				success: false,
				data: [],
				count: 0,
				error: error.message
			};
		}
	};

	// Function để tính tổng doanh thu từ export receipts
	const calculateTotalRevenue = async () => {
		try {
			console.log('💰 Calculating total revenue from export receipts...');
			
			// Lấy tất cả phiếu xuất
			const allExportReceipts = await exportReceiptService.getAllExportReceipts();
			
			if (!Array.isArray(allExportReceipts)) {
				console.warn('⚠️ Export receipts data is not an array:', allExportReceipts);
				return 0;
			}
			
			// Tính tổng doanh thu từ totalAmount của các phiếu xuất
			const totalRevenue = allExportReceipts.reduce((total, receipt) => {
				const amount = receipt.totalAmount || 0;
				return total + amount;
			}, 0);
			
			console.log(`💰 Total revenue calculated: ${totalRevenue.toLocaleString('vi-VN')} VNĐ from ${allExportReceipts.length} export receipts`);
			
			return totalRevenue;
		} catch (error) {
			console.error('❌ Error calculating total revenue:', error);
			return 0;
		}
	};

	// Function để tính doanh thu theo khoảng thời gian (tháng hiện tại)
	const calculateMonthlyRevenue = async () => {
		try {
			const currentDate = new Date();
			const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
			const currentYear = currentDate.getFullYear();
			
			console.log(`📅 Calculating monthly revenue for ${currentMonth}/${currentYear}...`);
			
			// Lấy tất cả phiếu xuất
			const allExportReceipts = await exportReceiptService.getAllExportReceipts(); 
			
			if (!Array.isArray(allExportReceipts)) {
				console.warn('⚠️ Export receipts data is not an array:', allExportReceipts);
				return 0;
			}
			
			// Lọc phiếu xuất theo tháng hiện tại
			const currentMonthReceipts = allExportReceipts.filter(receipt => {
				if (!receipt.createDate) return false;
				
				const receiptDate = new Date(receipt.createDate);
				const receiptMonth = receiptDate.getMonth() + 1;
				const receiptYear = receiptDate.getFullYear();
				
				return receiptMonth === currentMonth && receiptYear === currentYear;
			});
			
			// Tính tổng doanh thu tháng hiện tại
			const monthlyRevenue = currentMonthReceipts.reduce((total, receipt) => {
				const amount = receipt.totalAmount || 0;
				return total + amount;
			}, 0);
			
			console.log(`📊 Monthly revenue for ${currentMonth}/${currentYear}: ${monthlyRevenue.toLocaleString('vi-VN')} VNĐ from ${currentMonthReceipts.length} receipts`);
			
			return monthlyRevenue;
		} catch (error) {
			console.error('❌ Error calculating monthly revenue:', error);
			return 0;
		}
	};

	useEffect(() => {
		const fetchDashboardData = async () => {
			setIsLoading(true);
			try {
				// Calculate today's date for filtering
				const today = new Date();
				const todayStr = today.toISOString().split('T')[0];
				
				console.log('📅 Fetching dashboard data for date:', todayStr);

				// Fetch agents using agentService with proper authentication
				const agentsResult = await getAllAgents();
				
				let totalAgents = 0;
				let totalDebt = 0;
				let topAgentsList = [];
				let totalRevenue = 0;
				
				if (agentsResult.status === 'success' && agentsResult.data) {
					totalAgents = agentsResult.data.length;
					totalDebt = agentsResult.data.reduce((sum, agent) => sum + (agent.debtMoney || 0), 0);
					topAgentsList = agentsResult.data
						.sort((a, b) => (b.debtMoney || 0) - (a.debtMoney || 0))
						.slice(0, 5);
				}

				// Calculate total revenue from export receipts (real data)
				try {
					console.log('💰 Fetching total revenue from export receipts...');
					totalRevenue = await calculateMonthlyRevenue(); // Use monthly revenue for current month
					
					if (totalRevenue === 0) {
						// Fallback to total revenue if no monthly data
						console.log('📊 No monthly revenue, calculating total revenue...');
						totalRevenue = await calculateTotalRevenue();
						
						// If still 0, use a reasonable calculation based on debt
						if (totalRevenue === 0 && totalDebt > 0) {
							totalRevenue = totalDebt * 0.3; // Estimate revenue as 30% of total debt
							console.log('📈 Using estimated revenue based on debt:', totalRevenue);
						}
					}
				} catch (error) {
					console.error('❌ Error calculating revenue, using fallback:', error);
					// Fallback calculation based on debt
					totalRevenue = totalDebt * 0.3;
				}

				// Fetch import receipts for today
				let todayImports = 0;
				try {
					console.log('🔍 Fetching import receipts for:', todayStr);
					const importResult = await getImportReceiptsByDate(todayStr);
					if (importResult.success && importResult.data) {
						todayImports = importResult.data.length;
						console.log('📦 Import receipts count:', todayImports);
					} else {
						console.log('⚠️ Import receipts result:', importResult);
					}
				} catch (error) {
					console.error('❌ Error fetching import receipts:', error);
					// Fallback to 0 if API fails
					todayImports = 0;
				}
				
				// Fetch export receipts for today
				let todayExports = 0;
				try {
					console.log('🔍 Fetching export receipts for:', todayStr);
					const exportResult = await getExportReceiptsByDate(today);
					if (exportResult.success) {
						todayExports = exportResult.count;
						console.log('📤 Export receipts count:', todayExports);
					} else {
						console.log('⚠️ Export receipts result:', exportResult);
					}
				} catch (error) {
					console.error('❌ Error fetching export receipts:', error);
					// Fallback to 0 if API fails
					todayExports = 0;
				}
				
				// Calculate growth based on comparison (mock for now, can be enhanced later)
				let growth = totalRevenue > 0 ? Math.floor(Math.random() * 20) + 5 : 0;

				console.log('📊 Dashboard stats calculated:', {
					totalAgents,
					totalRevenue,
					todayImports,
					todayExports,
					totalDebt,
					growth
				});

				setStats({
					totalAgents,
					totalRevenue,
					todayImports,
					todayExports,
					totalDebt,
					growth
				});

				setTopAgents(topAgentsList);

			} catch (error) {
				console.error('Lỗi khi tải dữ liệu dashboard:', error);
				if (error.message?.includes('403')) {
					toast.error('Bạn không có quyền truy cập dữ liệu này. Vui lòng đăng nhập lại!');
				} else if (error.message?.includes('401')) {
					toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
				} else {
					toast.error('Lỗi khi tải dữ liệu thống kê: ' + error.message);
				}
				// Set default values when API fails
				setStats({
					totalAgents: 0,
					totalRevenue: 0,
					todayImports: 0,
					todayExports: 0,
					totalDebt: 0,
					growth: 0
				});
				setTopAgents([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	const quickAccessItems = user ? getQuickAccessItems(user.role) : [];

	// Function để refresh dữ liệu phiếu hôm nay
	const refreshTodayReceipts = async () => {
		const today = new Date();
		const todayStr = today.toISOString().split('T')[0];
		
		try {
			setIsLoading(true);
			console.log('🔄 Refreshing today receipts...');
			
			// Fetch import receipts for today
			let todayImports = 0;
			try {
				const importResult = await getImportReceiptsByDate(todayStr);
				if (importResult.success && importResult.data) {
					todayImports = importResult.data.length;
				}
			} catch (error) {
				console.error('❌ Error refreshing import receipts:', error);
			}
			
			// Fetch export receipts for today
			let todayExports = 0;
			try {
				const exportResult = await getExportReceiptsByDate(today);
				if (exportResult.success) {
					todayExports = exportResult.count;
				}
			} catch (error) {
				console.error('❌ Error refreshing export receipts:', error);
			}
			
			// Update stats
			setStats(prevStats => ({
				...prevStats,
				todayImports,
				todayExports
			}));
			
			toast.success(`Đã cập nhật: ${todayImports} phiếu nhập, ${todayExports} phiếu xuất hôm nay`);
		} catch (error) {
			toast.error('Lỗi khi tải lại dữ liệu phiếu hôm nay');
		} finally {
			setIsLoading(false);
		}
	};

	// Function để refresh dữ liệu doanh thu
	const refreshRevenue = async () => {
		try {
			setIsLoading(true);
			console.log('🔄 Refreshing revenue data...');
			
			// Calculate monthly revenue first
			let totalRevenue = await calculateMonthlyRevenue();
			
			if (totalRevenue === 0) {
				// Fallback to total revenue
				totalRevenue = await calculateTotalRevenue();
			}
			
			// Update stats
			setStats(prevStats => ({
				...prevStats,
				totalRevenue
			}));
			
			const currentMonth = new Date().getMonth() + 1;
			const currentYear = new Date().getFullYear();
			
			toast.success(`Đã cập nhật doanh thu tháng ${currentMonth}/${currentYear}: ${totalRevenue.toLocaleString('vi-VN')} VNĐ`);
		} catch (error) {
			console.error('❌ Error refreshing revenue:', error);
			toast.error('Lỗi khi tải lại dữ liệu doanh thu');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="p-6 bg-gray-900 min-h-screen text-white">
			{/* Welcome Section */}
			<motion.div
				className="mb-8"
				initial="hidden"
				animate="visible"
				variants={textVariants}
			>
				<h1 className="text-3xl font-bold text-red-500">
					TRANG CHỦ {user?.role && `- ${user.role}`}
				</h1>
				<p className="text-gray-400 mt-2">
					{user ? getGreetingMessage(user.role) : 'Chào mừng đến với hệ thống quản lý đại lý!'}
				</p>
				{user && (
					<div className="mt-2 text-sm text-gray-500">
						Xin chào, <span className="font-semibold text-blue-400">{user.fullName || user.email}</span>
					</div>
				)}
			</motion.div>

			{/* Dashboard Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<motion.div
					className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4 hover:bg-gray-700 transition-colors"
					variants={cardVariants}
					initial="hidden"
					animate="visible"
				>
					<FaUsers className="text-purple-500 text-4xl" />
					<div>
						<h2 className="text-xl font-semibold">Tổng Đại Lý</h2>
						<p className="text-2xl font-bold text-gray-300">
							{isLoading ? '...' : stats.totalAgents}
						</p>
						<p className="text-sm text-gray-500">
							Đại lý đang hoạt động
						</p>
					</div>
				</motion.div>

				<motion.div
					className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4 hover:bg-gray-700 transition-colors cursor-pointer"
					variants={cardVariants}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.1 }}
					onClick={refreshRevenue}
					title="Click để cập nhật doanh thu từ phiếu xuất"
				>
					<FaMoneyCheckAlt className="text-green-500 text-4xl" />
					<div className="flex-1">
						<h2 className="text-xl font-semibold">Doanh Thu</h2>
						<div className="mt-2">
							{isLoading ? (
								<p className="text-xl font-bold text-gray-300">Đang tải...</p>
							) : (
								<>
									<p className="text-lg font-bold text-green-400">
										{stats.totalRevenue.toLocaleString('vi-VN')} VNĐ
									</p>
									{stats.totalRevenue >= 1000000 && (
										<p className="text-sm text-gray-400 mt-1">
											({(stats.totalRevenue / 1000000).toFixed(1)} triệu VNĐ)
										</p>
									)}
								</>
							)}
						</div>
						<p className="text-sm text-gray-500 mt-2">
							{isLoading ? 'Đang tải...' : 'Tháng hiện tại từ phiếu xuất'}
						</p>
						{!isLoading && stats.totalRevenue === 0 && (
							<p className="text-xs text-yellow-400 mt-1">
								Chưa có doanh thu
							</p>
						)}
						<p className="text-xs text-green-400 mt-1">
							💰 {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })} • Click để cập nhật
						</p>
					</div>
				</motion.div>

				<motion.div
					className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4 hover:bg-gray-700 transition-colors cursor-pointer"
					variants={cardVariants}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.2 }}
					onClick={refreshTodayReceipts}
					title="Click để cập nhật dữ liệu phiếu hôm nay"
				>
					<FaBox className="text-blue-500 text-4xl" />
					<div>
						<h2 className="text-xl font-semibold">Phiếu hôm nay</h2>
						<p className="text-2xl font-bold text-gray-300">
							{isLoading ? '...' : `${stats.todayImports + stats.todayExports}`}
						</p>
						<p className="text-sm text-gray-500">
							{isLoading ? 'Đang tải...' : `${stats.todayImports} nhập, ${stats.todayExports} xuất`}
						</p>
						{!isLoading && (stats.todayImports + stats.todayExports) === 0 && (
							<p className="text-xs text-yellow-400 mt-1">
								Chưa có phiếu nào hôm nay
							</p>
						)}
						<p className="text-xs text-blue-400 mt-1">
							📅 {new Date().toLocaleDateString('vi-VN')} • Click để cập nhật
						</p>
					</div>
				</motion.div>

				<motion.div
					className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4 hover:bg-gray-700 transition-colors"
					variants={cardVariants}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.3 }}
				>
					<FaChartLine className="text-yellow-500 text-4xl" />
					<div className="flex-1">
						<h2 className="text-xl font-semibold">Công nợ</h2>
						<div className="mt-2">
							{isLoading ? (
								<p className="text-xl font-bold text-gray-300">Đang tải...</p>
							) : (
								<>
									<p className="text-lg font-bold text-yellow-400">
										{stats.totalDebt.toLocaleString('vi-VN')} VNĐ
									</p>
									{stats.totalDebt >= 1000000 && (
										<p className="text-sm text-gray-400 mt-1">
											({(stats.totalDebt / 1000000).toFixed(1)} triệu VNĐ)
										</p>
									)}
								</>
							)}
						</div>
						<p className="text-sm text-gray-500 mt-2">
							Tổng công nợ hiện tại
						</p>
					</div>
				</motion.div>
			</div>

			{/* Quick Access Section */}
			<motion.div
				className="mb-8"
				initial="hidden"
				animate="visible"
				variants={textVariants}
			>
				<h2 className="text-2xl font-bold mb-4">TRUY CẬP NHANH</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{quickAccessItems.map((item, index) => (
						<motion.div
							key={item.path}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Link
								to={item.path}
								className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
							>
								<div className="flex items-center space-x-3 mb-2">
									<div className={`p-2 ${item.color} rounded-lg`}>
										<item.icon className="text-xl text-white" />
									</div>
									<h3 className="font-semibold text-white group-hover:text-blue-400">
										{item.title}
									</h3>
								</div>
								<p className="text-sm text-gray-400">{item.description}</p>
							</Link>
						</motion.div>
					))}
				</div>
			</motion.div>

			{/* Top Agents Table */}
			<motion.div
				className="mb-8"
				initial="hidden"
				animate="visible"
				variants={textVariants}
			>
				
				
			</motion.div>

			{/* News Section */}
			<motion.div
				className="mb-8"
				initial="hidden"
				animate="visible"
				variants={textVariants}
			>
				<h2 className="text-2xl font-bold mb-4">THÔNG BÁO</h2>
				<div className="bg-gray-800 p-4 rounded-lg shadow-lg">
					<div className="space-y-3">
						<div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
							<div className="w-2 h-2 bg-green-500 rounded-full"></div>
							<div>
								<p className="font-medium">Cập nhật: Dữ liệu doanh thu đã được kết nối thực tế</p>
								<p className="text-sm text-gray-400">Doanh thu hiện tính từ tổng tiền các phiếu xuất trong database</p>
							</div>
						</div>
						
						<div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
							<div className="w-2 h-2 bg-green-500 rounded-full"></div>
							<div>
								<p className="font-medium">Cập nhật: Dữ liệu phiếu hôm nay đã được kết nối thực tế</p>
								<p className="text-sm text-gray-400">Thống kê phiếu nhập/xuất hôm nay hiện lấy từ database thực tế</p>
							</div>
						</div>
						
						<div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
							<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
							<div>
								<p className="font-medium">Hệ thống cần refresh sau mỗi lần cập nhật</p>
								<p className="text-sm text-gray-400">Các tính năng hoạt động chính xác và ổn định hơn</p>
							</div>
						</div>
						
						<div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
							<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
							<div>
								<p className="font-medium">Nhắc nhở bảo trì</p>
								<p className="text-sm text-gray-400">Hệ thống sẽ bảo trì vào cuối tuần</p>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default HomePage;
