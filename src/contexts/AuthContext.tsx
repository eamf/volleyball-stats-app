// src/contexts/AuthContext.tsx - CLEAN AND WORKING
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@/lib/supabase';
import { UserProfile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'director' | 'coach') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const getSession = async () => {
      try {
        console.log('🔄 Initializing auth session...');

        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⚠️ Auth initialization timeout, setting loading to false');
            setLoading(false);
          }
        }, 10000); // 10 second timeout

        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('❌ Session error:', error);
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        }

        console.log('✅ Session loaded:', session?.user?.email || 'No user');
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            await fetchProfile(session.user.id);
          } catch (error) {
            console.error('❌ Profile fetch failed:', error);
            if (mounted) {
              clearTimeout(timeoutId);
              setLoading(false);
            }
          }
        } else {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            await fetchProfile(session.user.id);
          } catch (error) {
            console.error('Profile fetch failed on auth change:', error);
            if (mounted) setLoading(false);
          }
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔄 Fetching profile for user:', userId);

      // Add timeout for profile fetch
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No profile found for user:', userId);
          setProfile(null);
        } else {
          console.error('❌ Profile fetch error:', error);
          setProfile(null);
        }
        setLoading(false);
        return;
      }

      console.log('✅ Profile loaded:', data?.full_name || 'No name');
      setProfile(data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      setProfile(null);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'director' | 'coach') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: role,
            is_active: true
          });

        if (profileError) {
          console.error('Profile creation failed:', profileError);
        }
      } catch (profileError) {
        console.error('Profile creation failed:', profileError);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (error) throw error;
    await fetchProfile(user.id);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
