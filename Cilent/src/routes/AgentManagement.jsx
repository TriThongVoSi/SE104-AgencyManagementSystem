import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import AddAgentPopup from '../layouts/components/agent/AddAgentPopup';
import EditAgentPopup from '../layouts/components/agent/EditAgentPopup';
import DeleteAgentPopup from '../layouts/components/agent/DeleteAgentPopup';
import ViewAgentPopup from '../layouts/components/agent/ViewAgentPopup';
import { getAllAgents } from '../utils/agentService';

const AgentManagement = () => {
	const [agents, setAgents] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [showAddAgentPopup, setShowAddAgentPopup] = useState(false);
	const [editingAgent, setEditingAgent] = useState(null);
	const [showDeletePopup, setShowDeletePopup] = useState(false);
	const [selectedAgent, setSelectedAgent] = useState(null);
	const [viewingAgent, setViewingAgent] = useState(null);

	const fetchAgents = async () => {
		try {
			// Sử dụng agentService nếu có
			const result = await getAllAgents();
			if (result.status === 'success') {
				setAgents(result.data);
			}
		} catch (error) {
			console.error('Lỗi khi gọi API:', error);
		}
	};

	// Lấy dữ liệu từ API khi component mount
	useEffect(() => {
		fetchAgents();
	}, []);

	// Lọc theo từ khóa tìm kiếm
	const filteredAgents = agents.filter((agent) =>
		agent.agentName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="p-6 bg-gray-900 min-h-screen text-white">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-red-500">
					Quản Lý Đại Lý
				</h1>
				<p className="text-gray-400 mt-2">Danh sách đại lý từ API</p>
			</div>
			{/* Tìm kiếm & Thêm */}
			<div className="flex justify-between items-center mb-6">
				<div className="relative w-1/3">
					<input
						type="text"
						placeholder="Tìm kiếm đại lý..."
						className="w-full p-2 pl-10 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:text-white"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
				</div>
				<button
					className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center"
					onClick={() => setShowAddAgentPopup(true)}
				>
					<FaPlus className="mr-2" /> Thêm Đại Lý Mới
				</button>
			</div>

			{/* Popup Thêm Đại Lý */}
			{showAddAgentPopup && (
				<AddAgentPopup
					onClose={() => setShowAddAgentPopup(false)}
					onAdded={fetchAgents}
				/>
			)}

			{viewingAgent && (
				<ViewAgentPopup
					agent={viewingAgent}
					onClose={() => setViewingAgent(null)}
				/>
			)}

			{editingAgent && (
				<EditAgentPopup
					agent={editingAgent}
					onClose={() => setEditingAgent(null)}
					onUpdated={fetchAgents}
				/>
			)}

			{showDeletePopup && selectedAgent && (
				<DeleteAgentPopup
					agent={selectedAgent}
					onClose={() => setShowDeletePopup(false)}
					onDeleted={fetchAgents}
				/>
			)}

			{/* Bảng đại lý */}
			<div className="bg-gray-800 p-4 rounded-lg shadow-lg">
				<table className="w-full text-left">
					<thead>
						<tr className="border-b border-gray-700">
							<th className="py-3 px-4">STT</th>
							<th className="py-3 px-4">Tên Đại Lý</th>
							<th className="py-3 px-4">Loại</th>
							<th className="py-3 px-4">Quận</th>
							<th className="py-3 px-4">Nợ</th>
							<th className="py-3 px-4">Hành Động</th>
						</tr>
					</thead>
					<tbody>
						{filteredAgents.map((agent, idx) => (
							<tr
								key={agent.agentID || agent.agentId || idx}
								className="border-b border-gray-700 hover:bg-gray-700"
							>
								<td className="py-3 px-4">{idx + 1}</td>
								<td className="py-3 px-4">{agent.agentName}</td>
								<td className="py-3 px-4">{agent.agentType?.agentTypeName || '---'}</td>
								<td className="py-3 px-4">{agent.district?.districtName || '---'}</td>
								<td className="py-3 px-4">{agent.debtMoney?.toLocaleString('vi-VN')}₫</td>
								<td className="py-3 px-4 space-x-2">
									<button
										onClick={() => setViewingAgent(agent)}
										className="text-green-400 hover:text-green-300"
									>
										<FaEye />
									</button>
									<button
										onClick={() => setEditingAgent(agent)}
										className="text-blue-500 hover:text-blue-400"
									>
										<FaEdit />
									</button>
									<button
										onClick={() => {
											setSelectedAgent(agent);
											setShowDeletePopup(true);
										}}
										className="text-red-500 hover:text-red-400"
									>
										<FaTrash />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AgentManagement;
