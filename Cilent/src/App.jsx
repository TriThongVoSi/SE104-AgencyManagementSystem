import React, { useState, createContext, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, PERMISSIONS, ROLES } from './contexts/AuthContext';
import ProtectedRoute from './layouts/components/auth/ProtectedRoute';
import RoleBasedRoute from './layouts/components/auth/RoleBasedRoute';
import Login from './layouts/components/auth/Login';
import MainLayout from './layouts/layout/MainLayout';
import Unauthorized from './routes/Unauthorized';
import AgentManagement from './routes/AgentManagement';

import ExportReceipts from './routes/ExportReceipts';
import HomePage from './routes/HomePage';
import ImportReceipts from './routes/ImportReceipts';
import ProductManagement from './routes/ProductManagement';
import ReceiptDetails from './layouts/components/receipt/ReceiptDetails';
import ProductDetails from './layouts/components/product/ProductDetails';
import SettingsManagement from './routes/SettingsManagement';
import UserManagement from './routes/UserManagement';
import PaymentReceipts from './routes/PaymentReceipt';
import DebtPage from './routes/DebtPage';

import SalesReport from './routes/SalesReport';

export const ReceiptContext = createContext();
export const ProductContext = createContext();

function App() {
  const [receipts, setReceipts] = useState({
    import: [],
    export: [],
  });
  const [products, setProducts] = useState([]);

  const updateReceipts = useCallback((newReceipts) => {
    setReceipts(prev => ({ ...prev, ...newReceipts }));
  }, []);

  const updateProducts = useCallback((newProducts) => {
    setProducts(newProducts);
  }, []);

  const Placeholder = ({ pageName }) => (
    <div className="flex flex-col items-center justify-center py-12 mt-28">
      <h1 className="text-3xl font-bold mb-4">{pageName}</h1>
      <p className="text-gray-600 text-xl">Trang này đang được phát triển</p>
    </div>
  );

  return (
    <AuthProvider>
      <ReceiptContext.Provider value={{ receipts, updateReceipts }}>
        <ProductContext.Provider value={{ products, updateProducts }}>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <RoleBasedRoute>
                  <MainLayout />
                </RoleBasedRoute>
              }>
                {/* Dashboard - Tất cả user đều có quyền truy cập */}
                <Route index element={<HomePage />} />

                {/* Quản lý đại lý - Tất cả role có thể xem */}
                <Route path="agents" element={<AgentManagement />} />

                {/* Quản lý sản phẩm - Admin, Warehouse, Viewer */}
                <Route path="products" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN, ROLES.WAREHOUSE, ROLES.VIEWER]}>
                    <ProductManagement />
                  </RoleBasedRoute>
                } />
                <Route path="products/detail/:id" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN, ROLES.WAREHOUSE, ROLES.VIEWER]}>
                    <ProductDetails />
                  </RoleBasedRoute>
                } />

                {/* Phiếu nhập - Admin và Warehouse */}
                <Route path="import-receipts" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN, ROLES.WAREHOUSE]}>
                    <ImportReceipts />
                  </RoleBasedRoute>
                } />

                {/* Phiếu xuất - Admin và Warehouse */}
                <Route path="export-receipts" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN, ROLES.WAREHOUSE]}>
                    <ExportReceipts />
                  </RoleBasedRoute>
                } />

                {/* Phiếu thu tiền - Admin và Debt */}
                <Route path="payment-receipts" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN, ROLES.DEBT, ROLES.DEBT_ACCOUNTANT]}>
                    <PaymentReceipts />
                  </RoleBasedRoute>
                } />

                {/* Trang công nợ - Admin và Debt */}
                <Route path="debt" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN, ROLES.DEBT, ROLES.DEBT_ACCOUNTANT]}>
                    <DebtPage />
                  </RoleBasedRoute>
                } />



                {/* Báo cáo doanh số - Admin, Debt, Viewer */}
                <Route path="sales-report" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN, ROLES.DEBT, ROLES.DEBT_ACCOUNTANT, ROLES.VIEWER]}>
                    <SalesReport />
                  </RoleBasedRoute>
                } />

                {/* Chi tiết phiếu - Admin và Warehouse */}
                <Route path="receipts/:type/:receiptId/details" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN, ROLES.WAREHOUSE]}>
                    <ReceiptDetails />
                  </RoleBasedRoute>
                } />

                {/* Quản lý người dùng - Chỉ Admin */}
                <Route path="users" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN]}>
                    <UserManagement />
                  </RoleBasedRoute>
                } />

                {/* Cài đặt hệ thống - Chỉ Admin */}
                <Route path="settings" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN]}>
                    <SettingsManagement />
                  </RoleBasedRoute>
                } />

                {/* Quy định - Chỉ Admin */}
                <Route path="regulations" element={
                  <RoleBasedRoute requiredRoles={[ROLES.ADMIN]}>
                    <Placeholder pageName="Quy định" />
                  </RoleBasedRoute>
                } />

                {/* 404 Page */}
                <Route path="*" element={
                  <RoleBasedRoute>
                    <Placeholder pageName="Trang không tồn tại" />
                  </RoleBasedRoute>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
        </ProductContext.Provider>
      </ReceiptContext.Provider>
    </AuthProvider>
  );
}

export default App;