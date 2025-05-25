
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
  lastDepositTime?: string;
  twoFactorEnabled?: boolean;
  phone?: string;
  profileImageUrl?: string;
  passportUrl?: string;
  sessions?: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
  }>;
};

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile?: (updates: Partial<UserType>) => void;
  updateUser?: (user: UserType) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  sendEmailVerification: (email: string) => Promise<void>;
  updateCurrency: (currency: string, symbol: string) => void;
  enableTwoFactor: (code: string) => Promise<boolean>;
  disableTwoFactor: (code: string) => Promise<boolean>;
  getSessions: () => Array<any>;
  terminateSession: (sessionId: string) => Promise<void>;
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

  const isAuthenticated = user !== null;

  useEffect(() => {
    const storedUser = localStorage.getItem('axiomify_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const isAdmin = email.includes('admin');

      const authenticatedUser: UserType = {
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email,
        walletBalance: 0,
        kycVerified: false,
        avatar: undefined,
        country: 'US',
        currency: 'USD',
        currencySymbol: '$',
        twoFactorEnabled: false,
        phone: '',
        profileImageUrl: '',
        passportUrl: '',
        sessions: [{
          id: 'session-' + Date.now(),
          device: 'Current Device',
          location: 'Washington, DC',
          lastActive: new Date().toISOString()
        }]
      };

      localStorage.setItem('axiomify_user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUser: UserType = {
        id: 'user-' + Date.now(),
        name,
        email,
        walletBalance: 0,
        kycVerified: false,
        avatar: undefined,
        country: 'US',
        currency: 'USD',
        currencySymbol: '$',
        twoFactorEnabled: false,
        phone: '',
        profileImageUrl: '',
        passportUrl: '',
        sessions: [{
          id: 'session-' + Date.now(),
          device: 'Current Device',
          location: 'Washington, DC',
          lastActive: new Date().toISOString()
        }]
      };

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

  const updateUserProfile = (updates: Partial<UserType>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    localStorage.setItem('axiomify_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const updateUser = async (updatedUser: UserType) => {
    localStorage.setItem('axiomify_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Promise.resolve();
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Promise.resolve(!!token);
  };

  const sendEmailVerification = async (email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Promise.resolve();
  };

  const updateCurrency = (currency: string, symbol: string) => {
    if (!user) return;
    
    const updatedUser = { 
      ...user, 
      currency, 
      currencySymbol: symbol 
    };
    localStorage.setItem('axiomify_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const enableTwoFactor = async (code: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (code.length === 6) {
      updateUserProfile({ twoFactorEnabled: true });
      return true;
    }
    return false;
  };

  const disableTwoFactor = async (code: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (code.length === 6) {
      updateUserProfile({ twoFactorEnabled: false });
      return true;
    }
    return false;
  };

  const getSessions = () => {
    return user?.sessions || [];
  };

  const terminateSession = async (sessionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (user?.sessions) {
      const updatedSessions = user.sessions.filter(s => s.id !== sessionId);
      updateUserProfile({ sessions: updatedSessions });
    }
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
      updateUser,
      updatePassword,
      verifyEmail,
      sendEmailVerification,
      updateCurrency,
      enableTwoFactor,
      disableTwoFactor,
      getSessions,
      terminateSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};
