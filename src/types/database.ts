// src/types/database.ts

export type UserRole = 'director' | 'coach';
export type PlayerPosition = 'setter' | 'outside_hitter' | 'middle_blocker' | 'opposite' | 'libero' | 'defensive_specialist';
export type GameStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Club {
  id: string;
  name: string;
  founded_year?: number;
  city?: string;
  country: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  club_id?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  club?: Club;
}

export interface Championship {
  id: string;
  name: string;
  season: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  creator?: UserProfile;
}

export interface Team {
  id: string;
  name: string;
  club_id: string;
  championship_id?: string;
  division?: string;
  coach_id?: string;
  assistant_coach_id?: string;
  team_color: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  club?: Club;
  coach?: UserProfile;
  assistant_coach?: UserProfile;
  championship?: Championship;
  players?: Player[];
}

export interface Player {
  id: string;
  team_id: string;
  jersey_number: number;
  full_name: string;
  primary_position: PlayerPosition;
  secondary_position?: PlayerPosition;
  height_cm?: number;
  date_of_birth?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  team?: Team;
}

export interface Game {
  id: string;
  championship_id: string;
  home_team_id: string;
  away_team_id: string;
  scheduled_at: string;
  venue?: string;
  status: GameStatus;
  home_score: number;
  away_score: number;
  completed_at?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  championship?: Championship;
  home_team?: Team;
  away_team?: Team;
  creator?: UserProfile;
  sets?: GameSet[];
}

export interface GameSet {
  id: string;
  game_id: string;
  set_number: number;
  home_score: number;
  away_score: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  game?: Game;
  plays?: Play[];
}

export interface PlayType {
  id: string;
  name: string;
  default_value: number;
  category: string;
  is_positive: boolean;
  description?: string;
  created_at: string;
}

export interface Play {
  id: string;
  game_id: string;
  set_id: string;
  player_id?: string;
  play_type_id: string;
  team_id: string;
  field_x?: number;
  field_y?: number;
  value: number;
  timestamp_in_set: string;
  rotation_position?: number;
  notes?: string;
  created_at: string;
  game?: Game;
  set?: GameSet;
  player?: Player;
  play_type?: PlayType;
  team?: Team;
}

export interface GameLineup {
  id: string;
  game_id: string;
  set_id: string;
  team_id: string;
  player_id: string;
  position_number: number; // P1-P6, or 0 for bench
  is_active: boolean;
  substituted_at?: string;
  created_at: string;
  game?: Game;
  set?: GameSet;
  team?: Team;
  player?: Player;
}

// UI-specific types
export interface FieldPosition {
  x: number;
  y: number;
}

export interface PlayerOnField {
  player: Player;
  position: number; // P1-P6
  x: number;
  y: number;
}

export interface GameStats {
  player_id: string;
  player_name: string;
  jersey_number: number;
  play_type: string;
  count: number;
  total_value: number;
  avg_value: number;
}

export interface SetStats {
  set_number: number;
  plays_count: number;
  points_scored: number;
  duration_minutes?: number;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
  play_type: string;
  player_name?: string;
}

// Form types
export interface CreateClubForm {
  name: string;
  founded_year?: number;
  city?: string;
  country: string;
}

export interface CreateChampionshipForm {
  name: string;
  season: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface CreateTeamForm {
  name: string;
  club_id: string;
  championship_id?: string;
  division?: string;
  coach_id?: string;
  assistant_coach_id?: string;
  team_color: string;
}

export interface CreatePlayerForm {
  team_id: string;
  jersey_number: number;
  full_name: string;
  primary_position: PlayerPosition;
  secondary_position?: PlayerPosition;
  height_cm?: number;
  date_of_birth?: string;
  notes?: string;
}

export interface CreateGameForm {
  championship_id: string;
  home_team_id: string;
  away_team_id: string;
  scheduled_at: string;
  venue?: string;
}

export interface PlayInput {
  player_id?: string;
  play_type_id: string;
  field_x?: number;
  field_y?: number;
  value: number;
  rotation_position?: number;
  notes?: string;
}

// Volleyball field positions (standard 6-2 formation)
export const VOLLEYBALL_POSITIONS = {
  P1: { x: 85, y: 65, name: 'Right Back' },
  P2: { x: 85, y: 35, name: 'Right Front' },
  P3: { x: 50, y: 35, name: 'Middle Front' },
  P4: { x: 15, y: 35, name: 'Left Front' },
  P5: { x: 15, y: 65, name: 'Left Back' },
  P6: { x: 50, y: 65, name: 'Middle Back' }
} as const;

// Position rotation order (clockwise)
export const ROTATION_ORDER = ['P1', 'P6', 'P5', 'P4', 'P3', 'P2'] as const;

export type PositionKey = keyof typeof VOLLEYBALL_POSITIONS;