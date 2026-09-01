/**
 * @fileoverview Supabase Database type definitions for TrueBite.
 * These types mirror the PostgreSQL schema defined in supabase/schema.sql.
 * All column names match the database exactly for type-safe queries.
 */

/** JSON type for JSONB columns */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Gender options for user profiles */
export type GenderType = 'male' | 'female' | 'other';

/** Physical activity level — used for TDEE calculation multiplier */
export type ActivityLevelType =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';

/** User health and fitness goals — affects caloric target adjustment */
export type HealthGoalType =
  | 'lose_weight_fast'
  | 'lose_weight_gradual'
  | 'maintain_weight'
  | 'gain_muscle'
  | 'manage_condition';

/** Type of food scan performed by the universal scanner */
export type ScanType = 'meal_photo' | 'nutrition_label' | 'ingredients_list' | 'barcode';

/** Overall safety assessment of a scanned food item */
export type SafetyStatus = 'safe' | 'caution' | 'danger' | 'unknown';

/** Time of day / meal category for logging */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Complete Supabase Database interface.
 * Matches the PostgreSQL schema 1:1 for type-safe CRUD operations.
 */
export interface Database {
  public: {
    Tables: {
      /**
       * User health profiles — body metrics, allergies, conditions, dietary preferences.
       * BMR/TDEE and macro targets are auto-calculated via PostgreSQL trigger.
       */
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          birth_date: string | null;
          gender: GenderType;
          // Body metrics
          height_cm: number | null;
          weight_kg: number | null;
          target_weight_kg: number | null;
          activity_level: ActivityLevelType;
          goal: HealthGoalType;
          // Calculated metrics (auto-set by DB trigger)
          calculated_bmr: number | null;
          calculated_tdee: number | null;
          target_calories: number | null;
          target_protein_g: number | null;
          target_carbs_g: number | null;
          target_fat_g: number | null;
          target_fiber_g: number | null;
          target_sodium_mg: number | null;
          target_sugar_g: number | null;
          // Health arrays
          allergies: string[];
          intolerances: string[];
          medical_conditions: string[];
          dietary_preferences: string[];
          // Status
          is_onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };

      /**
       * Food scan events — each scan captures an image, AI classification,
       * safety evaluation, health warnings, and total estimated nutrition.
       */
      food_scans: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          thumbnail_url: string | null;
          scan_type: ScanType;
          meal_title: string;
          confidence_score: number | null;
          safety_status: SafetyStatus;
          health_warnings: Json;
          // Total nutrition from all items in this scan
          total_calories: number;
          total_protein_g: number;
          total_carbs_g: number;
          total_fat_g: number;
          total_fiber_g: number;
          total_sugar_g: number;
          total_sodium_mg: number;
          // AI metadata
          raw_ai_response: Json | null;
          ai_model_version: string | null;
          processing_time_ms: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['food_scans']['Row']> & {
          user_id: string;
          image_url: string;
        };
        Update: Partial<Database['public']['Tables']['food_scans']['Row']>;
      };

      /**
       * Individual food items detected within a single scan.
       * Each scan can contain multiple items (e.g., rice + chicken + vegetables).
       */
      scan_items: {
        Row: {
          id: string;
          scan_id: string;
          user_id: string;
          item_name: string;
          estimated_weight_g: number;
          portion_description: string | null;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          fiber_g: number | null;
          sugar_g: number | null;
          sodium_mg: number | null;
          detected_allergens: string[];
          item_safety_status: SafetyStatus;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['scan_items']['Row']> & {
          scan_id: string;
          user_id: string;
          item_name: string;
        };
        Update: Partial<Database['public']['Tables']['scan_items']['Row']>;
      };

      /**
       * Meal logs — consumed food entries linked to scans or manually added.
       * Changes to this table auto-trigger daily_nutrition_summaries recalculation.
       */
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          scan_id: string | null;
          meal_type: MealType;
          consumed_at: string;
          log_date: string;
          food_name: string;
          portion_multiplier: number;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          fiber_g: number;
          sugar_g: number;
          sodium_mg: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['meal_logs']['Row']> & {
          user_id: string;
          meal_type: MealType;
          food_name: string;
          calories: number;
        };
        Update: Partial<Database['public']['Tables']['meal_logs']['Row']>;
      };

      /**
       * Pre-aggregated daily nutrition rollup.
       * Auto-synced via PostgreSQL trigger on meal_logs changes.
       * Contains snapshots of the user's targets for that day.
       */
      daily_nutrition_summaries: {
        Row: {
          id: string;
          user_id: string;
          summary_date: string;
          total_calories: number;
          total_protein_g: number;
          total_carbs_g: number;
          total_fat_g: number;
          total_fiber_g: number;
          total_sugar_g: number;
          total_sodium_mg: number;
          total_water_ml: number;
          // Target snapshots for this day
          target_calories: number;
          target_protein_g: number;
          target_carbs_g: number;
          target_fat_g: number;
          meal_count: number;
          scan_count: number;
          is_goal_met: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['daily_nutrition_summaries']['Row']> & {
          user_id: string;
          summary_date: string;
        };
        Update: Partial<Database['public']['Tables']['daily_nutrition_summaries']['Row']>;
      };
    };
  };
}

/** Convenience type aliases for table rows */
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type FoodScan = Database['public']['Tables']['food_scans']['Row'];
export type ScanItem = Database['public']['Tables']['scan_items']['Row'];
export type MealLog = Database['public']['Tables']['meal_logs']['Row'];
export type DailyNutritionSummary = Database['public']['Tables']['daily_nutrition_summaries']['Row'];
