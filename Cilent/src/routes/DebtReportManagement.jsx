import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import debtReportService from '../utils/debtReportService';
import { getAllAgents } from '../utils/agentService';
import DebtReportTable from '../layouts/components/debt-report/DebtReportTable';
import DebtReportForm from '../layouts/components/debt-report/DebtReportForm';
import DebtReportFilter from '../layouts/components/debt-report/DebtReportFilter';
import DebtReportSummaryTable from '../layouts/components/debt-report/DebtReportSummaryTable';
import { 
  FaPlus, 
  FaSync, 
  FaTable, 
  FaChartLine, 
  FaFileExcel,
  FaEye,
  FaCalculator,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const DebtReportManagement = () => {
  const { user, hasRole, ROLES } = useAuth();
  const [debtReports, setDebtReports] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedAgent, setSelectedAgent] = useState('');
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  
  // View mode: 'individual' | 'summary'
  const [viewMode, setViewMode] = useState('summary');

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  // Auto-fetch data when filters change
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      if (viewMode === 'summary') {
        fetchSummaryData();
      } else {
        if (selectedAgent) {
          fetchDebtReport(selectedMonth, selectedYear, selectedAgent);
        } else {
          fetchAllDebtReports(selectedMonth, selectedYear);
        }
      }
    }
  }, [selectedMonth, selectedYear, selectedAgent, viewMode]);

  /**
   * Lấy danh sách đại lý
   */
  const fetchAgents = async () => {
    try {
      const result = await getAllAgents();
      if (result.status === 'success') {
        setAgents(result.data || []);
      } else {
        setError('Không thể lấy danh sách đại lý');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Lỗi khi lấy danh sách đại lý');
    }
  };

  /**
   * Lấy dữ liệu tổng hợp báo cáo công nợ
   */
  const fetchSummaryData = async () => {
    setSummaryLoading(true);
    setError('');
    
    try {
      const result = await debtReportService.getDebtReportSummary(selectedMonth, selectedYear);
      if (result.success) {
        setSummaryData(result.data);
        setSuccess('');
      } else {
        setSummaryData(null);
        setError(result.error || 'Không thể lấy bảng tổng hợp báo cáo công nợ');
      }
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setSummaryData(null);
      setError('Lỗi khi lấy bảng tổng hợp báo cáo công nợ');
    } finally {
      setSummaryLoading(false);
    }
  };

  /**
   * Lấy báo cáo công nợ theo đại lý cụ thể
   */
  const fetchDebtReport = async (month, year, agentId) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await debtReportService.getDebtReport(month, year, agentId);
      if (result.success) {
        setDebtReports(result.data ? [result.data] : []);
        setSuccess('');
      } else {
        setDebtReports([]);
        setError(result.error || 'Không tìm thấy báo cáo công nợ');
      }
    } catch (error) {
      console.error('Error fetching debt report:', error);
      setDebtReports([]);
      setError('Lỗi khi lấy báo cáo công nợ');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lấy tất cả báo cáo công nợ theo tháng/năm
   */
  const fetchAllDebtReports = async (month, year) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await debtReportService.getAllDebtReportsByMonth(month, year);
      if (result.success) {
        setDebtReports(result.data || []);
        setSuccess('');
      } else {
        setDebtReports([]);
        setError(result.error || 'Không tìm thấy báo cáo công nợ');
      }
    } catch (error) {
      console.error('Error fetching debt reports:', error);
      setDebtReports([]);
      setError('Lỗi khi lấy danh sách báo cáo công nợ');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tạo báo cáo công nợ mới
   */
  const handleCreateReport = async (reportData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await debtReportService.createDebtReport(reportData);
      if (result.success) {
        setSuccess(result.message || 'Tạo báo cáo công nợ thành công');
        setShowCreateForm(false);
        toast.success('Tạo báo cáo công nợ thành công');
        
        // Refresh the data
        if (viewMode === 'summary') {
          fetchSummaryData();
        } else {
          if (selectedAgent) {
            fetchDebtReport(selectedMonth, selectedYear, selectedAgent);
          } else {
            fetchAllDebtReports(selectedMonth, selectedYear);
          }
        }
      } else {
        setError(result.error || 'Không thể tạo báo cáo công nợ');
        toast.error(result.error || 'Không thể tạo báo cáo công nợ');
      }
    } catch (error) {
      console.error('Error creating debt report:', error);
      setError('Lỗi khi tạo báo cáo công nợ');
      toast.error('Lỗi khi tạo báo cáo công nợ');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật báo cáo công nợ
   */
  const handleUpdateReport = async (reportData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await debtReportService.updateDebtReport(reportData);
      if (result.success) {
        setSuccess(result.message || 'Cập nhật báo cáo công nợ thành công');
        setShowEditForm(false);
        setEditingReport(null);
        toast.success('Cập nhật báo cáo công nợ thành công');
        
        // Refresh the data
        if (viewMode === 'summary') {
          fetchSummaryData();
        } else {
          if (selectedAgent) {
            fetchDebtReport(selectedMonth, selectedYear, selectedAgent);
          } else {
            fetchAllDebtReports(selectedMonth, selectedYear);
          }
        }
      } else {
        setError(result.error || 'Không thể cập nhật báo cáo công nợ');
        toast.error(result.error || 'Không thể cập nhật báo cáo công nợ');
      }
    } catch (error) {
      console.error('Error updating debt report:', error);
      setError('Lỗi khi cập nhật báo cáo công nợ');
      toast.error('Lỗi khi cập nhật báo cáo công nợ');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa báo cáo công nợ
   */
  const handleDeleteReport = async (report) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa báo cáo công nợ này?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await debtReportService.deleteDebtReport(
        report.month,
        report.year,
        report.agent.agentId
      );
      
      if (result.success) {
        setSuccess(result.message || 'Xóa báo cáo công nợ thành công');
        toast.success('Xóa báo cáo công nợ thành công');
        
        // Refresh the data
        if (viewMode === 'summary') {
          fetchSummaryData();
        } else {
          if (selectedAgent) {
            fetchDebtReport(selectedMonth, selectedYear, selectedAgent);
          } else {
            fetchAllDebtReports(selectedMonth, selectedYear);
          }
        }
      } else {
        setError(result.error || 'Không thể xóa báo cáo công nợ');
        toast.error(result.error || 'Không thể xóa báo cáo công nợ');
      }
    } catch (error) {
      console.error('Error deleting debt report:', error);
      setError('Lỗi khi xóa báo cáo công nợ');
      toast.error('Lỗi khi xóa báo cáo công nợ');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Chỉnh sửa báo cáo
   */
  const handleEditReport = (report) => {
    setEditingReport(report);
    setShowEditForm(true);
  };

  /**
   * Tổng hợp báo cáo công nợ
   */
  const handleSummarizeReports = async () => {
    if (!window.confirm(
      `Bạn có chắc chắn muốn tổng hợp báo cáo công nợ cho tháng ${selectedMonth}/${selectedYear}? ` +
      'Thao tác này sẽ tự động tạo/cập nhật báo cáo cho tất cả đại lý.'
    )) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await debtReportService.summarizeDebtReports(selectedMonth, selectedYear);
      if (result.success) {
        setSuccess(result.message || 'Tổng hợp báo cáo công nợ thành công');
        toast.success('Tổng hợp báo cáo công nợ thành công');
        
        // Refresh data
        if (viewMode === 'summary') {
          fetchSummaryData();
        } else {
          if (selectedAgent) {
            fetchDebtReport(selectedMonth, selectedYear, selectedAgent);
          } else {
            fetchAllDebtReports(selectedMonth, selectedYear);
          }
        }
      } else {
        setError(result.error || 'Không thể tổng hợp báo cáo công nợ');
        toast.error(result.error || 'Không thể tổng hợp báo cáo công nợ');
      }
    } catch (error) {
      console.error('Error summarizing reports:', error);
      setError('Lỗi khi tổng hợp báo cáo công nợ');
      toast.error('Lỗi khi tổng hợp báo cáo công nợ');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xem chi tiết đại lý
   */
  const handleViewAgentDetail = (agent) => {
    setSelectedAgent(agent.agentId);
    setViewMode('individual');
  };

  /**
   * Làm mới dữ liệu
   */
  const handleRefresh = () => {
    if (viewMode === 'summary') {
      fetchSummaryData();
    } else {
      if (selectedAgent) {
        fetchDebtReport(selectedMonth, selectedYear, selectedAgent);
      } else {
        fetchAllDebtReports(selectedMonth, selectedYear);
      }
    }
  };

  /**
   * Clear messages
   */
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Check permissions
  const canCreate = hasRole(ROLES.ADMIN) || hasRole(ROLES.DEBT_ACCOUNTANT);
  const canEdit = hasRole(ROLES.ADMIN) || hasRole(ROLES.DEBT_ACCOUNTANT);
  const canDelete = hasRole(ROLES.ADMIN) || hasRole(ROLES.DEBT_ACCOUNTANT);
  const canSummarize = hasRole(ROLES.ADMIN) || hasRole(ROLES.DEBT_ACCOUNTANT);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý Báo cáo Công nợ
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Theo dõi và quản lý báo cáo công nợ của các đại lý
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-2">
              {canSummarize && (
                <button
                  onClick={handleSummarizeReports}
                  disabled={loading || summaryLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaCalculator className="mr-2" />}
                  Tổng hợp
                </button>
              )}
              
              {canCreate && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <FaPlus className="mr-2" />
                  Tạo báo cáo
                </button>
              )}
              
              <button
                onClick={handleRefresh}
                disabled={loading || summaryLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <FaSync className={`mr-2 ${(loading || summaryLoading) ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <DebtReportFilter
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedAgent={selectedAgent}
            agents={agents}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onAgentChange={setSelectedAgent}
            onClearAgent={() => setSelectedAgent('')}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  viewMode === 'summary'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FaChartLine className="inline mr-2" />
                Bảng tổng hợp
              </button>
              <button
                onClick={() => setViewMode('individual')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  viewMode === 'individual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FaTable className="inline mr-2" />
                Chi tiết từng đại lý
              </button>
            </div>

            {selectedAgent && viewMode === 'individual' && (
              <div className="flex items-center text-sm text-gray-600">
                <FaEye className="mr-1" />
                Đang xem: {agents.find(a => a.agentId == selectedAgent)?.agentName || 'Đại lý'}
                <button
                  onClick={() => setSelectedAgent('')}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <FaExclamationTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              <div className="text-sm text-red-700">
                {error}
                <button
                  onClick={clearMessages}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <FaInfoCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
              <div className="text-sm text-green-700">
                {success}
                <button
                  onClick={clearMessages}
                  className="ml-2 text-green-500 hover:text-green-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {viewMode === 'summary' ? (
          <DebtReportSummaryTable
            summaryData={summaryData}
            loading={summaryLoading}
            onViewAgentDetail={handleViewAgentDetail}
            month={selectedMonth}
            year={selectedYear}
          />
        ) : (
          <div className="bg-white shadow rounded-lg">
            <DebtReportTable
              debtReports={debtReports}
              loading={loading}
              onEdit={canEdit ? handleEditReport : null}
              onDelete={canDelete ? handleDeleteReport : null}
            />
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <DebtReportForm
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateReport}
            agents={agents}
            defaultMonth={selectedMonth}
            defaultYear={selectedYear}
            loading={loading}
            title="Tạo Báo cáo Công nợ Mới"
            isEditing={false}
          />
        )}

        {/* Edit Form Modal */}
        {showEditForm && editingReport && (
          <DebtReportForm
            isOpen={showEditForm}
            onClose={() => {
              setShowEditForm(false);
              setEditingReport(null);
            }}
            onSubmit={handleUpdateReport}
            agents={agents}
            defaultMonth={selectedMonth}
            defaultYear={selectedYear}
            initialData={editingReport}
            loading={loading}
            title="Chỉnh sửa Báo cáo Công nợ"
            isEditing={true}
          />
        )}
      </div>
    </div>
  );
};

export default DebtReportManagement; 