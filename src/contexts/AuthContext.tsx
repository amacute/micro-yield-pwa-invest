import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, type Profile } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: { walletBalance?: number; videosWatched?: number }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUserProfile = async (updates: { walletBalance?: number; videosWatched?: number }) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        wallet_balance: updates.walletBalance,
        videos_watched_count: updates.videosWatched,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, updateUserProfile }}>
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
