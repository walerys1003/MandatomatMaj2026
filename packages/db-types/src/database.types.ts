/**
 * Placeholder Supabase types.
 *
 * Replace this file by running:
 *   supabase gen types typescript --local > packages/db-types/src/database.types.ts
 *
 * Until the local Supabase stack is running, we expose the canonical Supabase
 * generic shape so consumer code can compile.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
