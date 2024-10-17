import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

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
      setUser({ id: decodedToken.sub, email: decodedToken.username });
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUser({ id: decodedToken.sub, email: decodedToken.username });
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