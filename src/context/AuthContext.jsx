import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [rol, setRol] = useState(() => localStorage.getItem('rol') || null);

  const isAuthenticated = !!user;

  const login = useCallback((userData, userRol) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('rol', userRol);
    setUser(userData);
    setRol(userRol);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('rol');
    setUser(null);
    setRol(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, rol, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
