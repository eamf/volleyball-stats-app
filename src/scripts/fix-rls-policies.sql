-- Fix RLS policies to work with or without user profiles
-- This script ensures that authenticated users can perform operations even without a profile

-- First, let's create the user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create user_profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Fix plays table policies
DROP POLICY IF EXISTS "Authenticated users can view plays" ON plays;
DROP POLICY IF EXISTS "Authenticated users can insert plays" ON plays;
DROP POLICY IF EXISTS "Authenticated users can update plays" ON plays;
DROP POLICY IF EXISTS "Authenticated users can delete plays" ON plays;

-- Create permissive policies for plays (allow all authenticated users)
CREATE POLICY "Authenticated users can view plays" ON plays
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert plays" ON plays
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update plays" ON plays
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete plays" ON plays
  FOR DELETE TO authenticated USING (true);

-- Fix games table policies
DROP POLICY IF EXISTS "Authenticated users can view games" ON games;
DROP POLICY IF EXISTS "Authenticated users can insert games" ON games;
DROP POLICY IF EXISTS "Authenticated users can update games" ON games;
DROP POLICY IF EXISTS "Authenticated users can delete games" ON games;

-- Create permissive policies for games
CREATE POLICY "Authenticated users can view games" ON games
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert games" ON games
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update games" ON games
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete games" ON games
  FOR DELETE TO authenticated USING (true);

-- Fix game_sets table policies
DROP POLICY IF EXISTS "Authenticated users can view game_sets" ON game_sets;
DROP POLICY IF EXISTS "Authenticated users can insert game_sets" ON game_sets;
DROP POLICY IF EXISTS "Authenticated users can update game_sets" ON game_sets;
DROP POLICY IF EXISTS "Authenticated users can delete game_sets" ON game_sets;

-- Create permissive policies for game_sets
CREATE POLICY "Authenticated users can view game_sets" ON game_sets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert game_sets" ON game_sets
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update game_sets" ON game_sets
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete game_sets" ON game_sets
  FOR DELETE TO authenticated USING (true);

-- Fix teams table policies
DROP POLICY IF EXISTS "Authenticated users can view teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can insert teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can update teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can delete teams" ON teams;

-- Create permissive policies for teams
CREATE POLICY "Authenticated users can view teams" ON teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert teams" ON teams
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update teams" ON teams
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete teams" ON teams
  FOR DELETE TO authenticated USING (true);

-- Fix players table policies
DROP POLICY IF EXISTS "Authenticated users can view players" ON players;
DROP POLICY IF EXISTS "Authenticated users can insert players" ON players;
DROP POLICY IF EXISTS "Authenticated users can update players" ON players;
DROP POLICY IF EXISTS "Authenticated users can delete players" ON players;

-- Create permissive policies for players
CREATE POLICY "Authenticated users can view players" ON players
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert players" ON players
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update players" ON players
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete players" ON players
  FOR DELETE TO authenticated USING (true);

-- Fix championships table policies
DROP POLICY IF EXISTS "Authenticated users can view championships" ON championships;
DROP POLICY IF EXISTS "Authenticated users can insert championships" ON championships;
DROP POLICY IF EXISTS "Authenticated users can update championships" ON championships;
DROP POLICY IF EXISTS "Authenticated users can delete championships" ON championships;

-- Create permissive policies for championships
CREATE POLICY "Authenticated users can view championships" ON championships
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert championships" ON championships
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update championships" ON championships
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete championships" ON championships
  FOR DELETE TO authenticated USING (true);

-- Fix clubs table policies
DROP POLICY IF EXISTS "Authenticated users can view clubs" ON clubs;
DROP POLICY IF EXISTS "Authenticated users can insert clubs" ON clubs;
DROP POLICY IF EXISTS "Authenticated users can update clubs" ON clubs;
DROP POLICY IF EXISTS "Authenticated users can delete clubs" ON clubs;

-- Create permissive policies for clubs
CREATE POLICY "Authenticated users can view clubs" ON clubs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert clubs" ON clubs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update clubs" ON clubs
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete clubs" ON clubs
  FOR DELETE TO authenticated USING (true);

-- Create a function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
