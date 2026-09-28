import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { AdminPublicOnlyRoute } from './components/AdminPublicOnlyRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardPage } from './features/dashboard/AdminDashboardPage';
import { AdminBusinessesPage } from './features/businesses/AdminBusinessesPage';
import { AdminUsersPage } from './features/users/AdminUsersPage';
import { AdminRequestsPage } from './features/requests/AdminRequestsPage';
import { AdminErrorsPage } from './features/errors/AdminErrorsPage';
import { AdminHealthPage } from './features/health/AdminHealthPage';
import { AdminAuditPage } from './features/audit/AdminAuditPage';
import { AdminSettingsPage } from './features/settings/AdminSettingsPage';
import { AdminLoginPage } from './features/auth/AdminLoginPage';
import { AdminForgotPasswordPage } from './features/auth/AdminForgotPasswordPage';

export const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Public-only admin routes: logged-in admins are redirected to console */}
        <Route element={<AdminPublicOnlyRoute />}>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<AdminForgotPasswordPage />} />
        </Route>

        {/* Protected admin routes: unauthenticated or non-admins are redirected to login */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="businesses" element={<AdminBusinessesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="requests" element={<AdminRequestsPage />} />
            <Route path="errors" element={<AdminErrorsPage />} />
            <Route path="health" element={<AdminHealthPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
};
