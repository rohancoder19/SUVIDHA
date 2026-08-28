import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure Axios to send HTTP-Only cookies with every request
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('suvidha_token') || null);

  // Set Authorization bearer header if token present
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('suvidha_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('suvidha_token');
    }
  }, [token]);

  // Session Restoration on App Startup via /api/auth/me
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem('suvidha_token');
        if (savedToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
        const res = await axios.get('/api/auth/me', { headers: { 'x-restore-session': 'true' } });
        if (isMounted && res.data.success && res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    restoreSession();
    return () => { isMounted = false; };
  }, []);

  // Global Axios Interceptor for 401 Unauthorized Session Expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const isRestoreReq = error.config?.headers?.['x-restore-session'];
        const reqUrl = error.config?.url || '';

        if (error.response && error.response.status === 401 && !isRestoreReq && !reqUrl.includes('/api/auth/login')) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('suvidha_token');
          localStorage.removeItem('suvidha_user');
          
          // Redirect to /login with current path saved
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/forgot-password') && !currentPath.includes('/reset-password')) {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);


  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.response?.data?.message || 'Invalid email or password.'
      };
    }
  };

  const register = async (name, email, password, role, profile) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role, profile });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to send password reset request.' };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, { password });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Password reset failed.' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/auth/profile', profileData);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Profile update failed.' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout API note:', err.message);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('suvidha_token');
      localStorage.removeItem('suvidha_user');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
