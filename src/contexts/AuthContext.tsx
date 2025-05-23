
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from "@/integrations/supabase/client";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  walletBalance: number;
  kycVerified: boolean;
  emailVerified: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  sendEmailVerification: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('axiomify_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Mock authentication - in real app this would be an API call
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (email === 'demo@axiomify.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          name: 'Demo User',
          email: 'demo@axiomify.com',
          walletBalance: 1200.50,
          kycVerified: true,
          emailVerified: true,
          avatar: 'https://i.pravatar.cc/150?u=demo@axiomify.com'
        };
        
        setUser(mockUser);
        localStorage.setItem('axiomify_user', JSON.stringify(mockUser));
        toast.success('Welcome back!');
      } else {
        toast.error('Invalid credentials. Try demo@axiomify.com / password');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailVerification = async (email: string) => {
    try {
      // In a real app this would call your Supabase Edge Function
      await fetch('https://vyensygnzdllcwyzuxkq.supabase.co/functions/v1/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZW5zeWduemRsbGN3eXp1eGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzI1NTksImV4cCI6MjA2MzQwODU1OX0.pcfG8-ggEjuGhvB1VtxUORKPB4cTWLsFM_ZFCxvWE_g`
        },
        body: JSON.stringify({ email })
      });
      
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      // In a real app this would call your Supabase Edge Function
      const response = await fetch('https://vyensygnzdllcwyzuxkq.supabase.co/functions/v1/confirm-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZW5zeWduemRsbGN3eXp1eGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzI1NTksImV4cCI6MjA2MzQwODU1OX0.pcfG8-ggEjuGhvB1VtxUORKPB4cTWLsFM_ZFCxvWE_g`
        },
        body: JSON.stringify({ token })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Email verified successfully!');
        
        // Update user if they are logged in
        if (user) {
          const updatedUser = {...user, emailVerified: true};
          setUser(updatedUser);
          localStorage.setItem('axiomify_user', JSON.stringify(updatedUser));
        }
        
        return true;
      } else {
        toast.error('Failed to verify email. Token may be invalid or expired.');
        return false;
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Failed to verify email. Please try again.');
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock signup
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        walletBalance: 0,
        kycVerified: false,
        emailVerified: false,
      };
      
      setUser(mockUser);
      localStorage.setItem('axiomify_user', JSON.stringify(mockUser));
      
      // Send verification email
      await sendEmailVerification(email);
      
      toast.success('Account created successfully! Please verify your email.');
    } catch (error) {
      toast.error('Signup failed. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // In a real app this would call your Supabase auth API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock password change - in a real app, this would validate the current password
      // and update to the new one
      if (currentPassword === 'password') {
        toast.success('Password updated successfully');
      } else {
        toast.error('Current password is incorrect');
        throw new Error('Current password is incorrect');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('axiomify_user');
    setUser(null);
    toast.info('You have been logged out.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        sendEmailVerification,
        verifyEmail,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
