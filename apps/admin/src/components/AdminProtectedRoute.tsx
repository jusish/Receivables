import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminProtectedRoute: React.FC = () => {
  const { adminUser, token, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  if (!token || !adminUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
