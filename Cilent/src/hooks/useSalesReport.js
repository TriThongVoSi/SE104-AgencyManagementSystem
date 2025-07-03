import { useState, useCallback } from 'react';
import { salesReportApi } from '../utils/reportService';

const useSalesReport = () => {
  const [state, setState] = useState({
    report: null,
    details: [],
    monthlyStatistics: [],
    loading: false,
    error: null,
    reportExists: false
  });

  // Kiểm tra và lấy báo cáo sử dụng API mới
  const checkAndFetchReport = useCallback(async (month, year) => {
    if (!month || !year) {
      setState(prev => ({
        ...prev,
        report: null,
        details: [],
        reportExists: false,
        error: null
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Sử dụng API mới: /api/sales-reports/summary
      const result = await salesReportApi.getSalesReportSummary(month, year);
      
      setState(prev => ({
        ...prev,
        report: result.report,
        details: result.details,
        loading: false,
        error: null,
        reportExists: true
      }));
    } catch (error) {
      console.error('Error checking and fetching report:', error);
      
      if (error.message.includes('404') || error.message.includes('SALES_REPORT_NOT_FOUND')) {
        // Báo cáo chưa tồn tại
        setState(prev => ({
          ...prev,
          report: null,
          details: [],
          loading: false,
          error: null,
          reportExists: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Có lỗi xảy ra',
          reportExists: false
        }));
      }
    }
  }, []);

  // Tạo báo cáo mới sử dụng API chính thức
  const createReport = useCallback(async (month, year) => {
    if (!month || !year) {
      return { success: false, error: 'Vui lòng chọn tháng và năm!' };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Tạo báo cáo sử dụng API chính thức
      await salesReportApi.createSalesReportOfficial(month, year);
      
      // Sau khi tạo thành công, lấy dữ liệu báo cáo
      const result = await salesReportApi.getSalesReportSummary(month, year);
      
      setState(prev => ({
        ...prev,
        report: result.report,
        details: result.details,
        loading: false,
        error: null,
        reportExists: true
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error creating report:', error);
      let errorMessage = 'Có lỗi xảy ra khi tạo báo cáo';
      
      if (error.message.includes('SALES_REPORT_ALREADY_EXISTS')) {
        errorMessage = 'Báo cáo cho tháng này đã tồn tại!';
      } else if (error.message.includes('BAD_REQUEST')) {
        errorMessage = 'Tháng hoặc năm không hợp lệ!';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Lấy thống kê theo tháng
  const fetchMonthlyStatistics = useCallback(async () => {
    try {
      const monthlyData = await salesReportApi.getMonthlyStatistics();
      setState(prev => ({
        ...prev,
        monthlyStatistics: monthlyData
      }));
    } catch (error) {
      console.error('Error fetching monthly statistics:', error);
    }
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setState({
      report: null,
      details: [],
      monthlyStatistics: [],
      loading: false,
      error: null,
      reportExists: false
    });
  }, []);

  // Refresh data
  const refreshData = useCallback(async (month, year) => {
    await checkAndFetchReport(month, year);
    await fetchMonthlyStatistics();
  }, [checkAndFetchReport, fetchMonthlyStatistics]);

  return {
    ...state,
    checkAndFetchReport,
    createReport,
    fetchMonthlyStatistics,
    resetState,
    refreshData
  };
};

export default useSalesReport; 