-- Create play_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS play_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  default_value INTEGER NOT NULL DEFAULT 1,
  category VARCHAR(50) NOT NULL,
  is_positive BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default volleyball play types
INSERT INTO play_types (name, default_value, category, is_positive, description) VALUES
-- Serving
('Ace', 1, 'serve', true, 'Service ace - direct point from serve'),
('Service Error', -1, 'serve', false, 'Service error - ball out or into net'),
('Good Service', 0, 'serve', true, 'Service in play'),

-- Attack/Spike
('Kill', 1, 'attack', true, 'Successful attack resulting in point'),
('Attack Error', -1, 'attack', false, 'Attack error - ball out or into net'),
('Attack Blocked', 0, 'attack', false, 'Attack blocked by opponent'),
('Attack In Play', 0, 'attack', true, 'Attack kept in play by opponent'),

-- Block
('Block Kill', 1, 'block', true, 'Successful block resulting in point'),
('Block Assist', 0, 'block', true, 'Assisted block'),
('Block Error', -1, 'block', false, 'Block error - touch out or net violation'),

-- Dig/Defense
('Dig', 0, 'defense', true, 'Successful dig'),
('Reception', 0, 'defense', true, 'Successful serve reception'),
('Defense Error', -1, 'defense', false, 'Defensive error'),

-- Set
('Assist', 0, 'set', true, 'Successful assist'),
('Set Error', -1, 'set', false, 'Setting error'),

-- General Errors
('Net Violation', -1, 'error', false, 'Net violation'),
('Foot Fault', -1, 'error', false, 'Foot fault'),
('Double Hit', -1, 'error', false, 'Double hit violation'),
('Lift/Carry', -1, 'error', false, 'Lift or carry violation'),
('Four Hits', -1, 'error', false, 'Four hits violation'),
('Rotation Error', -1, 'error', false, 'Rotation or position error'),

-- Substitution
('Substitution', 0, 'substitution', true, 'Player substitution'),
('Timeout', 0, 'timeout', true, 'Team timeout');

-- Enable RLS (Row Level Security)
ALTER TABLE play_types ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read play types
CREATE POLICY "Allow authenticated users to read play types" ON play_types
  FOR SELECT TO authenticated USING (true);

-- Create policy to allow authenticated users to insert play types (for admins)
CREATE POLICY "Allow authenticated users to insert play types" ON play_types
  FOR INSERT TO authenticated WITH CHECK (true);
