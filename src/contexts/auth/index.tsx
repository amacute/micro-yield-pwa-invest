import { createContext, useContext } from 'react';
import { useAuthState } from './hooks/useAuthState';
import { useAuthActions } from './hooks/useAuthActions';
import { AdminSecurityProvider } from './AdminSecurityProvider';
import { UserType, AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    isAuthenticated
  } = useAuthState();

  const authActions = useAuthActions(user, session, setUser, setSession, setLoading);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoading: loading,
        isAuthenticated,
        session,
        ...authActions
      }}
    >
      <AdminSecurityProvider>
        {children}
      </AdminSecurityProvider>
    </AuthContext.Provider>
  );
} 