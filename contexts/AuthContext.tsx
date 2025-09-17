import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import * as api from '../api';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for user session on initial load
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('currentUser');
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          setCurrentUser(user);
        } catch (error) {
           console.error("Failed to parse stored user:", error);
           localStorage.removeItem('token');
           localStorage.removeItem('currentUser');
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  // Persist currentUser to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);


  const login = async (email: string, password: string) => {
    const { data } = await api.login({ email, password });
    localStorage.setItem('token', data.token);
    setCurrentUser(data.user);
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    const { data } = await api.register({ name, username, email, password });
    localStorage.setItem('token', data.token);
    setCurrentUser(data.user);
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    // Optional: force a full page reload to clear all state
    window.location.href = '/';
  };

  const value = {
      currentUser,
      setCurrentUser,
      login,
      register,
      logout,
      isLoading
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
