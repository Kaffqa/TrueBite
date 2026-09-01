import type { AIProvider, FoodAnalysisResult, UserHealthProfile } from '@/types/ai.types';
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
 * @returns A promise that resolves to the food analysis result.
 */
export async function analyzeFood(
  imageBase64: string,
  userProfile: UserHealthProfile
): Promise<FoodAnalysisResult> {
  const provider = getAIProvider();
  return provider.analyzeFood(imageBase64, userProfile);
}
