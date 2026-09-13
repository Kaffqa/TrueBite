import type { ActivityLevelType, GenderType, HealthGoalType } from '@/types/database.types';

/** Activity level multipliers for TDEE calculation (Mifflin-St Jeor) */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevelType, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

/** Caloric adjustments based on user's goal */
const GOAL_ADJUSTMENTS: Record<HealthGoalType, number> = {
  lose_weight_fast: -750,
  lose_weight_gradual: -400,
  maintain_weight: 0,
  gain_muscle: 350,
  manage_condition: 0,
};

export interface TDEEResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetFiberG: number;
  targetSodiumMg: number;
  targetSugarG: number;
}

/**
 * Calculates BMR using the Mifflin-St Jeor equation:
 * - Male: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
 * - Female/Other: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: GenderType
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculates age in years from a birth date string.
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Complete TDEE calculation with macro breakdown.
 * Macro split: 30% Protein, 40% Carbs, 30% Fat.
 * Special adjustments for hypertension (sodium) and diabetes (sugar).
 */
export function calculateTDEE(params: {
  weightKg: number;
  heightCm: number;
  birthDate: string;
  gender: GenderType;
  activityLevel: ActivityLevelType;
  goal: HealthGoalType;
  medicalConditions?: string[];
}): TDEEResult {
  const age = calculateAge(params.birthDate);
  const bmr = calculateBMR(params.weightKg, params.heightCm, age, params.gender);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[params.activityLevel];
  const targetCalories = tdee + GOAL_ADJUSTMENTS[params.goal];

  // Macro split: 30% Protein (4 cal/g), 40% Carbs (4 cal/g), 30% Fat (9 cal/g)
  const targetProteinG = Math.round((targetCalories * 0.3) / 4);
  const targetCarbsG = Math.round((targetCalories * 0.4) / 4);
  const targetFatG = Math.round((targetCalories * 0.3) / 9);

  // Standard daily recommendations with condition-based adjustments
  const conditions = params.medicalConditions ?? [];
  const lowerConditions = conditions.map(c => c.toLowerCase());
  
  const targetFiberG = 30; // Standard RDA
  const targetSodiumMg = lowerConditions.includes('hypertension') ? 1500 : 2300;
  const targetSugarG = lowerConditions.includes('diabetes type 2') || lowerConditions.includes('diabetes type 1') ? 25 : 50;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    targetProteinG,
    targetCarbsG,
    targetFatG,
    targetFiberG,
    targetSodiumMg,
    targetSugarG,
  };
}
