'use client'
import React, { createContext, useContext } from 'react';
import { useState ,useEffect } from 'react';
type User = {
  id: string;
  name: string;
  email: string;
  // Add any other properties that your user object might have
};

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the token and set the user
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: decodedToken.sub, email: decodedToken.username,name: decodedToken.name || '' });
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUser({ 
      id: decodedToken.sub, 
      email: decodedToken.username,
      name: decodedToken.name || '' // Add this line
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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