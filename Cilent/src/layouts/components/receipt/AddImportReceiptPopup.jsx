import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import {
	FiX,
	FiPackage,
	FiCalendar,
	FiHash,
	FiPlus,
	FiTrash2,
} from 'react-icons/fi';
import { 
	createImportReceipt, 
	formatCreateImportReceiptRequest 
} from '../../../utils/importReceiptService.js';
import { getAllProducts } from '../../../utils/receiptService';
import { ProductContext } from '../../../App';

const AddImportReceiptPopup = ({ onClose, onAdded }) => {
	const productContext = useContext(ProductContext);
	const [products, setProducts] = useState([]);

	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	
	// State cho form chính
	const [formData, setFormData] = useState({
		createDate: new Date().toISOString().split('T')[0],
	});
	
	// State cho danh sách sản phẩm được thêm vào phiếu nhập
	const [importItems, setImportItems] = useState([]);
	
	// State cho form thêm sản phẩm mới
	const [currentItem, setCurrentItem] = useState({
		productID: '',
		quantityImport: '',
		importPrice: '',
	});
	
	const [error, setError] = useState('');
	const [itemErrors, setItemErrors] = useState({});

	// Fetch products and units when component mounts
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


			} catch (err) {
				console.error('Error fetching data:', err);
				toast.error('Lỗi khi tải dữ liệu sản phẩm và đơn vị');
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
		if (name === 'quantityImport' && value < 0) {
			setItemErrors(prev => ({ ...prev, quantityImport: 'Số lượng nhập không được nhỏ hơn 0' }));
		} else if (name === 'importPrice' && value < 0) {
			setItemErrors(prev => ({ ...prev, importPrice: 'Đơn giá không được nhỏ hơn 0' }));
		} else {
			setItemErrors(prev => ({ ...prev, [name]: '' }));
		}
		setCurrentItem({ ...currentItem, [name]: value });
		setError('');
	};

	// Xử lý khi chọn sản phẩm - tự động điền giá nhập
	const handleProductSelect = (e) => {
		const productID = e.target.value;
		const product = products.find(p => (p.productId || p.productID || p.id) === parseInt(productID));
		
		setCurrentItem(prev => ({
			...prev,
			productID: productID,
			importPrice: product ? (product.importPrice || '') : '' // Tự động điền giá từ sản phẩm
		}));
		setItemErrors(prev => ({ ...prev, productID: '', importPrice: '' }));
		setError('');
	};

	// Validate item hiện tại
	const validateCurrentItem = () => {
		const newErrors = {};

		if (!currentItem.productID) {
			newErrors.productID = 'Vui lòng chọn sản phẩm';
		} else {
			// Kiểm tra sản phẩm đã được thêm chưa
			const existingItem = importItems.find(item => item.productID === currentItem.productID);
			if (existingItem) {
				newErrors.productID = 'Sản phẩm này đã được thêm vào phiếu nhập';
			}
		}

		if (!currentItem.quantityImport) {
			newErrors.quantityImport = 'Vui lòng nhập số lượng';
		} else if (isNaN(currentItem.quantityImport) || parseInt(currentItem.quantityImport) <= 0) {
			newErrors.quantityImport = 'Số lượng phải là số dương';
		}

		if (!currentItem.importPrice) {
			newErrors.importPrice = 'Vui lòng nhập đơn giá';
		} else if (isNaN(currentItem.importPrice) || parseFloat(currentItem.importPrice) < 0) {
			newErrors.importPrice = 'Đơn giá phải là số không âm';
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

		const importPrice = parseFloat(currentItem.importPrice);
		const quantity = parseInt(currentItem.quantityImport);

		const newItem = {
			productID: currentItem.productID,
			product: product,
			quantityImport: quantity,
			importPrice: importPrice,
			totalPrice: importPrice * quantity
		};

		setImportItems(prev => [...prev, newItem]);
		
		// Reset form thêm sản phẩm
		setCurrentItem({
			productID: '',
			quantityImport: '',
			importPrice: '',
		});
		setItemErrors({});
	};

	// Xóa sản phẩm khỏi danh sách
	const removeItemFromList = (productID) => {
		setImportItems(prev => prev.filter(item => item.productID !== productID));
	};

	// Cập nhật số lượng sản phẩm trong danh sách
	const updateItemQuantity = (productID, newQuantity) => {
		if (isNaN(newQuantity) || newQuantity <= 0) return;

		setImportItems(prev => prev.map(item => {
			if (item.productID === productID) {
				return {
					...item,
					quantityImport: parseInt(newQuantity),
					totalPrice: item.importPrice * parseInt(newQuantity)
				};
			}
			return item;
		}));
	};

	// Cập nhật giá nhập sản phẩm trong danh sách
	const updateItemPrice = (productID, newPrice) => {
		if (isNaN(newPrice) || newPrice < 0) return;

		setImportItems(prev => prev.map(item => {
			if (item.productID === productID) {
				return {
					...item,
					importPrice: parseFloat(newPrice),
					totalPrice: parseFloat(newPrice) * item.quantityImport
				};
			}
			return item;
		}));
	};

	// Tính tổng tiền toàn bộ phiếu nhập
	const calculateTotalAmount = () => {
		return importItems.reduce((total, item) => total + item.totalPrice, 0);
	};

	// Format currency
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(amount || 0);
	};

	// Xử lý submit
	const handleSubmit = async () => {
		if (importItems.length === 0) {
			setError('Vui lòng thêm ít nhất một sản phẩm vào phiếu nhập');
			return;
		}

		if (!formData.createDate) {
			setError('Vui lòng chọn ngày nhập');
			return;
		}

		setError('');
		setSubmitting(true);

		try {
			console.log('🔍 Form data before parsing:', formData);
			console.log('🔍 Import items:', importItems);
			
			// Sử dụng helper function để format request đúng
			const requestData = formatCreateImportReceiptRequest({
				date: formData.createDate,
				importDetails: importItems.map(item => ({
					productId: parseInt(item.productID),
					quantity: item.quantityImport
				}))
			});

			console.log('📤 Sending request to API:', requestData);
			console.log('🔑 Token exists:', !!localStorage.getItem('authToken'));

			const result = await createImportReceipt(requestData);

			console.log('📥 API Response:', result);

			if (result.success) {
				toast.success(result.message || 'Tạo phiếu nhập hàng thành công!');
				onClose();
				onAdded();
			} else {
				toast.error(`API Error: ${result.message || 'Có lỗi khi tạo phiếu nhập hàng!'}`);
			}
		} catch (err) {
			console.error('❌ API Error:', err);
			toast.error(`Lỗi API: ${err.message}`);
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
			<div className="bg-white text-gray-800 p-6 rounded-2xl w-[800px] shadow-2xl transform transition-all duration-300 scale-100 hover:scale-[1.01] max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
						<FiPackage className="text-blue-600" />
						Thêm Phiếu Nhập Mới
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
					{/* Create Date */}
					<div className="relative">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Ngày nhập <span className="text-red-500">*</span>
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

					{/* Section thêm sản phẩm */}
					<div className="border border-gray-200 rounded-lg p-4">
						<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
							<FiPlus className="text-green-600" />
							Thêm sản phẩm vào phiếu nhập
						</h3>
						
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
										onChange={handleProductSelect}
										className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
											itemErrors.productID ? 'border-red-500' : 'border-gray-300'
										}`}
										disabled={submitting}
									>
										<option value="">Chọn sản phẩm</option>
										{products && products.length > 0 ? products.map((product) => {
											const productId = product.productId || product.productID || product.id || product.ID;
											const productName = product.productName || product.name || 'Unknown Product';
											
											if (!productId) {
												console.warn('⚠️ Product missing ID:', product);
												return null;
											}
											
											return (
												<option key={productId} value={productId}>
													{productName}
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

							{/* Quantity Import */}
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
										name="quantityImport"
										placeholder="Số lượng nhập"
										value={currentItem.quantityImport}
										onChange={handleItemChange}
										min="1"
										className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
											itemErrors.quantityImport ? 'border-red-500' : 'border-gray-300'
										}`}
										disabled={submitting}
									/>
								</div>
								{itemErrors.quantityImport && (
									<p className="mt-1 text-sm text-red-600">{itemErrors.quantityImport}</p>
								)}
							</div>

							{/* Import Price */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Đơn giá nhập <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<span className="text-gray-400 text-sm">₫</span>
									</div>
									<input
										type="number"
										name="importPrice"
										placeholder="Đơn giá nhập"
										value={currentItem.importPrice}
										onChange={handleItemChange}
										min="0"
										step="0.01"
										className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
											itemErrors.importPrice ? 'border-red-500' : 'border-gray-300'
										}`}
										disabled={submitting}
									/>
								</div>
								{itemErrors.importPrice && (
									<p className="mt-1 text-sm text-red-600">{itemErrors.importPrice}</p>
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
								Danh sách sản phẩm ({importItems.length})
							</h3>
							{importItems.length > 0 && (
								<div className="text-lg font-bold text-blue-600">
									Tổng tiền: {formatCurrency(calculateTotalAmount())}
								</div>
							)}
						</div>

						{importItems.length === 0 ? (
							<div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
								<FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
								<p className="text-gray-500">Chưa có sản phẩm nào được thêm vào phiếu nhập</p>
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
											{importItems.map((item, index) => (
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
															value={item.quantityImport}
															onChange={(e) => updateItemQuantity(item.productID, e.target.value)}
															min="1"
															className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
															disabled={submitting}
														/>
													</td>
													<td className="px-4 py-3">
														<input
															type="number"
															value={item.importPrice}
															onChange={(e) => updateItemPrice(item.productID, e.target.value)}
															min="0"
															step="0.01"
															className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
															disabled={submitting}
														/>
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
						disabled={submitting || importItems.length === 0}
						className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
					>
						{submitting && (
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
						)}
						{submitting ? 'Đang tạo...' : 'Lưu phiếu nhập'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddImportReceiptPopup;

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