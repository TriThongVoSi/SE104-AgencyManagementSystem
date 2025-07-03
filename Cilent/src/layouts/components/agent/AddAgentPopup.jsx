import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    FiX,
    FiUser,
    FiMapPin,
    FiPhone,
    FiMail,
    FiTag,
    FiMap,
    FiDollarSign,
    FiAlertTriangle,
    FiInfo,
} from 'react-icons/fi';
import DebtLimitWarning from '../common/DebtLimitWarning';
import DebtLimitService from '../../../utils/debtLimitService';

const AddAgentPopup = ({ onClose, onAdded }) => {
    const [formData, setFormData] = useState({
        agentName: '',
        address: '',
        phone: '',
        email: '',
        agentTypeId: '',
        districtId: '',
        debtMoney: '',
        receptionDate: '',
    });
    const [agentTypes, setAgentTypes] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [error, setError] = useState('');
    const [selectedAgentType, setSelectedAgentType] = useState(null);
    const [debtLimitInfo, setDebtLimitInfo] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };
        const fetchAgentTypes = async () => {
            try {
                const res = await fetch('http://localhost:8080/agent-type/all', { headers });
                const data = await res.json();
                if (data.code === 200) {
                    setAgentTypes(data.data);
                }
            } catch (err) {
                toast.error('Lỗi khi tải loại đại lý!');
            }
        };
        const fetchDistricts = async () => {
            try {
                const res = await fetch('http://localhost:8080/district/all', { headers });
                const data = await res.json();
                if (data.code === 200) {
                    setDistricts(data.data);
                }
            } catch (err) {
                toast.error('Lỗi khi tải quận!');
            }
        };
        fetchAgentTypes();
        fetchDistricts();
    }, []);

    // Update debt limit info when agent type or debt money changes
    // Cập nhật thông tin giới hạn nợ khi loại đại lý hoặc số tiền nợ thay đổi
    useEffect(() => {
        try {
            if (selectedAgentType && selectedAgentType.maximumDebt && formData.debtMoney) {
                const debtAmount = parseInt(formData.debtMoney) || 0;
                const limitInfo = DebtLimitService.checkDebtLimit(debtAmount, selectedAgentType.maximumDebt);
                setDebtLimitInfo(limitInfo);
            } else {
                setDebtLimitInfo(null);
            }
        } catch (error) {
            console.error('Error checking debt limit:', error);
            setDebtLimitInfo(null);
        }
    }, [formData.debtMoney, selectedAgentType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'agentTypeId') {
            const selectedType = agentTypes.find(t => t.agentTypeId == value);
            setSelectedAgentType(selectedType);
        }
        
        if (name === 'debtMoney' && value < 0) {
            setError('Số tiền nợ không được nhỏ hơn 0');
        } else {
            setError('');
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        if (formData.debtMoney < 0) {
            setError('Số tiền nợ không được nhỏ hơn 0');
            return;
        }
        
        // Validate required fields
        // Kiểm tra các trường bắt buộc
        if (!formData.agentName.trim()) {
            setError('Vui lòng nhập tên đại lý');
            return;
        }
        if (!formData.districtId) {
            setError('Vui lòng chọn quận');
            return;
        }
        if (!formData.agentTypeId) {
            setError('Vui lòng chọn loại đại lý');
            return;
        }

        setError('');
        
        try {
            const payload = {
                ...formData,
                agentType: agentTypes.find(t => t.agentTypeId == formData.agentTypeId),
                district: districts.find(d => d.districtId == formData.districtId),
            };
            
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/api/agents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log('Dữ liệu từ API:', data);

            if (response.ok && (data.code === 200 || data.code === 201)) {
                toast.success(data.message || 'Thêm đại lý thành công!');
                onClose();
                onAdded();
            } else {
                // Xử lý các loại lỗi khác nhau
                if (data.code === 400) {
                    // Check for debt limit exceeded error
                    // Kiểm tra lỗi vượt quá giới hạn nợ
                    if (data.message && (
                        data.message.includes('vượt quá giới hạn') ||
                        data.message.includes('AGENT_DEBT_LIMIT_EXCEEDED') ||
                        data.message.includes('debt.*limit.*exceeded')
                    )) {
                        setError({
                            type: 'debt_limit_exceeded',
                            message: data.message,
                            data: data.data
                        });
                        toast.error('❌ Số tiền nợ vượt quá giới hạn cho phép!', {
                            autoClose: 5000
                        });
                    } else if (data.message === 'Số lượng đại lý trong quận đã đạt tối đa') {
                        // Hiển thị lỗi giới hạn đại lý
                        setError(data.message);
                        toast.error('⚠️ ' + data.message);
                    } else {
                        // Lỗi validation khác
                        setError(data.message || 'Dữ liệu không hợp lệ');
                        toast.error(data.message || 'Dữ liệu không hợp lệ');
                    }
                } else if (data.code === 500) {
                    // Lỗi server
                    setError('Lỗi hệ thống, vui lòng thử lại sau');
                    toast.error('Lỗi hệ thống, vui lòng thử lại sau');
                } else {
                    // Lỗi khác
                    setError(data.message || 'Có lỗi xảy ra khi thêm đại lý');
                    toast.error(data.message || 'Có lỗi xảy ra khi thêm đại lý');
                }
            }
        } catch (error) {
            console.error('Lỗi khi gửi dữ liệu:', error);
            setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white text-gray-800 p-8 rounded-2xl w-[500px] shadow-2xl transform transition-all duration-300 scale-100 hover:scale-[1.02] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                {/* Tiêu đề */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FiUser className="text-blue-600" />
                        Thêm Đại Lý Mới
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <FiX className="text-gray-500 hover:text-gray-700 text-xl" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {/* Agent Name */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-gray-400" />
                        </div>
                        <input
                            name="agentName"
                            placeholder="Tên đại lý *"
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                    </div>

                    {/* Address */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMapPin className="text-gray-400" />
                        </div>
                        <input
                            name="address"
                            placeholder="Địa chỉ *"
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiPhone className="text-gray-400" />
                        </div>
                        <input
                            name="phone"
                            placeholder="Số điện thoại *"
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="text-gray-400" />
                        </div>
                        <input
                            name="email"
                            placeholder="Email *"
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                    </div>

                    {/* Agent Type */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiTag className="text-gray-400" />
                        </div>
                        <select
                            name="agentTypeId"
                            value={formData.agentTypeId}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        >
                            <option value="">Chọn loại đại lý</option>
                            {agentTypes.map((type) => (
                                <option key={type.agentTypeId} value={type.agentTypeId}>
                                    {type.agentTypeName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* District */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMap className="text-gray-400" />
                        </div>
                        <select
                            name="districtId"
                            value={formData.districtId}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        >
                            <option value="">Chọn quận</option>
                            {districts.map((d) => (
                                <option key={d.districtId} value={d.districtId}>
                                    {d.districtName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selected Agent Type Info */}
                    {selectedAgentType && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <FiInfo className="text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Thông tin loại đại lý đã chọn</span>
                            </div>
                            <div className="text-sm text-blue-700 ml-6">
                                <div>Loại: <span className="font-semibold">{selectedAgentType.agentTypeName}</span></div>
                                <div>Giới hạn nợ tối đa: <span className="font-semibold">{selectedAgentType.maximumDebt ? DebtLimitService.formatCurrency(selectedAgentType.maximumDebt) : '0 đ'}</span></div>
                            </div>
                        </div>
                    )}

                    {/* Debt Limit Warning - Show on real-time */}
                    {debtLimitInfo && debtLimitInfo.isValid && (debtLimitInfo.isExceeded || debtLimitInfo.isNearLimit) && (
                        <div>
                            <DebtLimitWarning
                                debtAmount={parseInt(formData.debtMoney) || 0}
                                maxDebt={selectedAgentType?.maximumDebt || 0}
                                agentTypeName={selectedAgentType?.agentTypeName}
                                agentName={formData.agentName || 'Đại lý mới'}
                                size="sm"
                                showDetails={true}
                                variant="card"
                            />
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div>
                            {error.type === 'debt_limit_exceeded' ? (
                                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-lg shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-red-200 rounded-full flex-shrink-0">
                                            <FiAlertTriangle className="text-red-700 text-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-red-800 font-bold text-sm mb-2">
                                                ❌ LỖI THÊM ĐẠI LÝ: SỐ TIỀN NỢ VƯỢT QUÁ GIỚI HẠN CHO PHÉP!
                                            </h4>
                                            <div className="text-red-700 text-xs space-y-1">
                                                <div>📝 Chi tiết lỗi: <span className="font-medium">{error.message}</span></div>
                                                {debtLimitInfo && debtLimitInfo.isValid && (
                                                    <>
                                                        <div>💰 Số tiền bạn nhập: <span className="font-semibold">{DebtLimitService.formatCurrency(parseInt(formData.debtMoney) || 0)}</span></div>
                                                        <div>🚫 Giới hạn tối đa cho phép: <span className="font-semibold">{DebtLimitService.formatCurrency(selectedAgentType?.maximumDebt || 0)}</span></div>
                                                        <div>⚠️ Vượt quá: <span className="font-bold text-red-800">{DebtLimitService.formatCurrency(debtLimitInfo.exceededAmount)}</span></div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <FiInfo className="text-red-600 flex-shrink-0" />
                                                    <span>
                                                        <strong>Giải pháp:</strong> Vui lòng nhập số tiền nhỏ hơn hoặc bằng {DebtLimitService.formatCurrency(selectedAgentType?.maximumDebt || 0)} 
                                                        hoặc chọn loại đại lý có giới hạn nợ cao hơn.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FiAlertTriangle className="text-red-500 flex-shrink-0" />
                                        <span className="text-red-700 text-sm font-medium">{error}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Debt Money */}
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <FiDollarSign className="text-gray-400" />
                            </div>
                            <input
                                name="debtMoney"
                                placeholder="Số tiền nợ"
                                value={formData.debtMoney}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-400 no-spinner ${
                                    error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                } ${debtLimitInfo && debtLimitInfo.isExceeded ? 'border-red-400 bg-red-50' : ''}`}
                                type="number"
                                min="0"
                            />
                        </div>
                                                 {selectedAgentType && formData.debtMoney && debtLimitInfo && debtLimitInfo.isValid && !debtLimitInfo.isExceeded && debtLimitInfo.remainingLimit !== undefined && (
                             <div className="mt-1 text-sm text-blue-600">
                                 Còn lại có thể nợ: <span className="font-semibold">{DebtLimitService.formatCurrency(debtLimitInfo.remainingLimit)}</span>
                             </div>
                         )}
                    </div>

                    {/* Reception Date */}
                    <div className="relative">
                        <label className="block text-gray-500 text-sm mb-1 ml-1">Ngày tiếp nhận</label>
                        <input
                            type="date"
                            name="receptionDate"
                            value={formData.receptionDate}
                            onChange={handleChange}
                            className="w-full pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end mt-8 space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={debtLimitInfo && debtLimitInfo.isExceeded}
                        className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl ${
                            debtLimitInfo && debtLimitInfo.isExceeded
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        }`}
                    >
                        Thêm Đại Lý
                    </button>
                </div>

                {/* Help text for button state */}
                {(debtLimitInfo && debtLimitInfo.isExceeded) && (
                    <div className="mt-2 text-center">
                        <p className="text-xs text-gray-500 italic">
                            ⚠️ Không thể thêm đại lý khi số tiền nợ vượt quá giới hạn cho phép
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddAgentPopup;

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


