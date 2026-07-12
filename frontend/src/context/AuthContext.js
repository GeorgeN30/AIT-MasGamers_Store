/**
 * Contexto global de autenticacion.
 * Restaura la sesion desde localStorage al iniciar; AppNavigator
 * reacciona a isAuthenticated e isInitializing.
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { storageService, STORAGE_KEYS } from '../services/storageService';
import { ticketService } from '../services/ticketService';
import useWebSocket from '../hooks/useWebSocket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const raw = await storageService.getItem(STORAGE_KEYS.SESSION);
        if (raw) {
          const { token: savedToken, user: savedUser } = JSON.parse(raw);
          setToken(savedToken);
          setUser(savedUser);
        }
      } catch {
        await storageService.removeItem(STORAGE_KEYS.SESSION);
      } finally {
        setIsInitializing(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setToken(response.token);
      setUser(response.user);
      await storageService.setItem(
        STORAGE_KEYS.SESSION,
        JSON.stringify({ token: response.token, user: response.user })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      await authService.register(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setIsLoading(true);
    try {
      return await authService.forgotPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email, codigo) => {
    setIsLoading(true);
    try {
      return await authService.verifyOtp(email, codigo);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email, newPassword, resetToken) => {
    setIsLoading(true);
    try {
      return await authService.resetPassword(email, newPassword, resetToken);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email) => {
    setIsLoading(true);
    try {
      return await authService.resendOtp(email);
    } finally {
      setIsLoading(false);
    }
  };

  const [unreadCount, setUnreadCount] = useState(0);
  const { connected: wsConnected, lastEvent: wsEvent } = useWebSocket(token, !!user);

  useEffect(() => {
    if (wsEvent?.type === 'STATUS_CHANGE' || wsEvent?.type === 'NEW_MESSAGE' || wsEvent?.type === 'TICKET_CREATED') {
      setUnreadCount(prev => prev + 1);
    }
  }, [wsEvent]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await ticketService.getNotifications();
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, []);

  const updateProfile = async (newName, newAvatar) => {
    const result = await authService.updateProfile({ name: newName, avatar: newAvatar });
    const updatedUser = result.user;
    setUser(updatedUser);

    if (token) {
      await storageService.setItem(
        STORAGE_KEYS.SESSION,
        JSON.stringify({ token, user: updatedUser })
      );
    }

    return result;
  };

  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    try {
      return await authService.changePassword(currentPassword, newPassword);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storageService.removeItem(STORAGE_KEYS.SESSION);
  };

  const value = {
    user,
    token,
    isLoading,
    isInitializing,
    isAuthenticated: !!user,
    wsConnected,
    wsEvent,
    unreadCount,
    refreshUnreadCount,
    login,
    register,
    forgotPassword,
    verifyOtp,
    resetPassword,
    resendOtp,
    updateProfile,
    changePassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
