import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import OutletDetails from './pages/OutletDetails';
import CompareOutlets from './pages/CompareOutlets';
import Settings from './pages/Settings';
import OrderReports from './pages/reports/OrderReports';
import CustomerReports from './pages/reports/CustomerReports';
import MenuReports from './pages/reports/MenuReports';
import InventoryReports from './pages/reports/InventoryReports';
import StaffReports from './pages/reports/StaffReports';
import TableReports from './pages/reports/TableReports';
import CouponReports from './pages/reports/CouponReports';
import PaymentReports from './pages/reports/PaymentReports';
import PaymentSettleReports from './pages/reports/PaymentSettleReports';
import OrderStatusReports from './pages/reports/OrderStatusReports';
import SplitTableReports from './pages/reports/SplitTableReports';
import JoinTableReports from './pages/reports/JoinTableReports';
import TipReports from './pages/reports/TipReports';
import ServiceChargeReports from './pages/reports/ServiceChargeReports';
import SpecialDiscountReports from './pages/reports/SpecialDiscountReports';
import UdhariReports from './pages/reports/UdhariReports';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/globals.css';
import { StatisticsProvider } from './context/StatisticsContext';


function App() {
  return (
    <StatisticsProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
          </ProtectedRoute>
        } />
        <Route path="/statistics" element={
          <ProtectedRoute>
          <Layout>
            <Statistics />
          </Layout>
          </ProtectedRoute>
        } />
        <Route path="/outlet-details" element={
          <ProtectedRoute>
          <Layout>
            <OutletDetails />
          </Layout>
          </ProtectedRoute>
        } />
        <Route path="/compare-outlets" element={
          <ProtectedRoute>
          <Layout>
            <CompareOutlets />
          </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
          </ProtectedRoute>
        } />
        
        {/* Report Routes */}
        <Route path="/reports/orders" element={
          <ProtectedRoute>
            <Layout>
              <OrderReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/customers" element={
          <ProtectedRoute>
            <Layout>
              <CustomerReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/menu" element={
          <ProtectedRoute>
            <Layout>
              <MenuReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/inventory" element={
          <ProtectedRoute>
            <Layout>
              <InventoryReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/staff" element={
          <ProtectedRoute>
            <Layout>
              <StaffReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/tables" element={
          <ProtectedRoute>
            <Layout>
              <TableReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/coupons" element={
          <ProtectedRoute>
            <Layout>
              <CouponReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/payment-reports" element={
          <ProtectedRoute>
            <Layout>
              <PaymentReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/payments" element={
          <ProtectedRoute>
            <Layout>
              <PaymentSettleReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/order-status" element={
          <ProtectedRoute>
            <Layout>
              <OrderStatusReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/split-tables" element={
          <ProtectedRoute>
            <Layout>
              <SplitTableReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/join-tables" element={
          <ProtectedRoute>
            <Layout>
              <JoinTableReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/tips" element={
          <ProtectedRoute>
            <Layout>
              <TipReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/service-charges" element={
          <ProtectedRoute>
            <Layout>
              <ServiceChargeReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/special-discounts" element={
          <ProtectedRoute>
            <Layout>
              <SpecialDiscountReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/udhari" element={
          <ProtectedRoute>
            <Layout>
              <UdhariReports />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StatisticsProvider>
  );
}

export default App; 