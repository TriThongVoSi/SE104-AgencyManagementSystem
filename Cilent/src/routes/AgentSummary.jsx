import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const AgentSummary = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/agents");
      const data = await response.json();
      if (data.code === 200) {
        setAgents(data.data);
      } else {
        setAgents([]);
        toast.warning("Không có dữ liệu đại lý!");
      }
    } catch (err) {
      console.error("Lỗi khi fetch đại lý:", err);
      toast.error("Lỗi khi tải danh sách đại lý!");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentDetails = async (agentId) => {
    try {
      const response = await fetch(`http://localhost:8080/agent/getAgentById?agentId=${agentId}`);
      const data = await response.json();
      if (data.code === 200) {
        setSelectedAgent(data.data);
        setShowDetailPopup(true);
      } else {
        toast.warning("Không tìm thấy thông tin đại lý!");
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đại lý:", err);
      toast.error("Lỗi khi tải chi tiết đại lý!");
    }
  };

  const exportToExcel = () => {
    const worksheetData = agents.map((agent, index) => ({
      STT: index + 1,
      "Tên Đại Lý": agent.agentName,
      Loại: agent.agentTypeID?.agentTypeName || "---",
      Quận: agent.districtID?.districtName || "---",
      "Tiền Nợ Hiện Tại": `${agent.debtMoney?.toLocaleString("vi-VN")}₫`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AgentSummary");
    XLSX.writeFile(workbook, "AgentSummary.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Danh Sách Đại Lý Tổng Quát", 10, 10);
    doc.autoTable({
      head: [["STT", "Tên Đại Lý", "Loại", "Quận", "Tiền Nợ Hiện Tại"]],
      body: agents.map((agent, index) => [
        index + 1,
        agent.agentName,
        agent.agentTypeID?.agentTypeName || "---",
        agent.districtID?.districtName || "---",
        `${agent.debtMoney?.toLocaleString("vi-VN")}₫`,
      ]),
    });
    doc.save("AgentSummary.pdf");
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">
        Danh Sách Đại Lý Tổng Quát
      </h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={fetchAgents}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Làm mới danh sách
        </button>
      </div>

      {loading ? (
        <p className="text-white">Đang tải dữ liệu...</p>
      ) : agents.length > 0 ? (
        <>
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-2">STT</th>
                  <th className="py-3 px-4">Tên Đại Lý</th>
                  <th className="py-3 px-4">Loại</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Địa chỉ</th>
                  <th className="py-3 px-4">Quận</th>
                  <th className="py-3 px-4">Ngày tiếp nhận</th>
                  <th className="py-3 px-4">Tiền Nợ Hiện Tại</th>
                  <th className="py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, index) => (
                  <tr
                    key={agent.agentID}
                    className="border-b border-gray-700 hover:bg-gray-700"
                  >
                    <td className="py-3 px-2">{index + 1}</td>
                    <td className="py-3 px-4">{agent.agentName}</td>
                    <td className="py-3 px-4">{agent.agentTypeID?.agentTypeName || "---"}</td>
                    <td className="py-3 px-4">{agent.districtID?.districtName || "---"}</td>
                    <td className="py-3 px-4">{agent.debtMoney?.toLocaleString("vi-VN")}₫</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => fetchAgentDetails(agent.agentID)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex space-x-4">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Xuất Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Xuất PDF
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-400">Không có đại lý nào!</p>
      )}

      {showDetailPopup && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-black p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Chi Tiết Đại Lý - {selectedAgent.agentName}
            </h2>
            <p><strong>Tên đại lý:</strong> {selectedAgent.agentName}</p>
            <p><strong>Loại:</strong> {selectedAgent.agentTypeID?.agentTypeName || "---"}</p>
            <p><strong>Quận:</strong> {selectedAgent.districtID?.districtName || "---"}</p>
            <p><strong>Địa chỉ:</strong> {selectedAgent.address || "---"}</p>
            <p><strong>Số điện thoại:</strong> {selectedAgent.phone || "---"}</p>
            <p><strong>Email:</strong> {selectedAgent.email || "---"}</p>
            <p><strong>Tiền nợ hiện tại:</strong> {selectedAgent.debtMoney?.toLocaleString("vi-VN")}₫</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDetailPopup(false)}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSummary;