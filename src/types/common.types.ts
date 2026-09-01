import { ActivityLevelType, GenderType, HealthGoalType } from './database.types';

/**
 * Onboarding step tracking
 */
export type OnboardingStep = 
  | 'basic_info'
  | 'body_metrics'
  | 'activity_level'
  | 'allergies'
  | 'medical_conditions'
  | 'dietary_preferences'
  | 'review';

/**
 * Data collected during the onboarding flow
 */
export interface OnboardingData {
  // Step 1
  fullName: string;
  birthDate: string;
  gender: GenderType;
  // Step 2
  heightCm: number | null;
  weightKg: number | null;
  targetWeightKg: number | null;
  // Step 3
  activityLevel: ActivityLevelType;
  goal: HealthGoalType;
  // Step 4
  allergies: string[];
  intolerances: string[];
  // Step 5
  medicalConditions: string[];
  // Step 6
  dietaryPreferences: string[];
}

/**
 * Common allergens list
 */
export const COMMON_ALLERGENS = [
  'peanuts', 'tree_nuts', 'milk', 'eggs', 'wheat', 'soy', 'fish', 'shellfish',
  'sesame', 'mustard', 'celery', 'lupin', 'mollusks', 'sulfites'
] as const;

/**
 * Common intolerances list
 */
export const COMMON_INTOLERANCES = [
  'lactose', 'gluten', 'fructose', 'histamine', 'caffeine', 'fodmap', 'salicylates'
] as const;

/**
 * Common medical conditions
 */
export const MEDICAL_CONDITIONS = [
  'diabetes_type_1', 'diabetes_type_2', 'hypertension', 'celiac_disease',
  'gerd', 'gout', 'kidney_disease', 'heart_disease', 'ibs',
  'crohns_disease', 'high_cholesterol', 'anemia'
] as const;

/**
 * Common dietary preferences
 */
export const DIETARY_PREFERENCES = [
  'vegan', 'vegetarian', 'pescatarian', 'halal', 'kosher',
  'keto', 'paleo', 'mediterranean', 'low_sodium', 'low_sugar',
  'low_carb', 'high_protein', 'whole30', 'dash'
] as const;

/**
 * Navigation item structure
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Helper interface for displaying macro nutrition data
 */
export interface MacroDisplay {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}
