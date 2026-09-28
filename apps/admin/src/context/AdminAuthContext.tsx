import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApiFetch } from '../lib/api';

export interface AdminUser {
  id: string;
  phone: string;
  fullName: string;
  adminRole: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await adminApiFetch('/auth/me');
      if (!data.adminRole) {
        throw new Error('Not an admin user');
      }
      setAdminUser({
        id: data.id,
        phone: data.phone,
        fullName: data.fullName,
        adminRole: data.adminRole,
      });
      localStorage.setItem(
        'admin_user',
        JSON.stringify({
          id: data.id,
          phone: data.phone,
          fullName: data.fullName,
          adminRole: data.adminRole,
        })
      );
    } catch (err) {
      console.warn('Failed to verify admin token, logging out:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (phone: string, password: string) => {
    const data = await adminApiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password, portalType: 'admin' }),
    });

    if (!data.user?.adminRole) {
      throw new Error('You do not possess administrative permissions for the Admin Console.');
    }

    localStorage.setItem('admin_token', data.accessToken);
    localStorage.setItem('admin_user', JSON.stringify(data.user));

    setToken(data.accessToken);
    setAdminUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
