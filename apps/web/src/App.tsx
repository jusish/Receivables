import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { ReceivablesPage } from './features/receivables/ReceivablesPage';
import { PaymentsPage } from './features/payments/PaymentsPage';
import { CollectionsPage } from './features/collections/CollectionsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AuditTrailPage } from './features/audit/AuditTrailPage';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public-only routes: logged in users are redirected to dashboard */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected routes: unauthenticated users are redirected to login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="receivables" element={<ReceivablesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit" element={<AuditTrailPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
};
