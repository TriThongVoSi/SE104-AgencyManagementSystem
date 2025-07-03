import React from 'react';

const ErrorNotification = ({ 
  isVisible, 
  onClose, 
  title, 
  message, 
  type = "error",
  details = null,
  actionText = "Đã hiểu",
  onAction = null,
  productInfo = null
}) => {
  if (!isVisible) return null;

  // Determine the error type and set appropriate styling
  const isInventoryError = message && message.includes('tồn kho');
  const isInsufficientInventory = message && (
    message.includes('không đủ') || 
    message.includes('vượt quá') ||
    message.includes('Insufficient')
  );
  
  // Check for parameter error
  const isParameterError = details && details.paramKey;

  // Auto-set title based on error type
  let finalTitle = title;
  if (!title) {
    if (isInventoryError) {
      finalTitle = isInsufficientInventory ? "Tồn kho không đủ" : "Lỗi tồn kho";
    } else {
      finalTitle = "Không thể thực hiện thao tác";
    }
  }

  // Auto-set type based on error content
  let finalType = type;
  if (isInventoryError) {
    finalType = isInsufficientInventory ? "warning" : "error";
  }

  const getIconAndColor = () => {
    switch (finalType) {
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          icon: '❌',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
    }
  };

  const { icon, bgColor, borderColor, iconColor, titleColor, messageColor, buttonColor } = getIconAndColor();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  // Extract inventory information from error message
  const parseInventoryInfo = (errorMessage) => {
    const patterns = [
      /Số lượng xuất \((\d+)\) vượt quá tồn kho \((\d+)\)/,
      /Số lượng tồn kho không đủ.*?(\d+).*?(\d+)/,
      /không đủ.*?(\d+).*?(\d+)/
    ];

    for (const pattern of patterns) {
      const match = errorMessage.match(pattern);
      if (match) {
        return {
          requested: match[1],
          available: match[2]
        };
      }
    }
    return null;
  };

  const inventoryInfo = parseInventoryInfo(message || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgColor} ${borderColor} border-2 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100`}>
        {/* Header */}
        <div className="flex items-start p-6 pb-4">
          <div className={`${iconColor} text-2xl mr-3 mt-1 flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className={`${titleColor} text-lg font-semibold mb-2`}>
              {finalTitle}
            </h3>
            <p className={`${messageColor} text-sm leading-relaxed mb-3`}>
              {message}
            </p>

            {/* Inventory Information Section */}
            {isInventoryError && inventoryInfo && (
              <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                <h4 className="text-sm font-medium text-gray-800 mb-2">📦 Thông tin tồn kho</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lượng yêu cầu:</span>
                    <span className="font-medium text-red-600">{inventoryInfo.requested}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lượng có sẵn:</span>
                    <span className="font-medium text-green-600">{inventoryInfo.available}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-gray-600">Thiếu:</span>
                    <span className="font-medium text-red-600">
                      {parseInt(inventoryInfo.requested) - parseInt(inventoryInfo.available)}
                    </span>
                  </div>
                </div>
              </div>
            )}

           

            {/* Parameter Information Section */}
            {isParameterError && (
              <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                <h4 className="text-sm font-medium text-gray-800 mb-2">⚙️ Thông tin tham số</h4>
                <div className="space-y-1 text-xs">
                  {details.paramKey && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tham số:</span>
                      <span className="font-medium text-blue-600">{details.paramKey}</span>
                    </div>
                  )}
                  {details.inputValue && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá trị nhập:</span>
                      <span className="font-medium text-red-600">{details.inputValue}</span>
                    </div>
                  )}
                  {details.validationRule && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <span className="text-yellow-800 text-xs font-medium">Quy tắc: </span>
                      <span className="text-yellow-700 text-xs">{details.validationRule}</span>
                    </div>
                  )}
                  {details.serverError && (
                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                      <span className="text-red-800 text-xs font-medium">Lỗi server: </span>
                      <span className="text-red-700 text-xs">{details.serverError}</span>
                    </div>
                  )}
                  {details.timestamp && (
                    <div className="flex justify-between border-t pt-1 mt-2">
                      <span className="text-gray-500">Thời gian:</span>  
                      <span className="text-gray-500">{new Date(details.timestamp).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

           

            {/* General Solutions Section */}
            {details && details.solutions && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-3">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 {details.suggestion || 'Gợi ý giải pháp'}</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  {details.solutions.map((solution, index) => (
                    <li key={index}>{solution}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Note Section */}
            {details && details.note && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-3">
                <p className="text-xs text-green-700 font-medium">{details.note}</p>
              </div>
            )}

            {/* Existing Combinations Section */}
            {details && details.existingCombinations && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                <h4 className="text-sm font-medium text-gray-800 mb-2">📋 Tổ hợp đã tồn tại</h4>
                <div className="space-y-1 text-xs">
                  {details.existingCombinations.slice(0, 3).map((combo, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">{combo.productName}:</span>
                      <span className="font-medium text-gray-800">{combo.unitName}</span>
                    </div>
                  ))}
                  {details.existingCombinations.length > 3 && (
                    <div className="text-gray-500 text-center">
                      ... và {details.existingCombinations.length - 3} tổ hợp khác
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Server Response Section */}
            {details && details.serverResponse && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200 mb-3">
                <h4 className="text-sm font-medium text-red-800 mb-2">🔧 Chi tiết lỗi từ server</h4>
                <p className="text-xs text-red-700 font-mono">{details.serverResponse}</p>
              </div>
            )}

            {/* Suggestions for inventory errors */}
            {isInsufficientInventory && !details?.solutions && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Gợi ý</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Giảm số lượng xuất theo tồn kho hiện có</li>
                  <li>• Kiểm tra lại tồn kho sau khi nhập hàng</li>
                  <li>• Tạo phiếu nhập trước khi xuất hàng</li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-2 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6">
          <div className="flex justify-end space-x-3">
            {/* Special action for inventory errors with available quantity */}
            {isInventoryError && productInfo && productInfo.availableQuantity !== undefined && productInfo.availableQuantity > 0 && onAction && (
              <button
                onClick={() => onAction('adjust_quantity', productInfo.availableQuantity)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Điều chỉnh về {productInfo.availableQuantity}
              </button>
            )}
            <button
              onClick={handleAction}
              className={`${buttonColor} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification; 