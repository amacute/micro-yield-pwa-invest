
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserType } from '../types';
import { transformUser } from '../utils';
import { fetchUserProfile } from '../services';

export function useAuthState() {
  const [user, setUser] = useState<UserType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = user !== null && session !== null;

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to avoid blocking auth state updates
          setTimeout(async () => {
            const userData = await fetchUserProfile(session.user.id);
            const transformedUser = transformUser(session.user, userData);
            setUser(transformedUser);
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id).then(userData => {
          const transformedUser = transformUser(session.user, userData);
          setUser(transformedUser);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    isAuthenticated
  };
}
