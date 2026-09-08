import { SafetyStatus, ScanType } from './database.types';

/**
 * Represents a health warning based on user profile and food analysis
 */
export interface HealthWarning {
  type: 'allergy' | 'intolerance' | 'condition' | 'dietary';
  severity: 'danger' | 'caution' | 'info';
  title: string;
  detail: string;
  matchedIngredient?: string;
}

/**
 * Details of a specific food item detected in a scan
 */
export interface DetectedFoodItem {
  name: string;
  estimatedWeightG: number;
  portionDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  detectedAllergens: string[];
  safetyStatus: SafetyStatus;
}

/**
 * Aggregated nutritional data
 */
export interface NutritionData {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
}

/**
 * Explanation of an ingredient and its potential risks
 */
export interface IngredientExplanation {
  name: string;
  scientificName?: string;
  commonName: string;
  description: string;
  riskLevel: 'none' | 'low' | 'moderate' | 'high';
  relevantConditions: string[];
}

/**
 * Full result object returned from the AI food analysis
 */
export interface FoodAnalysisResult {
  scanType: ScanType;
  mealTitle: string;
  confidenceScore: number;
  safetyStatus: SafetyStatus;
  healthWarnings: HealthWarning[];
  items: DetectedFoodItem[];
  totalNutrition: NutritionData;
  ingredientExplanations: IngredientExplanation[];
  recommendations: string[];
  rawResponse: unknown;
  processingTimeMs: number;
  modelVersion: string;
}

/**
 * Subset of user profile needed for accurate AI analysis
 */
export interface UserHealthProfile {
  allergies: string[];
  intolerances: string[];
  medicalConditions: string[];
  dietaryPreferences: string[];
  targetCalories: number | null;
  targetSodiumMg: number | null;
  targetSugarG: number | null;
}

/**
 * Interface for AI service providers
 */
export interface AIProvider {
  name: string;
  analyzeFood(imageBase64: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult>;
  analyzeText(description: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult>;
}
