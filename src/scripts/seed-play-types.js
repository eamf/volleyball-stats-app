// src/scripts/seed-play-types.js
// Script to seed play types in the database

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const playTypes = [
  // Serving
  { name: 'Ace', default_value: 1, category: 'serve', is_positive: true, description: 'Service ace - direct point from serve' },
  { name: 'Service Error', default_value: -1, category: 'serve', is_positive: false, description: 'Service error - ball out or into net' },
  { name: 'Good Service', default_value: 0, category: 'serve', is_positive: true, description: 'Service in play' },

  // Attack/Spike
  { name: 'Kill', default_value: 1, category: 'attack', is_positive: true, description: 'Successful attack resulting in point' },
  { name: 'Attack Error', default_value: -1, category: 'attack', is_positive: false, description: 'Attack error - ball out or into net' },
  { name: 'Attack Blocked', default_value: 0, category: 'attack', is_positive: false, description: 'Attack blocked by opponent' },
  { name: 'Attack In Play', default_value: 0, category: 'attack', is_positive: true, description: 'Attack kept in play by opponent' },

  // Block
  { name: 'Block Kill', default_value: 1, category: 'block', is_positive: true, description: 'Successful block resulting in point' },
  { name: 'Block Assist', default_value: 0, category: 'block', is_positive: true, description: 'Assisted block' },
  { name: 'Block Error', default_value: -1, category: 'block', is_positive: false, description: 'Block error - touch out or net violation' },

  // Dig/Defense
  { name: 'Dig', default_value: 0, category: 'defense', is_positive: true, description: 'Successful dig' },
  { name: 'Reception', default_value: 0, category: 'defense', is_positive: true, description: 'Successful serve reception' },
  { name: 'Defense Error', default_value: -1, category: 'defense', is_positive: false, description: 'Defensive error' },

  // Set
  { name: 'Assist', default_value: 0, category: 'set', is_positive: true, description: 'Successful assist' },
  { name: 'Set Error', default_value: -1, category: 'set', is_positive: false, description: 'Setting error' },

  // General Errors
  { name: 'Net Violation', default_value: -1, category: 'error', is_positive: false, description: 'Net violation' },
  { name: 'Foot Fault', default_value: -1, category: 'error', is_positive: false, description: 'Foot fault' },
  { name: 'Double Hit', default_value: -1, category: 'error', is_positive: false, description: 'Double hit violation' },
  { name: 'Lift/Carry', default_value: -1, category: 'error', is_positive: false, description: 'Lift or carry violation' },
  { name: 'Four Hits', default_value: -1, category: 'error', is_positive: false, description: 'Four hits violation' },
  { name: 'Rotation Error', default_value: -1, category: 'error', is_positive: false, description: 'Rotation or position error' },

  // Substitution
  { name: 'Substitution', default_value: 0, category: 'substitution', is_positive: true, description: 'Player substitution' },
  { name: 'Timeout', default_value: 0, category: 'timeout', is_positive: true, description: 'Team timeout' }
];

async function seedPlayTypes() {
  try {
    console.log('Checking if play_types table exists...');
    
    // Check if any play types already exist
    const { data: existingPlayTypes, error: checkError } = await supabase
      .from('play_types')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking play types:', checkError);
      return;
    }
    
    if (existingPlayTypes && existingPlayTypes.length > 0) {
      console.log('Play types already exist. Skipping seed.');
      return;
    }
    
    console.log('Seeding play types...');
    
    const { data, error } = await supabase
      .from('play_types')
      .insert(playTypes)
      .select();
    
    if (error) {
      console.error('Error seeding play types:', error);
      return;
    }
    
    console.log(`Successfully seeded ${data.length} play types`);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

seedPlayTypes();
