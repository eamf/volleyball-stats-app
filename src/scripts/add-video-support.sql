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

-- Add comments for documentation
COMMENT ON COLUMN games.video_url IS 'YouTube video URL for game analysis';
COMMENT ON COLUMN plays.video_timestamp IS 'Video timestamp in seconds when play occurred';
COMMENT ON COLUMN plays.comment IS 'Comment explaining the play';
COMMENT ON COLUMN plays.score_increment IS 'Score increment: 1 = point for team, -1 = point for opponent, 0 = no score change';
COMMENT ON COLUMN play_types.default_score_increment IS 'Default score increment for this play type';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plays_video_timestamp ON plays(video_timestamp) WHERE video_timestamp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_plays_score_increment ON plays(score_increment);

-- Update RLS policies to include new columns (if needed)
-- The existing policies should automatically cover the new columns

-- Example data updates for play types (optional - for testing)
-- UPDATE play_types SET default_score_increment = 1 WHERE name IN ('Ace', 'Kill', 'Block');
-- UPDATE play_types SET default_score_increment = -1 WHERE name IN ('Service Error', 'Attack Error', 'Reception Error');
-- UPDATE play_types SET default_score_increment = 0 WHERE name IN ('Dig', 'Set', 'Pass');
