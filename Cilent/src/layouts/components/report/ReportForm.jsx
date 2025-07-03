import React, { useState } from 'react';

const ReportForm = ({ onCancel, setReports, reportType }) => {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [agentId, setAgentId] = useState('');
  const [firstDebt, setFirstDebt] = useState('');
  const [arisenDebt, setArisenDebt] = useState('');
  const [quantityExportReceipt, setQuantityExportReceipt] = useState('');
  const [totalValue, setTotalValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReport = {
      reportId: Date.now(), // ID giả lập
      agentId: parseInt(agentId),
      month: parseInt(month),
      year: parseInt(year),
      ...(reportType === 'debt' && {
        firstDebt: parseInt(firstDebt),
        arisenDebt: parseInt(arisenDebt),
        lastDebt: parseInt(firstDebt) + parseInt(arisenDebt),
      }),
      ...(reportType === 'sales' && {
        quantityExportReceipt: parseInt(quantityExportReceipt),
        totalValue: parseInt(totalValue),
        proportion: (parseInt(totalValue) / 20000000) * 100, // Giả lập tỷ lệ (tổng doanh thu giả định 20 triệu)
      }),
    };
    setReports((prev) => [...prev, newReport]);
    onCancel();
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Thêm {reportType === 'debt' ? 'Báo cáo công nợ' : 'Báo cáo doanh số'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Month */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
            placeholder="Nhập tháng (1-12)"
            min="1"
            max="12"
            required
          />
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
            placeholder="Nhập năm"
            min="2020"
            max="2030"
            required
          />
        </div>

        {/* Agent ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Agent ID</label>
          <input
            type="number"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
            placeholder="Nhập Agent ID"
            required
          />
        </div>

        {/* Debt Report Fields */}
        {reportType === 'debt' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nợ đầu kỳ (VNĐ)</label>
              <input
                type="number"
                value={firstDebt}
                onChange={(e) => setFirstDebt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
                placeholder="Nhập số tiền nợ đầu kỳ"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nợ phát sinh (VNĐ)</label>
              <input
                type="number"
                value={arisenDebt}
                onChange={(e) => setArisenDebt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
                placeholder="Nhập số tiền nợ phát sinh"
                min="0"
                required
              />
            </div>
          </>
        )}

        {/* Sales Report Fields */}
        {reportType === 'sales' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng phiếu xuất</label>
              <input
                type="number"
                value={quantityExportReceipt}
                onChange={(e) => setQuantityExportReceipt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
                placeholder="Nhập số lượng phiếu xuất"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tổng giá trị (VNĐ)</label>
              <input
                type="number"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
                placeholder="Nhập tổng giá trị"
                min="0"
                required
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button 
            type="submit" 
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
          >
            Thêm báo cáo
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm; 