import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('aura_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('aura_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Sync authentication state on initial mount
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('aura_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            const userData = {
              ...res.data.data.user,
              profile: res.data.data.profile,
            };
            setUser(userData);
            localStorage.setItem('aura_user', JSON.stringify(userData));
          }
        } catch (error) {
          // Token is invalid/expired
          localStorage.removeItem('aura_token');
          localStorage.removeItem('aura_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: loggedUser } = res.data.data;
      localStorage.setItem('aura_token', newToken);
      localStorage.setItem('aura_user', JSON.stringify(loggedUser));
      setToken(newToken);
      setUser(loggedUser);
      return loggedUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (patientData) => {
    const res = await api.post('/auth/register', patientData);
    if (res.data.success) {
      const { token: newToken, user: registeredUser } = res.data.data;
      localStorage.setItem('aura_token', newToken);
      localStorage.setItem('aura_user', JSON.stringify(registeredUser));
      setToken(newToken);
      setUser(registeredUser);
      return registeredUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_user');
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('aura_user', JSON.stringify(newUserData));
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        const userData = {
          ...res.data.data.user,
          profile: res.data.data.profile,
        };
        setUser(userData);
        localStorage.setItem('aura_user', JSON.stringify(userData));
        return userData;
      }
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshProfile,
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
