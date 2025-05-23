
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type UserType = {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  avatar?: string;
  kycVerified: boolean;
  country?: string;
  currency?: string;
  currencySymbol?: string;
};

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile?: (updates: Partial<UserType>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const storedUser = localStorage.getItem('axiomify_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Mock authentication delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would validate credentials against the backend
      // For this demo, we'll use a dummy user if email includes "admin"
      const isAdmin = email.includes('admin');

      // Create a mock user based on the input
      const mockUser: UserType = {
        id: '123456',
        name: email.split('@')[0],
        email,
        walletBalance: isAdmin ? 10000 : 1000,
        kycVerified: isAdmin,
        avatar: undefined,
        country: 'US',
        currency: 'USD',
        currencySymbol: '$'
      };

      // Store user in localStorage for persistence
      localStorage.setItem('axiomify_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      // Redirect to dashboard or admin
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      // Mock signup delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a mock user based on the input
      const mockUser: UserType = {
        id: 'user-' + Date.now(),
        name,
        email,
        walletBalance: 0,
        kycVerified: false,
        avatar: undefined,
        country: 'US',
        currency: 'USD',
        currencySymbol: '$'
      };

      // Store user in localStorage for persistence
      localStorage.setItem('axiomify_user', JSON.stringify(mockUser));
      setUser(mockUser);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('axiomify_user');
    setUser(null);
    navigate('/');
  };

  // Function to update user profile
  const updateUserProfile = (updates: Partial<UserType>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    localStorage.setItem('axiomify_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
