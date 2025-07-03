import React, { useState } from 'react';
import ReportList from '../layouts/components/report/ReportList';
import ReportForm from '../layouts/components/report/ReportForm';
import ReportDetail from '../layouts/components/report/ReportDetail';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportType, setReportType] = useState('debt'); // Mặc định là debt

  const handleShowForm = (type) => {
    setReportType(type);
    setShowForm(true);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Báo cáo</h1>
        <p className="text-gray-600">Tạo và quản lý các báo cáo doanh số và công nợ</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => handleShowForm('debt')}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>📊</span>
          <span>Thêm Báo cáo công nợ</span>
        </button>
        <button
          onClick={() => handleShowForm('sales')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>📈</span>
          <span>Thêm Báo cáo doanh số</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="mb-6">
          <ReportForm
            onCancel={() => setShowForm(false)}
            setReports={setReports}
            reportType={reportType}
          />
        </div>
      )}

      {/* Report List */}
      <ReportList
        reports={reports}
        setReports={setReports}
        reportType={reportType}
        onViewReport={handleViewReport}
      />

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetail
          report={selectedReport}
          reportType={reportType}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

export default ReportManagement;