'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { analytics } from '@/services/analytics.service';

import { api } from '../lib/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface UserClinic {
  id: number;
  name: string;
  role: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  clinics: UserClinic[];
  activeClinic: UserClinic | null;
  setActiveClinic: (clinic: UserClinic) => void;
  login: (token: string, clinicName?: string, user?: AuthUser, clinics?: UserClinic[]) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [clinics, setClinics] = useState<UserClinic[]>([]);
  const [activeClinic, setActiveClinicState] = useState<UserClinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Active cleanup for legacy localStorage items
    if (typeof window !== 'undefined') {
      const legacyKeys = ['authUser', 'clinicName', 'authClinics', 'activeClinic'];
      legacyKeys.forEach((key) => localStorage.removeItem(key));
    }

    const fetchMe = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data) {
          setUser(response.data.user);
          setClinics(response.data.clinics);

          // Maintain activeClinic selection in sessionStorage
          const savedActiveClinic = sessionStorage.getItem('activeClinic');
          if (savedActiveClinic) {
            try {
              const parsed = JSON.parse(savedActiveClinic);
              // ensure clinic is still valid
              const freshClinic = response.data.clinics.find((c: UserClinic) => c.id === parsed.id);
              if (freshClinic) {
                setActiveClinicState(freshClinic);
                sessionStorage.setItem('activeClinic', JSON.stringify(freshClinic));
                api.defaults.headers.common['X-Clinic-Id'] = String(freshClinic.id);
              } else if (response.data.clinics.length > 0) {
                setActiveClinicState(response.data.clinics[0]);
                sessionStorage.setItem('activeClinic', JSON.stringify(response.data.clinics[0]));
                api.defaults.headers.common['X-Clinic-Id'] = String(response.data.clinics[0].id);
              }
            } catch {
              /* ignore */
            }
          } else if (response.data.clinics.length > 0) {
            setActiveClinicState(response.data.clinics[0]);
            sessionStorage.setItem('activeClinic', JSON.stringify(response.data.clinics[0]));
            api.defaults.headers.common['X-Clinic-Id'] = String(response.data.clinics[0].id);
          }
        }
      } catch {
        // Not authenticated or failed to hydrate
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  const setActiveClinic = (clinic: UserClinic) => {
    setActiveClinicState(clinic);
    sessionStorage.setItem('activeClinic', JSON.stringify(clinic));
    // Set header for API calls
    api.defaults.headers.common['X-Clinic-Id'] = String(clinic.id);
  };

  // Sync X-Clinic-Id header on mount
  useEffect(() => {
    if (activeClinic) {
      api.defaults.headers.common['X-Clinic-Id'] = String(activeClinic.id);
    }
  }, [activeClinic]);

  const login = (
    _token: string,
    _clinicName?: string,
    authUser?: AuthUser,
    authClinics?: UserClinic[],
  ) => {
    if (authUser) {
      setUser(authUser);
    }
    if (authClinics) {
      setClinics(authClinics);

      if (authClinics.length === 1) {
        setActiveClinic(authClinics[0]);
        router.push('/dashboard');
      } else if (authClinics.length > 1) {
        router.push('/select-clinic');
      } else {
        // No clinics — new user, start onboarding from terms step
        router.push('/onboarding/terms');
      }
    } else {
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout failed on backend', e);
    }

    analytics.reset();

    sessionStorage.removeItem('activeClinic');
    delete api.defaults.headers.common['X-Clinic-Id'];

    setUser(null);
    setClinics([]);
    setActiveClinicState(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        token: null,
        user,
        clinics,
        activeClinic,
        setActiveClinic,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
