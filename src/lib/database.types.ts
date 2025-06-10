// src/lib/database.types.ts
// Auto-generated types for Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string
          name: string
          founded_year: number | null
          city: string | null
          country: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          founded_year?: number | null
          city?: string | null
          country: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          founded_year?: number | null
          city?: string | null
          country?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      championships: {
        Row: {
          id: string
          name: string
          season: string
          start_date: string
          end_date: string | null
          description: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          season: string
          start_date: string
          end_date?: string | null
          description?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          season?: string
          start_date?: string
          end_date?: string | null
          description?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          club_id: string
          championship_id: string | null
          division: string | null
          coach_id: string | null
          assistant_coach_id: string | null
          team_color: string
          logo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          club_id: string
          championship_id?: string | null
          division?: string | null
          coach_id?: string | null
          assistant_coach_id?: string | null
          team_color?: string
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          club_id?: string
          championship_id?: string | null
          division?: string | null
          coach_id?: string | null
          assistant_coach_id?: string | null
          team_color?: string
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          team_id: string
          jersey_number: number
          full_name: string
          primary_position: string
          secondary_position: string | null
          height_cm: number | null
          date_of_birth: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          jersey_number: number
          full_name: string
          primary_position: string
          secondary_position?: string | null
          height_cm?: number | null
          date_of_birth?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          jersey_number?: number
          full_name?: string
          primary_position?: string
          secondary_position?: string | null
          height_cm?: number | null
          date_of_birth?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    // Add other tables as needed
  }
}
