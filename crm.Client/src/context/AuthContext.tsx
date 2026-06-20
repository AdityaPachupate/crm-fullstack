import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true' || 
           sessionStorage.getItem('isLoggedIn') === 'true';
  });

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    try {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://crm-api-1ugj.onrender.com').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        if (rememberMe) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('authToken', data.token);
        } else {
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('authToken', data.token);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    // Clear CRM data to ensure fresh sync on next login
    localStorage.removeItem('clinic_crm_data');
    localStorage.removeItem('leads_quick_status_buttons_v1');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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
