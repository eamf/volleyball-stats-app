// src/contexts/AuthContext.tsx
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
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, club:clubs(*)')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist
          console.log('No profile found for user:', userId);
          setProfile(null);
          return;
        }
        throw error;
      }
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const createUserProfile = async (userId: string, email: string, fullName: string, role: 'director' | 'coach') => {
    try {
      // Method 1: Try using the SQL function
      const { data: functionResult, error: functionError } = await supabase
        .rpc('create_user_profile', {
          user_id: userId,
          user_email: email,
          user_name: fullName,
          user_role: role
        });

      if (!functionError && functionResult) {
        setProfile(functionResult);
        return functionResult;
      }

      // Method 2: Direct insert as fallback
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: email,
          full_name: fullName,
          role: role,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
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
    try {
      console.log('Starting signup process for:', email);
      
      // Sign up the user without metadata to avoid trigger issues
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('User signup successful:', data.user?.id);

      // If user is created, create profile manually
      if (data.user) {
        try {
          // Wait a moment for the auth user to be fully created
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('Creating user profile...');
          await createUserProfile(data.user.id, email, fullName, role);
          console.log('Profile created successfully');
        } catch (profileError: any) {
          console.error('Profile creation failed:', profileError);
          // Don't throw here - the auth user was created successfully
          // The user can create a profile later or we can retry
        }
      }

    } catch (error) {
      console.error('Complete signup error:', error);
      throw error;
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
    
    // Refresh profile
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