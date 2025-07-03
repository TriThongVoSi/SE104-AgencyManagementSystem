import React from 'react';
import {
	FiX,
	FiUser,
	FiMapPin,
	FiPhone,
	FiMail,
	FiTag,
	FiMap,
	FiDollarSign,
	FiEye,
} from 'react-icons/fi';

const ViewAgentPopup = ({ agent, onClose }) => {
	if (!agent) return null;

	// eslint-disable-next-line no-unused-vars
	const InfoRow = ({ icon: Icon, label, value }) => (
		<div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
			<div className="p-2 bg-blue-100 rounded-full mt-1">
				<Icon className="text-blue-600 text-sm" />
			</div>
			<div className="flex-1">
				<p className="text-sm font-medium text-gray-600 mb-1">
					{label}
				</p>
				<p className="text-gray-900 font-medium">
					{value || 'Chưa có thông tin'}
				</p>
			</div>
		</div>
	);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
			<div className="bg-white text-gray-800 p-8 rounded-2xl w-[550px] shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
					<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
						<div className="p-2 bg-purple-100 rounded-full">
							<FiEye className="text-purple-600 text-xl" />
						</div>
						Chi Tiết Đại Lý
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
					>
						<FiX className="text-gray-500 hover:text-gray-700 text-xl" />
					</button>
				</div>

				{/* Agent Details */}
				<div className="space-y-2">
					<InfoRow
						icon={FiUser}
						label="Tên đại lý"
						value={agent.agentName}
					/>

					<InfoRow
						icon={FiMapPin}
						label="Địa chỉ"
						value={agent.address}
					/>

					<InfoRow
						icon={FiMap}
						label="Quận"
						value={agent.district?.districtName}
					/>

					<InfoRow
						icon={FiPhone}
						label="Số điện thoại"
						value={agent.phone}
					/>

					<InfoRow icon={FiMail} label="Email" value={agent.email} />

					<InfoRow
						icon={FiTag}
						label="Loại đại lý"
						value={agent.agentType?.agentTypeName}
					/>

					<InfoRow
						icon={FiEye}
						label="Ngày tiếp nhận"
						value={agent.receptionDate}
					/>

					<div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
						<div className="p-2 bg-green-100 rounded-full mt-1">
							<FiDollarSign className="text-green-600 text-sm" />
						</div>
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600 mb-1">
								Số tiền nợ
							</p>
							<p className="text-lg font-bold text-green-600">
								{agent.debtMoney?.toLocaleString('vi-VN') ||
									'0'}
								₫
							</p>
						</div>
					</div>
				</div>

				{/* Close Button */}
				<div className="flex justify-center mt-8 pt-4 border-t border-gray-200">
					<button
						onClick={onClose}
						className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
					>
						Đóng
					</button>
				</div>
			</div>
		</div>
	);
};

export default ViewAgentPopup;
