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
    try {
      // Call the backend to invalidate the refresh token
      fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent along with the request
      });
  
      // Clear the token from localStorage and reset the user context
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
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