import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import type { AuthContextType, AuthUser, UserRole } from '../../../types';

export type { UserRole } from '../../../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rfp_session');
    if (!token) {
      setIsLoading(false);
      return;
    }
    axios.get<{ user: AuthUser }>('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        setUser(response.data.user);
      })
      .catch(() => localStorage.removeItem('rfp_session'))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    role: user?.role || 'Doctor',
    permissions: user?.permissions || [],
    setRole: (role: UserRole) => setUser((current) => current ? { ...current, role } : current),
    login: async (email, password) => {
      const response = await axios.post<{ token: string; user: AuthUser }>('/api/auth/login', { email, password });
      localStorage.setItem('rfp_session', response.data.token);
      axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
      setUser(response.data.user);
    },
    logout: async () => {
      const token = localStorage.getItem('rfp_session');
      await axios.post('/api/auth/logout', {}, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      localStorage.removeItem('rfp_session');
      delete axios.defaults.headers.common.Authorization;
      setUser(null);
    },
  }), [isLoading, user]);

  return <AuthContext.Provider value={value}><Outlet /></AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
