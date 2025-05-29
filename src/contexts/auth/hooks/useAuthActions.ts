
import { UserType } from '../types';
import { useAuthLogin } from './useAuthLogin';
import { useAuthSignup } from './useAuthSignup';
import { useAuthProfile } from './useAuthProfile';
import { useAuthSecurity } from './useAuthSecurity';
import { useAuthLogout } from './useAuthLogout';

export function useAuthActions(
  user: UserType | null,
  session: any,
  setUser: (user: UserType | null) => void,
  setSession: (session: any) => void,
  setLoading: (loading: boolean) => void
) {
  const { login } = useAuthLogin(setUser, setSession, setLoading);
  const { signup, signInWithGoogle } = useAuthSignup(setLoading);
  const { logout } = useAuthLogout(setUser, setSession);
  
  const {
    updateUserProfile,
    updateUser,
    updatePassword,
    updateCurrency
  } = useAuthProfile(user, session, setUser);

  const {
    verifyEmail,
    sendEmailVerification,
    enableTwoFactor,
    disableTwoFactor,
    getSessions,
    terminateSession
  } = useAuthSecurity(user, updateUserProfile);

  return {
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
    terminateSession,
    signInWithGoogle
  };
}
