-- Add video support and enhanced play management to volleyball stats application
-- This migration adds video URL to games, video timestamps to plays, and enhanced play management

-- Add video_url column to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add video_timestamp column to plays table
ALTER TABLE plays ADD COLUMN IF NOT EXISTS video_timestamp DECIMAL(10,3);

-- Add comment column to plays table for explaining the play
ALTER TABLE plays ADD COLUMN IF NOT EXISTS comment TEXT;

-- Add score_increment column to plays table for score tracking
ALTER TABLE plays ADD COLUMN IF NOT EXISTS score_increment INTEGER DEFAULT 0;

-- Add default_score_increment column to play_types table
ALTER TABLE play_types ADD COLUMN IF NOT EXISTS default_score_increment INTEGER DEFAULT 0;

-- Create game_lineups table for storing player lineups per set
CREATE TABLE IF NOT EXISTS game_lineups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  set_id UUID REFERENCES game_sets(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) NOT NULL,
  player_id UUID REFERENCES players(id) NOT NULL,
  position_number INTEGER NOT NULL CHECK (position_number >= 0 AND position_number <= 6), -- 0 = bench, 1-6 = court positions
  is_active BOOLEAN DEFAULT true,
  substituted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON COLUMN games.video_url IS 'YouTube video URL for game analysis';
COMMENT ON COLUMN plays.video_timestamp IS 'Video timestamp in seconds when play occurred';
COMMENT ON COLUMN plays.comment IS 'Comment explaining the play';
COMMENT ON COLUMN plays.score_increment IS 'Score increment: 1 = point for team, -1 = point for opponent, 0 = no score change';
COMMENT ON COLUMN play_types.default_score_increment IS 'Default score increment for this play type';
COMMENT ON COLUMN game_lineups.position_number IS 'Player position: 0 = bench, 1-6 = court positions P1-P6';
COMMENT ON COLUMN game_lineups.is_active IS 'Whether this lineup entry is currently active';
COMMENT ON COLUMN game_lineups.substituted_at IS 'When player was substituted out (if applicable)';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plays_video_timestamp ON plays(video_timestamp) WHERE video_timestamp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_plays_score_increment ON plays(score_increment);
CREATE INDEX IF NOT EXISTS idx_game_lineups_game_set ON game_lineups(game_id, set_id);
CREATE INDEX IF NOT EXISTS idx_game_lineups_team_position ON game_lineups(team_id, position_number) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_game_lineups_active ON game_lineups(is_active) WHERE is_active = true;

-- Update RLS policies to include new columns (if needed)
-- The existing policies should automatically cover the new columns

-- Example data updates for play types (optional - for testing)
-- UPDATE play_types SET default_score_increment = 1 WHERE name IN ('Ace', 'Kill', 'Block');
-- UPDATE play_types SET default_score_increment = -1 WHERE name IN ('Service Error', 'Attack Error', 'Reception Error');
-- UPDATE play_types SET default_score_increment = 0 WHERE name IN ('Dig', 'Set', 'Pass');
