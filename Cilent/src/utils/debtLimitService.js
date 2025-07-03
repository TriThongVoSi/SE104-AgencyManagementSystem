import { API_CONFIG } from '../constants/api.js';

/**
 * Service xử lý logic liên quan đến giới hạn nợ của đại lý
 */
export class DebtLimitService {
    /**
     * Kiểm tra xem đại lý có vượt quá giới hạn nợ không
     * @param {number} debtAmount - Số tiền nợ hiện tại
     * @param {number} maxDebt - Giới hạn nợ tối đa
     * @returns {Object} Thông tin về trạng thái nợ
     */
    static checkDebtLimit(debtAmount, maxDebt) {
        // Validate input parameters
        if (debtAmount === null || debtAmount === undefined || isNaN(debtAmount)) {
            debtAmount = 0;
        }
        
        if (!maxDebt || maxDebt <= 0 || isNaN(maxDebt)) {
            return {
                isValid: false,
                message: 'Không có thông tin giới hạn nợ'
            };
        }

        // Ensure debtAmount is a number
        debtAmount = Number(debtAmount);
        maxDebt = Number(maxDebt);

        const debtRatio = debtAmount / maxDebt;
        const exceededAmount = Math.max(0, debtAmount - maxDebt);
        const remainingLimit = Math.max(0, maxDebt - debtAmount);

        return {
            isValid: true,
            debtAmount,
            maxDebt,
            debtRatio,
            exceededAmount,
            remainingLimit,
            isExceeded: debtAmount > maxDebt,
            isNearLimit: debtRatio > 0.8,
            isWarningLevel: debtRatio > 0.6,
            percentage: (debtRatio * 100).toFixed(1),
            status: this.getDebtStatus(debtRatio, debtAmount > maxDebt)
        };
    }

    /**
     * Lấy trạng thái nợ dưới dạng text
     * @param {number} debtRatio - Tỷ lệ nợ (0-1+)
     * @param {boolean} isExceeded - Có vượt quá giới hạn không
     * @returns {string} Trạng thái nợ
     */
    static getDebtStatus(debtRatio, isExceeded) {
        if (isExceeded) {
            return 'Vượt quá giới hạn';
        } else if (debtRatio > 0.8) {
            return 'Gần đến giới hạn';
        } else if (debtRatio > 0.6) {
            return 'Cảnh báo';
        } else if (debtRatio > 0.3) {
            return 'Bình thường';
        } else {
            return 'Thấp';
        }
    }

    /**
     * Format currency theo định dạng Việt Nam
     * @param {number} amount - Số tiền
     * @returns {string} Chuỗi định dạng tiền tệ
     */
    static formatCurrency(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) return '0 đ';
        
        try {
            const numAmount = Number(amount);
            if (isNaN(numAmount)) return '0 đ';
            
            return new Intl.NumberFormat('vi-VN').format(numAmount) + ' đ';
        } catch (error) {
            console.warn('Error formatting currency:', error);
            return '0 đ';
        }
    }
}

// Export default for easier importing
export default DebtLimitService; 