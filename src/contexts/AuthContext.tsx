'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, AdminUser, LoginCredentials, AuthResponse } from '../lib/authApi';

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!admin;

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Verificar si hay datos en localStorage
      const storedAdmin = authAPI.getAdmin();
      const token = authAPI.getToken();
      
      if (storedAdmin && token) {
        // Verificar token con el servidor
        const verification = await authAPI.verifyToken();
        
        if (verification.valid && verification.admin) {
          setAdmin(verification.admin);
        } else {
          // Token inválido, limpiar datos
          authAPI.logout();
          setAdmin(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success && response.admin) {
        setAdmin(response.admin);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setAdmin(null);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    return await authAPI.changePassword(oldPassword, newPassword);
  };

  const refreshAdmin = async () => {
    const response = await authAPI.getMe();
    if (response.success && response.admin) {
      setAdmin(response.admin);
    }
  };

  const value: AuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    changePassword,
    refreshAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
