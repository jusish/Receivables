import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export interface User {
  id: string;
  phone: string;
  fullName: string;
  adminRole?: string | null;
}

export interface Business {
  id: string;
  name: string;
  code: string;
  currency: string;
  timezone?: string;
  role?: string;
  settings?: {
    collectionsEnabled?: boolean;
    agingSchedule?: string;
    customAgingDays?: number[];
  };
}

interface AuthContextType {
  user: User | null;
  business: Business | null;
  businesses: Business[];
  role: string | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  signup: (payload: any) => Promise<void>;
  switchBusiness: (businessId: string) => Promise<void>;
  createBusiness: (payload: {
    name: string;
    currency?: string;
    timezone?: string;
    agingSchedule?: string;
  }) => Promise<void>;
  setSession: (
    token: string,
    user: User,
    business: Business,
    role: string,
    businesses?: Business[],
  ) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [business, setBusiness] = useState<Business | null>(() => {
    const saved = localStorage.getItem('business');
    return saved ? JSON.parse(saved) : null;
  });
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('businesses');
    return saved ? JSON.parse(saved) : [];
  });
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setSession = (
    newToken: string,
    newUser: User,
    newBusiness: Business,
    newRole: string,
    newBusinesses?: Business[],
  ) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('business', JSON.stringify(newBusiness));
    if (newBusiness?.id) {
      localStorage.setItem('receivables_last_business_id', newBusiness.id);
    }
    localStorage.setItem('role', newRole);
    if (newBusinesses) {
      localStorage.setItem('businesses', JSON.stringify(newBusinesses));
      setBusinesses(newBusinesses);
    }
    setToken(newToken);
    setUser(newUser);
    setBusiness(newBusiness);
    setRole(newRole);
  };

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/auth/me');
      setUser({
        id: data.id,
        phone: data.phone,
        fullName: data.fullName,
        adminRole: data.adminRole,
      });

      if (data.memberships && Array.isArray(data.memberships)) {
        const mappedBiz = data.memberships.map((m: any) => ({
          id: m.businessId,
          name: m.businessName,
          code: m.businessCode,
          currency: m.currency,
          role: m.role,
        }));
        setBusinesses(mappedBiz);
        localStorage.setItem('businesses', JSON.stringify(mappedBiz));
      }

      if (data.activeBusiness) {
        setBusiness(data.activeBusiness);
        localStorage.setItem('business', JSON.stringify(data.activeBusiness));
        localStorage.setItem('receivables_last_business_id', data.activeBusiness.id);
      }
      if (data.activeRole) {
        setRole(data.activeRole);
        localStorage.setItem('role', data.activeRole);
      }
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id,
          phone: data.phone,
          fullName: data.fullName,
          adminRole: data.adminRole,
        }),
      );
    } catch (err: any) {
      console.warn('Failed to verify token:', err);
      // On mobile browsers, momentary offline or lock/sleep state must not destroy an active session
      if (err?.message?.includes('401') || err?.message?.toLowerCase().includes('unauthorized')) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Mobile web session handler: re-verify session when mobile device unlocks or tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && localStorage.getItem('token')) {
        refreshUser();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [token]);

  const login = async (phone: string, password: string) => {
    const lastBusinessId = localStorage.getItem('receivables_last_business_id') || undefined;
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password, portalType: 'web', lastBusinessId }),
    });

    const bizList = data.businesses || (data.business ? [data.business] : []);
    if (data.business?.id) {
      localStorage.setItem('receivables_last_business_id', data.business.id);
    }
    setSession(data.accessToken, data.user, data.business, data.role, bizList);
  };

  const signup = async (payload: any) => {
    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const bizList = data.businesses || (data.business ? [data.business] : []);
    if (data.business?.id) {
      localStorage.setItem('receivables_last_business_id', data.business.id);
    }
    setSession(data.accessToken, data.user, data.business, data.role, bizList);
  };

  const switchBusiness = async (targetBusinessId: string) => {
    const data = await apiFetch('/auth/switch-business', {
      method: 'POST',
      body: JSON.stringify({ businessId: targetBusinessId }),
    });

    const bizList = data.businesses || (data.business ? [data.business] : []);
    if (data.business?.id) {
      localStorage.setItem('receivables_last_business_id', data.business.id);
    }
    setSession(data.accessToken, data.user, data.business, data.role, bizList);
  };

  const createBusiness = async (payload: {
    name: string;
    currency?: string;
    timezone?: string;
    agingSchedule?: string;
  }) => {
    const data = await apiFetch('/business', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const bizList = data.businesses || (data.business ? [data.business] : []);
    if (data.business?.id) {
      localStorage.setItem('receivables_last_business_id', data.business.id);
    }
    setSession(data.accessToken, data.user, data.business, data.role, bizList);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('business');
    localStorage.removeItem('businesses');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setBusiness(null);
    setBusinesses([]);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        businesses,
        role,
        token,
        isLoading,
        login,
        signup,
        switchBusiness,
        createBusiness,
        setSession,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
