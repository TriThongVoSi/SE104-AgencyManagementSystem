import React from 'react';
import { FiAlertTriangle, FiDollarSign } from 'react-icons/fi';

/**
 * Component hiển thị cảnh báo khi số tiền nợ vượt quá giới hạn cho phép
 * @param {Object} props - Component props
 * @param {number} props.debtAmount - Số tiền nợ hiện tại
 * @param {number} props.maxDebt - Giới hạn nợ tối đa cho phép
 * @param {string} props.agentTypeName - Tên loại đại lý
 * @param {string} props.agentName - Tên đại lý (tùy chọn)
 * @param {string} props.size - Kích thước component ('sm', 'md', 'lg')
 * @param {boolean} props.showDetails - Hiển thị thông tin chi tiết
 * @param {string} props.variant - Kiểu hiển thị ('alert', 'card', 'inline')
 */
const DebtLimitWarning = ({
	debtAmount = 0,
	maxDebt = 0,
	agentTypeName = '',
	agentName = '',
	size = 'md',
	showDetails = true,
	variant = 'alert'
}) => {
	// Kiểm tra xem có vượt quá giới hạn không
	const isExceeded = debtAmount > maxDebt;
	const exceededAmount = Math.max(0, debtAmount - maxDebt);
	const remainingLimit = Math.max(0, maxDebt - debtAmount);

	// Helper function to format currency
	const formatCurrency = (amount) => {
		if (amount === null || amount === undefined) return '0 đ';
		return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
	};

	// Không hiển thị nếu không có thông tin cần thiết
	if (!maxDebt || debtAmount < 0) {
		return null;
	}

	// Size classes
	const sizeClasses = {
		sm: {
			container: 'p-2',
			icon: 'text-sm',
			title: 'text-xs font-semibold',
			text: 'text-xs',
			iconContainer: 'p-1'
		},
		md: {
			container: 'p-3',
			icon: 'text-base',
			title: 'text-sm font-bold',
			text: 'text-xs',
			iconContainer: 'p-2'
		},
		lg: {
			container: 'p-4',
			icon: 'text-lg',
			title: 'text-base font-bold',
			text: 'text-sm',
			iconContainer: 'p-2'
		}
	};

	const currentSize = sizeClasses[size] || sizeClasses.md;

	// Variant styles
	const getVariantClasses = () => {
		const baseClass = isExceeded 
			? 'border-red-300 bg-gradient-to-r from-red-50 to-red-100'
			: 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100';

		switch (variant) {
			case 'card':
				return `${baseClass} border-2 rounded-lg shadow-sm`;
			case 'inline':
				return `${baseClass} border rounded`;
			case 'alert':
			default:
				return `${baseClass} border-2 rounded-lg shadow-sm`;
		}
	};

	const getTextColors = () => {
		return isExceeded 
			? {
				title: 'text-red-800',
				text: 'text-red-700',
				icon: 'text-red-700',
				iconBg: 'bg-red-200'
			}
			: {
				title: 'text-yellow-800',
				text: 'text-yellow-700',
				icon: 'text-yellow-700',
				iconBg: 'bg-yellow-200'
			};
	};

	const colors = getTextColors();

	return (
		<div className={`${getVariantClasses()} ${currentSize.container}`}>
			<div className="flex items-start gap-3">
				<div className={`${colors.iconBg} ${currentSize.iconContainer} rounded-full flex-shrink-0`}>
					<FiAlertTriangle className={`${colors.icon} ${currentSize.icon}`} />
				</div>
				<div className="flex-1 min-w-0">
					<h4 className={`${colors.title} ${currentSize.title} mb-1`}>
						{isExceeded ? (
							<>⚠️ SỐ TIỀN NỢ VƯỢT QUÁ GIỚI HẠN CHO PHÉP</>
						) : (
							<>💰 CẢNH BÁO CÔNG NỢ GẦN ĐẾN GIỚI HẠN</>
						)}
					</h4>
					
					{agentName && (
						<div className={`${colors.text} ${currentSize.text} mb-2`}>
							Đại lý: <span className="font-semibold">{agentName}</span>
						</div>
					)}
					
					{showDetails && (
						<div className={`${colors.text} ${currentSize.text} space-y-1`}>
							<div className="flex items-center gap-2">
								<FiDollarSign className="flex-shrink-0" />
								<div className="grid grid-cols-1 gap-1 flex-1">
									<div>
										Số tiền nợ hiện tại: <span className="font-semibold">{formatCurrency(debtAmount)}</span>
									</div>
									<div>
										Giới hạn tối đa cho phép: <span className="font-semibold">{formatCurrency(maxDebt)}</span>
									</div>
									{isExceeded ? (
										<div className="text-red-800">
											Vượt quá: <span className="font-bold">{formatCurrency(exceededAmount)}</span>
										</div>
									) : (
										<div className="text-blue-600">
											Còn lại có thể nợ: <span className="font-semibold">{formatCurrency(remainingLimit)}</span>
										</div>
									)}
								</div>
							</div>
							
							{agentTypeName && (
								<div className={`mt-2 ${colors.text}`}>
									Loại đại lý: <span className="font-medium">{agentTypeName}</span>
								</div>
							)}
						</div>
					)}
					
					{/* Action suggestion */}
					<div className={`mt-2 ${colors.text} ${currentSize.text} italic`}>
						{isExceeded ? (
							'Vui lòng thanh toán để giảm số tiền nợ xuống dưới giới hạn cho phép.'
						) : (
							'Hãy theo dõi công nợ để tránh vượt quá giới hạn.'
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DebtLimitWarning; 