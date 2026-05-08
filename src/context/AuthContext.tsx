import React, { createContext, useContext, useState } from 'react';

export interface User {
  username: string;
  role: string;
  gems: number;
  collection: string[];
  free_spins: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  login: (username: string, role: string, gems: number, collection: string[], free_spins: number) => void;
  logout: () => void;
  refreshUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('capy_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username: string, role: string, gems: number = 0, collection: string[] = [], free_spins: number = 0) => {
    const newUser = { username, role, gems, collection, free_spins };
    setUser(newUser);
    localStorage.setItem('capy_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('capy_user');
  };

  const refreshUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('capy_user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!user;
  const isDemo = user?.role === 'demo';

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isDemo, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
