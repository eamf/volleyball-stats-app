-- 🏐 Complete Volleyball Stats Database Schema
-- This script creates all necessary tables with proper structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'coach', 'user')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Championships Table
CREATE TABLE IF NOT EXISTS championships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    location TEXT,
    max_teams INTEGER,
    registration_deadline DATE,
    entry_fee DECIMAL(10,2),
    prize_pool DECIMAL(10,2),
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    rules TEXT,
    contact_info TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    club_id UUID REFERENCES clubs(id),
    championship_id UUID REFERENCES championships(id),
    coach_name TEXT,
    coach_email TEXT,
    coach_phone TEXT,
    team_color TEXT DEFAULT '#3B82F6',
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Players Table
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    jersey_number INTEGER NOT NULL,
    team_id UUID REFERENCES teams(id),
    position TEXT,
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    date_of_birth DATE,
    email TEXT,
    phone TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, jersey_number)
);

-- 6. Games Table
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    championship_id UUID REFERENCES championships(id),
    home_team_id UUID REFERENCES teams(id) NOT NULL,
    away_team_id UUID REFERENCES teams(id) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    home_sets_won INTEGER DEFAULT 0,
    away_sets_won INTEGER DEFAULT 0,
    notes TEXT,
    referee_name TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (home_team_id != away_team_id)
);

-- 7. Game Sets Table
CREATE TABLE IF NOT EXISTS game_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    set_number INTEGER NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, set_number)
);

-- 8. Play Types Table
CREATE TABLE IF NOT EXISTS play_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    value INTEGER NOT NULL, -- Points awarded/deducted (-1, 0, 1)
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Plays Table
CREATE TABLE IF NOT EXISTS plays (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    set_id UUID REFERENCES game_sets(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES players(id),
    play_type_id UUID REFERENCES play_types(id) NOT NULL,
    team_id UUID REFERENCES teams(id) NOT NULL,
    field_x INTEGER, -- Court position X (0-100)
    field_y INTEGER, -- Court position Y (0-100)
    value INTEGER NOT NULL, -- Points for this play
    timestamp_in_set TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    set_number INTEGER NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_championships_updated_at BEFORE UPDATE ON championships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_sets_updated_at BEFORE UPDATE ON game_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_play_types_updated_at BEFORE UPDATE ON play_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plays_updated_at BEFORE UPDATE ON plays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default play types
INSERT INTO play_types (name, category, value, description) VALUES
-- Serving
('Ace', 'Serving', 1, 'Service ace - direct point from serve'),
('Service Error', 'Serving', -1, 'Service error - point lost on serve'),
('Good Serve', 'Serving', 0, 'Successful serve in play'),

-- Attacking
('Kill', 'Attacking', 1, 'Successful attack - point scored'),
('Attack Error', 'Attacking', -1, 'Attack error - point lost'),
('Attack Blocked', 'Attacking', 0, 'Attack was blocked'),

-- Blocking
('Block Kill', 'Blocking', 1, 'Successful block - point scored'),
('Block Error', 'Blocking', -1, 'Block error - point lost'),
('Block Touch', 'Blocking', 0, 'Block touch - ball deflected'),

-- Digging
('Dig', 'Defense', 0, 'Successful dig - ball kept in play'),
('Dig Error', 'Defense', -1, 'Dig error - ball not controlled'),

-- Setting
('Assist', 'Setting', 0, 'Successful set leading to kill'),
('Set Error', 'Setting', -1, 'Setting error'),

-- Reception
('Perfect Pass', 'Reception', 0, 'Perfect serve reception'),
('Good Pass', 'Reception', 0, 'Good serve reception'),
('Poor Pass', 'Reception', 0, 'Poor serve reception'),
('Reception Error', 'Reception', -1, 'Reception error')

ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for clubs
CREATE POLICY "Anyone can view active clubs" ON clubs FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create clubs" ON clubs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update clubs they created" ON clubs FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete clubs they created" ON clubs FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for championships
CREATE POLICY "Anyone can view active championships" ON championships FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create championships" ON championships FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update championships they created" ON championships FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete championships they created" ON championships FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for teams
CREATE POLICY "Anyone can view active teams" ON teams FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update teams they created" ON teams FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete teams they created" ON teams FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for players
CREATE POLICY "Anyone can view active players" ON players FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create players" ON players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update players they created" ON players FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete players they created" ON players FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for games
CREATE POLICY "Anyone can view games" ON games FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create games" ON games FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update games they created" ON games FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete games they created" ON games FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for game_sets
CREATE POLICY "Anyone can view game sets" ON game_sets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create game sets" ON game_sets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update game sets" ON game_sets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete game sets" ON game_sets FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for play_types
CREATE POLICY "Anyone can view active play types" ON play_types FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create play types" ON play_types FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update play types" ON play_types FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for plays
CREATE POLICY "Anyone can view plays" ON plays FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create plays" ON plays FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update plays they created" ON plays FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete plays they created" ON plays FOR DELETE USING (auth.uid() = created_by);
