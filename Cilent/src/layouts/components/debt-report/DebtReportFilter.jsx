import React from 'react';

const DebtReportFilter = ({
  selectedMonth,
  selectedYear,
  selectedAgent,
  agents,
  onMonthChange,
  onYearChange,
  onAgentChange
}) => {
  // Tạo danh sách tháng
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  // Tạo danh sách năm (5 năm trước đến 2 năm sau)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    years.push({ value: year, label: `Năm ${year}` });
  }

  /**
   * Reset filter về mặc định (tháng/năm hiện tại, tất cả đại lý)
   */
  const handleReset = () => {
    const now = new Date();
    onMonthChange(now.getMonth() + 1);
    onYearChange(now.getFullYear());
    onAgentChange('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
      {/* Month Filter */}
      <div className="min-w-0 flex-1 lg:flex-none lg:w-40">
        <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Tháng
        </label>
        <select
          id="month-filter"
          value={selectedMonth}
          onChange={(e) => onMonthChange(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      {/* Year Filter */}
      <div className="min-w-0 flex-1 lg:flex-none lg:w-40">
        <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Năm
        </label>
        <select
          id="year-filter"
          value={selectedYear}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {years.map((year) => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>
      </div>

      {/* Agent Filter */}
      <div className="min-w-0 flex-1 lg:flex-none lg:w-60">
        <label htmlFor="agent-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Đại lý
        </label>
        <select
          id="agent-filter"
          value={selectedAgent}
          onChange={(e) => onAgentChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Tất cả đại lý</option>
          {agents.map((agent) => (
            <option key={agent.agentId} value={agent.agentId}>
              {agent.agentName} (ID: {agent.agentId})
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <div className="flex-shrink-0">
        <button
          onClick={handleReset}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 text-sm"
          title="Đặt lại bộ lọc"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Đặt lại
        </button>
      </div>
    </div>
  );
};

export default DebtReportFilter; 