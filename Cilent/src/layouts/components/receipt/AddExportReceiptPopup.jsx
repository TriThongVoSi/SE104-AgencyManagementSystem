import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import {
	FiX,
	FiPackage,
	FiCalendar,
	FiHash,
	FiPlus,
	FiTrash2,
	FiUser,
	FiDollarSign,
	FiEye,
} from 'react-icons/fi';
import { 
	formatCreateExportReceiptRequest,
	createMultipleExportReceipt
} from '../../../utils/exportReceiptService.js';
import { getAllProducts } from '../../../utils/receiptService';
import { getAllAgents } from '../../../utils/agentService';
import { ProductContext } from '../../../App';
import ErrorNotification from '../common/ErrorNotification';

const AddExportReceiptPopup = ({ onClose, onAdded }) => {
	const productContext = useContext(ProductContext);
	const [products, setProducts] = useState([]);
	const [agents, setAgents] = useState([]);

	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	
	// State cho form chính
	const [formData, setFormData] = useState({
		createDate: new Date().toISOString().split('T')[0],
		agentId: '',
		paidAmount: '',
	});
	
	// State cho danh sách sản phẩm được thêm vào phiếu xuất
	const [exportItems, setExportItems] = useState([]);
	
	// State cho form thêm sản phẩm mới
	const [currentItem, setCurrentItem] = useState({
		productID: '',
		quantityExport: '',
	});
	
	const [error, setError] = useState('');
	const [itemErrors, setItemErrors] = useState({});
	
	// State cho ErrorNotification
	const [showErrorNotification, setShowErrorNotification] = useState(false);
	const [errorNotificationData, setErrorNotificationData] = useState({
		title: '',
		message: '',
		productInfo: null,
		type: 'error',
		details: null
	});

	// Fetch products and agents when component mounts
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Try to get products from context first
				if (productContext?.products && productContext.products.length > 0) {
					console.log('🔍 Products from context:', productContext.products);
					setProducts(productContext.products);
				} else {
					const productsResult = await getAllProducts();
					console.log('🔍 Products API response:', productsResult);
					if (productsResult.data && productsResult.data.length > 0) {
						console.log('🔍 Products data structure (first item):', productsResult.data[0]);
						setProducts(productsResult.data);
					} else {
						console.warn('⚠️ No products data received from API');
						setProducts([]);
					}
				}

				// Load agents
				const agentsResult = await getAllAgents();
				console.log('🔍 Agents API response:', agentsResult);
				if (agentsResult.status === 'success' && agentsResult.data && agentsResult.data.length > 0) {
					console.log('🔍 Agents data structure (first item):', agentsResult.data[0]);
					setAgents(agentsResult.data);
				} else {
					console.warn('⚠️ No agents data received from API');
					setAgents([]);
				}

			} catch (err) {
				console.error('Error fetching data:', err);
				toast.error('Lỗi khi tải dữ liệu sản phẩm và đại lý');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [productContext]);

	// Xử lý thay đổi input form chính
	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
		setError('');
	};

	// Xử lý thay đổi input item hiện tại
	const handleItemChange = (e) => {
		const { name, value } = e.target;
		if (name === 'quantityExport' && value < 0) {
			setItemErrors(prev => ({ ...prev, quantityExport: 'Số lượng xuất không được nhỏ hơn 0' }));
		} else {
			setItemErrors(prev => ({ ...prev, [name]: '' }));
		}
		setCurrentItem({ ...currentItem, [name]: value });
		setError('');
	};

	// Validate item hiện tại
	const validateCurrentItem = () => {
		const newErrors = {};

		if (!currentItem.productID) {
			newErrors.productID = 'Vui lòng chọn sản phẩm';
		} else {
			// Kiểm tra sản phẩm đã được thêm chưa
			const existingItem = exportItems.find(item => item.productID === currentItem.productID);
			if (existingItem) {
				newErrors.productID = 'Sản phẩm này đã được thêm vào phiếu xuất';
			}
		}

		if (!currentItem.quantityExport) {
			newErrors.quantityExport = 'Vui lòng nhập số lượng';
		} else if (isNaN(currentItem.quantityExport) || parseInt(currentItem.quantityExport) <= 0) {
			newErrors.quantityExport = 'Số lượng phải là số dương';
		}

		setItemErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Thêm sản phẩm vào danh sách
	const addItemToList = () => {
		if (!validateCurrentItem()) {
			return;
		}

		const product = products.find(p => (p.productId || p.productID || p.id) === parseInt(currentItem.productID));
		
		if (!product) {
			setItemErrors({ productID: 'Sản phẩm không tồn tại' });
			return;
		}

		const exportPrice = product.exportPrice || product.export_price || 0;
		const newItem = {
			productID: currentItem.productID,
			product: product,
			quantityExport: parseInt(currentItem.quantityExport),
			exportPrice: exportPrice,
			totalPrice: exportPrice * parseInt(currentItem.quantityExport)
		};

		setExportItems(prev => [...prev, newItem]);
		
		// Reset form thêm sản phẩm
		setCurrentItem({
			productID: '',
			quantityExport: '',
		});
		setItemErrors({});
	};

	// Xóa sản phẩm khỏi danh sách
	const removeItemFromList = (productID) => {
		setExportItems(prev => prev.filter(item => item.productID !== productID));
	};

	// Cập nhật số lượng sản phẩm trong danh sách
	const updateItemQuantity = (productID, newQuantity) => {
		if (isNaN(newQuantity) || newQuantity <= 0) return;

		setExportItems(prev => prev.map(item => {
			if (item.productID === productID) {
				return {
					...item,
					quantityExport: parseInt(newQuantity),
					totalPrice: item.exportPrice * parseInt(newQuantity)
				};
			}
			return item;
		}));
	};

	// Tính tổng tiền toàn bộ phiếu xuất
	const calculateTotalAmount = () => {
		return exportItems.reduce((total, item) => total + item.totalPrice, 0);
	};

	// Format currency
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(amount || 0);
	};

	// Get agent by ID
	const getAgentById = (agentId) => {
		return agents.find(a => (a.agentId || a.agentID) === parseInt(agentId));
	};

	// Parse inventory info from error message
	const parseInventoryError = (errorMessage) => {
		// Patterns for inventory errors
		const patterns = [
			/Số lượng xuất \((\d+)\) vượt quá tồn kho \((\d+)\)/,
			/Số lượng tồn kho không đủ.*?(\d+).*?(\d+)/,
			/không đủ.*?yêu cầu\s*(\d+).*?có\s*(\d+)/,
			/inventory.*?requested\s*(\d+).*?available\s*(\d+)/i
		];

		for (const pattern of patterns) {
			const match = errorMessage.match(pattern);
			if (match) {
				return {
					requested: parseInt(match[1]),
					available: parseInt(match[2]),
					shortage: parseInt(match[1]) - parseInt(match[2])
				};
			}
		}
		return null;
	};

	// Find problematic product from error context
	const findProblematicProduct = (errorMessage) => {
		// Try to find product by name in error message or use first item
		for (const item of exportItems) {
			const productName = item.product.productName || item.product.name;
			if (errorMessage.includes(productName)) {
				return item;
			}
		}
		// Fallback to first item if no specific product found
		return exportItems.length > 0 ? exportItems[0] : null;
	};

	// Enhanced error handling for create operations
	const handleCreateError = (errorMessage) => {
		const isInventoryError = errorMessage.includes('tồn kho') || 
								 errorMessage.includes('không đủ') || 
								 errorMessage.includes('vượt quá') ||
								 errorMessage.includes('insufficient') ||
								 errorMessage.includes('inventory');

		if (isInventoryError) {
			const inventoryInfo = parseInventoryError(errorMessage);
			const problematicProduct = findProblematicProduct(errorMessage);
			
			// Enhanced product info for inventory errors
			const productInfo = problematicProduct ? {
				name: problematicProduct.product.productName || problematicProduct.product.name,
				unit: problematicProduct.product.unit?.unitName || 'N/A',
				price: problematicProduct.exportPrice,
				requestedQuantity: problematicProduct.quantityExport,
				...(inventoryInfo && {
					availableQuantity: inventoryInfo.available,
					shortage: inventoryInfo.shortage
				})
			} : null;

			setErrorNotificationData({
				title: '📦 Tồn kho không đủ',
				message: errorMessage,
				productInfo: productInfo,
				type: 'warning',
				details: {
					suggestion: 'Bạn có thể thử các giải pháp sau:',
					solutions: [
						'• Giảm số lượng xuất theo tồn kho hiện có',
						'• Kiểm tra lại tồn kho sau khi nhập hàng gần đây',
						'• Tạo phiếu nhập trước khi xuất hàng',
						'• Liên hệ kho để cập nhật tồn kho chính xác'
					],
					...(inventoryInfo && {
						inventoryDetails: {
							requested: inventoryInfo.requested,
							available: inventoryInfo.available,
							shortage: inventoryInfo.shortage
						}
					})
				}
			});
		} else {
			// Other types of errors
			const firstProduct = exportItems.length > 0 && exportItems[0].product ? {
				name: exportItems[0].product.productName || exportItems[0].product.name,
				unit: exportItems[0].product.unit?.unitName || 'N/A',
				price: exportItems[0].exportPrice
			} : null;

			setErrorNotificationData({
				title: '❌ Lỗi tạo phiếu xuất',
				message: errorMessage,
				productInfo: firstProduct,
				type: 'error',
				details: {
					suggestion: 'Vui lòng kiểm tra lại thông tin:',
					solutions: [
						'• Đảm bảo tất cả thông tin đại lý chính xác',
						'• Kiểm tra số tiền đã trả hợp lệ',
						'• Xác nhận tất cả sản phẩm có trong hệ thống',
						'• Thử lại sau vài giây'
					],
					serverResponse: errorMessage
				}
			});
		}

		setShowErrorNotification(true);
	};

	// Handle action from error notification (e.g., auto-adjust quantity)
	const handleErrorNotificationAction = (action, value) => {
		if (action === 'adjust_quantity' && value !== undefined) {
			// Find the problematic product and adjust its quantity
			const problematicProduct = findProblematicProduct(errorNotificationData.message);
			if (problematicProduct) {
				updateItemQuantity(problematicProduct.productID, value);
				setShowErrorNotification(false);
				toast.success(`Đã điều chỉnh số lượng "${problematicProduct.product.productName}" về ${value}`, {
					autoClose: 3000
				});
			}
		} else {
			setShowErrorNotification(false);
		}
	};

	// Xử lý submit
	const handleSubmit = async () => {
		if (exportItems.length === 0) {
			setError('Vui lòng thêm ít nhất một sản phẩm vào phiếu xuất');
			return;
		}

		if (!formData.createDate) {
			setError('Vui lòng chọn ngày xuất');
			return;
		}

		if (!formData.agentId) {
			setError('Vui lòng chọn đại lý');
			return;
		}

		if (!formData.paidAmount) {
			setError('Vui lòng nhập số tiền đã trả');
			return;
		}

		if (isNaN(formData.paidAmount) || parseFloat(formData.paidAmount) < 0) {
			setError('Số tiền đã trả phải là số không âm');
			return;
		}

		setError('');
		setSubmitting(true);

		try {
			console.log('🔍 Form data before parsing:', formData);
			console.log('🔍 Export items:', exportItems);
			
			// Sử dụng helper function để format request đúng
			const requestData = formatCreateExportReceiptRequest({
				date: formData.createDate,
				agentId: formData.agentId,
				paidAmount: formData.paidAmount,
				exportDetails: exportItems.map(item => ({
					productId: parseInt(item.productID),
					quantity: item.quantityExport
				}))
			});

			console.log('📤 Sending request to API:', requestData);
			console.log('🔑 Token exists:', !!localStorage.getItem('authToken'));

			const result = await createMultipleExportReceipt(requestData);

			console.log('📥 API Response:', result);

			if (result.success) {
				toast.success(result.message || 'Tạo phiếu xuất hàng thành công!');
				onClose();
				onAdded();
			} else {
				// Handle specific error cases
				handleCreateError(result.message || result.error || 'Có lỗi khi tạo phiếu xuất hàng!');
			}
		} catch (err) {
			console.error('❌ API Error:', err);
			handleCreateError(err.message || 'Có lỗi khi tạo phiếu xuất hàng!');
		} finally {
			setSubmitting(false);
		}
	};

	// Show loading if data is still being fetched
	if (loading) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
				<div className="bg-white text-gray-800 p-8 rounded-2xl w-[500px] shadow-2xl">
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
			<div className="bg-white text-gray-800 p-6 rounded-2xl w-[900px] shadow-2xl transform transition-all duration-300 scale-100 hover:scale-[1.01] max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
						<FiPackage className="text-blue-600" />
						Thêm Phiếu Xuất Mới
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
						disabled={submitting}
					>
						<FiX className="text-gray-500 hover:text-gray-700 text-xl" />
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
						{error}
					</div>
				)}

				{/* Form chính */}
				<div className="space-y-6">
					{/* Create Date, Agent, Paid Amount */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Create Date */}
						<div className="relative">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Ngày xuất <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<FiCalendar className="text-gray-400" />
								</div>
								<input
									type="date"
									name="createDate"
									value={formData.createDate}
									onChange={handleFormChange}
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
									disabled={submitting}
								/>
							</div>
						</div>

						{/* Agent */}
						<div className="relative">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Đại lý <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<FiUser className="text-gray-400" />
								</div>
								<select
									name="agentId"
									value={formData.agentId}
									onChange={handleFormChange}
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
									disabled={submitting}
								>
									<option value="">Chọn đại lý</option>
									{agents && agents.length > 0 ? agents.map((agent) => {
										const agentId = agent.agentId || agent.agentID || agent.id || agent.ID;
										const agentName = agent.agentName || agent.name || 'Unknown Agent';
										
										if (!agentId) {
											console.warn('⚠️ Agent missing ID:', agent);
											return null;
										}
										
										return (
											<option key={agentId} value={agentId}>
												{agentName} - {agent.phone || 'N/A'}
											</option>
										);
									}).filter(Boolean) : (
										<option disabled>Đang tải đại lý...</option>
									)}
								</select>
							</div>
						</div>

						{/* Paid Amount */}
						<div className="relative">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Số tiền đã trả <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<FiDollarSign className="text-gray-400" />
								</div>
								<input
									type="number"
									name="paidAmount"
									placeholder="Số tiền đã trả"
									value={formData.paidAmount}
									onChange={handleFormChange}
									min="0"
									step="1000"
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
									disabled={submitting}
								/>
							</div>
						</div>
					</div>

					{/* Thông tin đại lý đang chọn */}
					{formData.agentId && (
						<div className="bg-blue-50 p-4 rounded-lg">
							{(() => {
								const selectedAgent = getAgentById(formData.agentId);
								if (!selectedAgent) return null;
								
								return (
									<div>
										<h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
											<FiUser className="text-blue-600" />
											Thông tin đại lý
										</h4>
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-gray-600">Tên đại lý:</span>
												<span className="ml-2 font-medium">{selectedAgent.agentName}</span>
											</div>
											<div>
												<span className="text-gray-600">Điện thoại:</span>
												<span className="ml-2 font-medium">{selectedAgent.phone || 'N/A'}</span>
											</div>
											<div>
												<span className="text-gray-600">Địa chỉ:</span>
												<span className="ml-2 font-medium">{selectedAgent.address || 'N/A'}</span>
											</div>
											<div>
												<span className="text-gray-600">Công nợ hiện tại:</span>
												<span className="ml-2 font-medium text-red-600">{formatCurrency(selectedAgent.debtMoney || 0)}</span>
											</div>
										</div>
									</div>
								);
							})()}
						</div>
					)}

					{/* Section thêm sản phẩm */}
					<div className="border border-gray-200 rounded-lg p-4">
						<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
							<FiPlus className="text-green-600" />
							Thêm sản phẩm vào phiếu xuất
						</h3>
						
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Product */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Sản phẩm <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<FiPackage className="text-gray-400" />
									</div>
									<select
										name="productID"
										value={currentItem.productID}
										onChange={handleItemChange}
										className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
											itemErrors.productID ? 'border-red-500' : 'border-gray-300'
										}`}
										disabled={submitting}
									>
										<option value="">Chọn sản phẩm</option>
										{products && products.length > 0 ? products.map((product) => {
											const productId = product.productId || product.productID || product.id || product.ID;
											const productName = product.productName || product.name || 'Unknown Product';
											const exportPrice = product.exportPrice || product.export_price || 0;
											
											if (!productId) {
												console.warn('⚠️ Product missing ID:', product);
												return null;
											}
											
											return (
												<option key={productId} value={productId}>
													{productName} - {formatCurrency(exportPrice)}
													{product.unit?.unitName && ` (${product.unit.unitName})`}
												</option>
											);
										}).filter(Boolean) : (
											<option disabled>Đang tải sản phẩm...</option>
										)}
									</select>
								</div>
								{itemErrors.productID && (
									<p className="mt-1 text-sm text-red-600">{itemErrors.productID}</p>
								)}
							</div>

							{/* Quantity Export */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Số lượng <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<FiHash className="text-gray-400" />
									</div>
									<input
										type="number"
										name="quantityExport"
										placeholder="Số lượng xuất"
										value={currentItem.quantityExport}
										onChange={handleItemChange}
										min="1"
										className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
											itemErrors.quantityExport ? 'border-red-500' : 'border-gray-300'
										}`}
										disabled={submitting}
									/>
								</div>
								{itemErrors.quantityExport && (
									<p className="mt-1 text-sm text-red-600">{itemErrors.quantityExport}</p>
								)}
							</div>

							{/* Add Button */}
							<div className="flex items-end">
								<button
									type="button"
									onClick={addItemToList}
									disabled={submitting}
									className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
								>
									<FiPlus />
									Thêm
								</button>
							</div>
						</div>
					</div>

					{/* Danh sách sản phẩm đã thêm */}
					<div>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-medium text-gray-900">
								Danh sách sản phẩm ({exportItems.length})
							</h3>
							{exportItems.length > 0 && (
								<div className="text-lg font-bold text-blue-600">
									Tổng tiền: {formatCurrency(calculateTotalAmount())}
								</div>
							)}
						</div>

						{exportItems.length === 0 ? (
							<div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
								<FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
								<p className="text-gray-500">Chưa có sản phẩm nào được thêm vào phiếu xuất</p>
							</div>
						) : (
							<div className="border border-gray-200 rounded-lg overflow-hidden">
								<div className="max-h-60 overflow-y-auto">
									<table className="w-full">
										<thead className="bg-gray-50 sticky top-0">
											<tr>
												<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
												<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Đơn vị</th>
												<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Số lượng</th>
												<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Đơn giá</th>
												<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thành tiền</th>
												<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{exportItems.map((item, index) => (
												<tr key={item.productID} className="hover:bg-gray-50">
													<td className="px-4 py-3">
														<div className="font-medium text-gray-900">
															{item.product.productName || item.product.name || 'Unknown Product'}
														</div>
													</td>
													<td className="px-4 py-3 text-sm text-gray-900">
														{item.product.unit?.unitName || 'N/A'}
													</td>
													<td className="px-4 py-3">
														<input
															type="number"
															value={item.quantityExport}
															onChange={(e) => updateItemQuantity(item.productID, e.target.value)}
															min="1"
															className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
															disabled={submitting}
														/>
													</td>
													<td className="px-4 py-3 text-sm text-gray-900">
														{formatCurrency(item.exportPrice)}
													</td>
													<td className="px-4 py-3 text-sm font-medium text-gray-900">
														{formatCurrency(item.totalPrice)}
													</td>
													<td className="px-4 py-3">
														<button
															type="button"
															onClick={() => removeItemFromList(item.productID)}
															disabled={submitting}
															className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
														>
															<FiTrash2 />
															Xóa
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</div>

					{/* Summary */}
					{exportItems.length > 0 && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Tổng tiền hàng:</span>
									<span className="font-medium">{formatCurrency(calculateTotalAmount())}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Số tiền đã trả:</span>
									<span className="font-medium text-green-600">{formatCurrency(formData.paidAmount || 0)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Còn lại:</span>
									<span className="font-medium text-red-600">{formatCurrency(Math.max(0, calculateTotalAmount() - (parseFloat(formData.paidAmount) || 0)))}</span>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Buttons */}
				<div className="flex justify-end mt-8 space-x-3">
					<button
						onClick={onClose}
						disabled={submitting}
						className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300 disabled:opacity-50"
					>
						Hủy
					</button>
					<button
						onClick={handleSubmit}
						disabled={submitting || exportItems.length === 0}
						className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
					>
						{submitting && (
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
						)}
						{submitting ? 'Đang tạo...' : 'Lưu phiếu xuất'}
					</button>
				</div>
			</div>
			
			{/* Error Notification */}
			<ErrorNotification
				isVisible={showErrorNotification}
				onClose={() => setShowErrorNotification(false)}
				title={errorNotificationData.title}
				message={errorNotificationData.message}
				type={errorNotificationData.type}
				productInfo={errorNotificationData.productInfo}
				details={errorNotificationData.details}
				onAction={handleErrorNotificationAction}
				actionText="Đã hiểu"
			/>
		</div>
	);
};

export default AddExportReceiptPopup;

// Ẩn spinner của input number trên Chrome, Safari, Edge, Opera và Firefox
if (typeof window !== 'undefined') {
	const style = document.createElement('style');
	style.innerHTML = `
		input[type=number]::-webkit-inner-spin-button, 
		input[type=number]::-webkit-outer-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}
		input[type=number] {
			-moz-appearance: textfield;
		}
	`;
	document.head.appendChild(style);
} 