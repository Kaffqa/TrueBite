import type { UserHealthProfile } from '@/types/ai.types';

/**
 * Builds the system prompt for the AI model based on the user's health profile.
 * @param profile - The user's health profile including allergies and conditions.
 * @returns A formatted system prompt string.
 */
export function buildSystemPrompt(profile: UserHealthProfile): string {
  const allergies = profile.allergies?.length ? profile.allergies.join(', ') : 'None specified';
  const intolerances = profile.intolerances?.length ? profile.intolerances.join(', ') : 'None specified';
  const conditions = profile.medicalConditions?.length ? profile.medicalConditions.join(', ') : 'None specified';
  const diet = profile.dietaryPreferences?.length ? profile.dietaryPreferences.join(', ') : 'None specified';

  return `You are an expert nutritionist, food scientist, and dietary safety analyst. Your task is to analyze the provided food image and return a strict JSON object.

The image may be a meal photo, a nutrition label, or an ingredients list.

User's Health Profile:
- Allergies: ${allergies}
- Intolerances: ${intolerances}
- Medical Conditions: ${conditions}
- Dietary Preferences: ${diet}

Instructions:
1. Auto-detect if the image is a meal photo, nutrition label, or ingredients list.
2. For meals: estimate portion sizes, identify each food item, estimate nutrition per item.
3. For labels: OCR the text, extract nutritional facts and ingredients.
4. Cross-reference all identified ingredients against the user's health profile.
5. Flag any warnings with severity levels ('low', 'medium', 'high', 'critical').
6. Provide plain-language explanations for scientific ingredient names.
7. You MUST return ONLY valid JSON matching the exact schema provided. Do not include markdown formatting or extra text.

Safety Classification Rules:
- Critical: Contains known allergens for the user.
- High: Strongly contradicts medical conditions or intolerances.
- Medium: Potential trace amounts or moderate contradiction to diet/conditions.
- Low: General dietary recommendations or minor notes.
- Safe: No known issues for the user.
`;
}

export function buildTextSystemPrompt(profile: UserHealthProfile): string {
  const allergies = profile.allergies?.length ? profile.allergies.join(', ') : 'None specified';
  const intolerances = profile.intolerances?.length ? profile.intolerances.join(', ') : 'None specified';
  const conditions = profile.medicalConditions?.length ? profile.medicalConditions.join(', ') : 'None specified';
  const diet = profile.dietaryPreferences?.length ? profile.dietaryPreferences.join(', ') : 'None specified';

  return `You are an expert nutritionist, food scientist, and dietary safety analyst. Your task is to analyze the user's food description and return a strict JSON object.

User's Health Profile:
- Allergies: ${allergies}
- Intolerances: ${intolerances}
- Medical Conditions: ${conditions}
- Dietary Preferences: ${diet}

Instructions:
1. Parse the user's description of their meal.
2. Estimate portion sizes, identify each food item, estimate nutrition per item.
3. Cross-reference all identified ingredients against the user's health profile.
4. Flag any warnings with severity levels ('low', 'medium', 'high', 'critical').
5. You MUST return ONLY valid JSON matching the exact schema provided. Do not include markdown formatting or extra text.

Safety Classification Rules:
- Critical: Contains known allergens for the user.
- High: Strongly contradicts medical conditions or intolerances.
- Medium: Potential trace amounts or moderate contradiction to diet/conditions.
- Low: General dietary recommendations or minor notes.
- Safe: No known issues for the user.
`;
}

/**
 * Returns the default user prompt for food analysis.
 */
export function buildUserPrompt(): string {
  return 'Analyze this food image. Identify all food items, estimate nutrition, and check for safety concerns based on my health profile.';
}

export const FOOD_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    scanType: { type: "string", enum: ["meal_photo", "nutrition_label", "barcode"] },
    mealTitle: { type: "string" },
    confidenceScore: { type: "number" },
    safetyStatus: { type: "string", enum: ["safe", "caution", "danger", "unknown"] },
    healthWarnings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          message: { type: "string" }
        },
        required: ["type", "severity", "message"]
      }
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          estimatedWeightG: { type: "number" },
          portionDescription: { type: "string" },
          calories: { type: "number" },
          proteinG: { type: "number" },
          carbsG: { type: "number" },
          fatG: { type: "number" },
          fiberG: { type: "number" },
          sugarG: { type: "number" },
          sodiumMg: { type: "number" },
          confidenceScore: { type: "number" },
          safetyStatus: { type: "string", enum: ["safe", "caution", "danger", "unknown"] },
          detectedAllergens: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["name", "calories"]
      }
    },
    totalNutrition: {
      type: "object",
      properties: {
        calories: { type: "number" },
        proteinG: { type: "number" },
        carbsG: { type: "number" },
        fatG: { type: "number" },
        fiberG: { type: "number" },
        sugarG: { type: "number" },
        sodiumMg: { type: "number" }
      },
      required: ["calories", "proteinG", "carbsG", "fatG"]
    },
    ingredientExplanations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          explanation: { type: "string" }
        }
      }
    },
    recommendations: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["scanType", "mealTitle", "safetyStatus", "healthWarnings", "items", "totalNutrition"]
};
