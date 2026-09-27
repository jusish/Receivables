import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardPage } from './features/dashboard/AdminDashboardPage';
import { AdminBusinessesPage } from './features/businesses/AdminBusinessesPage';
import { AdminRequestsPage } from './features/requests/AdminRequestsPage';
import { AdminHealthPage } from './features/health/AdminHealthPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="businesses" element={<AdminBusinessesPage />} />
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route path="health" element={<AdminHealthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
