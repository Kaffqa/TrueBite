import type { AIProvider, FoodAnalysisResult, UserHealthProfile, ConsumedToday } from '@/types/ai.types';
import { GeminiProvider } from './providers/gemini-provider';
import { GroqProvider } from './providers/groq-provider';

/**
 * Creates an AI provider instance based on environment configuration.
 * Defaults to Gemini if no provider is specified.
 */
export function createAIProvider(): AIProvider {
  const providerName = import.meta.env.VITE_AI_PROVIDER || 'gemini';
  
  switch (providerName) {
    case 'groq':
      return new GroqProvider();
    case 'gemini':
    default:
      return new GeminiProvider();
  }
}

/** Singleton AI provider instance */
let _provider: AIProvider | null = null;

/**
 * Returns the configured AI provider singleton.
 */
export function getAIProvider(): AIProvider {
  if (!_provider) {
    _provider = createAIProvider();
  }
  return _provider;
}

/**
 * Convenience function: analyze food using the configured AI provider.
 * 
 * @param imageBase64 - The base64 string of the food image.
 * @param userProfile - The user's health profile.
 * @param consumedToday - Optional data about what the user has already consumed today.
 * @returns A promise that resolves to the food analysis result.
 */
export async function analyzeFood(
  imageBase64: string,
  userProfile: UserHealthProfile,
  consumedToday?: ConsumedToday
): Promise<FoodAnalysisResult> {
  const provider = getAIProvider();
  return provider.analyzeFood(imageBase64, userProfile, consumedToday);
}

/**
 * Convenience function: analyze text description using the configured AI provider.
 */
export async function analyzeText(
  description: string,
  userProfile: UserHealthProfile
): Promise<FoodAnalysisResult> {
  const provider = getAIProvider();
  return provider.analyzeText(description, userProfile);
}

/**
 * Convenience function: generate personalized ingredients using the configured AI provider.
 */
export async function generatePersonalIngredients(
  userProfile: UserHealthProfile
): Promise<any[]> {
  const provider = getAIProvider() as any;
  if (typeof provider.generateIngredients !== 'function') {
    throw new Error(`Provider ${provider.name} does not support ingredient generation.`);
  }
  return provider.generateIngredients(userProfile);
}

/**
 * Convenience function: enrich ingredients using the configured AI provider.
 */
export async function enrichIngredients(
  ingredientNames: string[],
  userProfile: UserHealthProfile
): Promise<any[]> {
  const provider = getAIProvider() as any;
  if (typeof provider.enrichIngredients !== 'function') {
    throw new Error(`Provider ${provider.name} does not support ingredient enrichment.`);
  }
  return provider.enrichIngredients(ingredientNames, userProfile);
}
