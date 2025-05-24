
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
  isLoading: boolean; // Added for compatibility
  isAuthenticated: boolean; // Added missing property
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile?: (updates: Partial<UserType>) => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>; // Added missing property
  verifyEmail: (token: string) => Promise<boolean>; // Added missing property
  sendEmailVerification: (email: string) => Promise<void>; // Added missing property
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

  // Derived state
  const isAuthenticated = user !== null;

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
      // Real authentication would happen here with backend API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if admin user
      const isAdmin = email.includes('admin');

      // Create user based on authentication
      const authenticatedUser: UserType = {
        id: 'user-' + Date.now(),
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
      localStorage.setItem('axiomify_user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      
      // Redirect to appropriate dashboard
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
      // Real signup would happen here with backend API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new user
      const newUser: UserType = {
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
      localStorage.setItem('axiomify_user', JSON.stringify(newUser));
      setUser(newUser);
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

  // Function to update password
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    // In a real app, this would verify the current password and update to the new one
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock success - in a real app we would verify the current password
    return Promise.resolve();
  };

  // Function to verify email with token
  const verifyEmail = async (token: string): Promise<boolean> => {
    // In a real app, this would verify the token with the backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // For now, just return success if token exists
    return Promise.resolve(!!token);
  };

  // Function to send verification email
  const sendEmailVerification = async (email: string) => {
    // In a real app, this would trigger an email send via the backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock success
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isLoading: loading,
      isAuthenticated,
      login, 
      signup, 
      logout, 
      updateUserProfile,
      updatePassword,
      verifyEmail,
      sendEmailVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};
