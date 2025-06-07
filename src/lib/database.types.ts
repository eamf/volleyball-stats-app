// src/lib/database.types.ts
// Auto-generated types for Supabase

export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string;
          name: string;
          founded_year: number | null;
          city: string | null;
          country: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          founded_year?: number | null;
          city?: string | null;
          country?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          founded_year?: number | null;
          city?: string | null;
          country?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'director' | 'coach';
          club_id: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'director' | 'coach';
          club_id?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'director' | 'coach';
          club_id?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      championships: {
        Row: {
          id: string;
          name: string;
          season: string;
          start_date: string;
          end_date: string | null;
          description: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          season: string;
          start_date: string;
          end_date?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          season?: string;
          start_date?: string;
          end_date?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          club_id: string;
          championship_id: string | null;
          division: string | null;
          coach_id: string | null;
          assistant_coach_id: string | null;
          team_color: string;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          club_id: string;
          championship_id?: string | null;
          division?: string | null;
          coach_id?: string | null;
          assistant_coach_id?: string | null;
          team_color?: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          club_id?: string;
          championship_id?: string | null;
          division?: string | null;
          coach_id?: string | null;
          assistant_coach_id?: string | null;
          team_color?: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          team_id: string;
          jersey_number: number;
          full_name: string;
          primary_position: 'setter' | 'outside_hitter' | 'middle_blocker' | 'opposite' | 'libero' | 'defensive_specialist';
          secondary_position: 'setter' | 'outside_hitter' | 'middle_blocker' | 'opposite' | 'libero' | 'defensive_specialist' | null;
          height_cm: number | null;
          date_of_birth: string | null;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          jersey_number: number;
          full_name: string;
          primary_position: 'setter' | 'outside_hitter' | 'middle_blocker' | 'opposite' | 'libero' | 'defensive_specialist';
          secondary_position?: 'setter' | 'outside_hitter' | 'middle_blocker' | 'opposite' | 'libero' | 'defensive_specialist' | null;
          height_cm?: number | null;
          date_of_birth?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          jersey_number?: number;
          full_name?: string;
          primary_position?: 'setter' | 'outside_hitter' | 'middle_blocker' | 'opposite' | 'libero' | 'defensive_specialist';
          secondary_position?: 'setter' | 'outside_hitter' | 'middle_blocker' | 'opposite' | 'libero' | 'defensive_specialist' | null;
          height_cm?: number | null;
          date_of_birth?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          championship_id: string;
          home_team_id: string;
          away_team_id: string;
          scheduled_at: string;
          venue: string | null;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          home_score: number;
          away_score: number;
          completed_at: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          championship_id: string;
          home_team_id: string;
          away_team_id: string;
          scheduled_at: string;
          venue?: string | null;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          home_score?: number;
          away_score?: number;
          completed_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          championship_id?: string;
          home_team_id?: string;
          away_team_id?: string;
          scheduled_at?: string;
          venue?: string | null;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          home_score?: number;
          away_score?: number;
          completed_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_sets: {
        Row: {
          id: string;
          game_id: string;
          set_number: number;
          home_score: number;
          away_score: number;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          set_number: number;
          home_score?: number;
          away_score?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          set_number?: number;
          home_score?: number;
          away_score?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      play_types: {
        Row: {
          id: string;
          name: string;
          default_value: number;
          category: string;
          is_positive: boolean;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          default_value?: number;
          category: string;
          is_positive?: boolean;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          default_value?: number;
          category?: string;
          is_positive?: boolean;
          description?: string | null;
          created_at?: string;
        };
      };
      plays: {
        Row: {
          id: string;
          game_id: string;
          set_id: string;
          player_id: string | null;
          play_type_id: string;
          team_id: string;
          field_x: number | null;
          field_y: number | null;
          value: number;
          timestamp_in_set: string;
          rotation_position: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          set_id: string;
          player_id?: string | null;
          play_type_id: string;
          team_id: string;
          field_x?: number | null;
          field_y?: number | null;
          value?: number;
          timestamp_in_set?: string;
          rotation_position?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          set_id?: string;
          player_id?: string | null;
          play_type_id?: string;
          team_id?: string;
          field_x?: number | null;
          field_y?: number | null;
          value?: number;
          timestamp_in_set?: string;
          rotation_position?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      game_lineups: {
        Row: {
          id: string;
          game_id: string;
          set_id: string;
          team_id: string;
          player_id: string;
          position_number: number;
          is_active: boolean;
          substituted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          set_id: string;
          team_id: string;
          player_id: string;
          position_number: number;
          is_active?: boolean;
          substituted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          set_id?: string;
          team_id?: string;
          player_id?: string;
          position_number?: number;
          is_active?: boolean;
          substituted_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'director' | 'coach';
      player_position: 'setter' | 'outside_hitter' | 'middle_blocker' | 'opposite' | 'libero' | 'defensive_specialist';
      game_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    };
  };
}