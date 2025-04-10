import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
    navigate('/');
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await axios.post('http://127.0.0.1:8000/account/logout/', {}, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
      }
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        console.error('Logout error:', error);
      }
    } finally {
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}