import type { AIProvider, FoodAnalysisResult, UserHealthProfile, ConsumedToday } from '@/types/ai.types';

/**
 * Orchestrator provider that attempts a primary provider first, 
 * retries once on failure, and then falls back to a secondary provider.
 */
export class FallbackProvider implements AIProvider {
  name = 'fallback';

  constructor(private primary: AIProvider, private fallback: AIProvider) {
    this.name = `${primary.name}-with-fallback`;
  }

  private isRetryableError(error: any): boolean {
    const msg = (error?.message || '').toLowerCase();
    
    // Non-retryable errors
    if (msg.includes('api key is not configured')) return false;
    if (msg === 'not_food') return false;
    
    // Most network, parsing, or API rate limit/server errors are retryable
    return true; 
  }

  private async executeWithFallback<T>(
    operationName: string,
    operation: (provider: AIProvider) => Promise<T>
  ): Promise<T> {
    try {
      // 1. Try primary provider
      return await operation(this.primary);
    } catch (error: any) {
      console.warn(`[FallbackProvider] Primary (${this.primary.name}) failed on ${operationName}:`, error.message);
      
      if (!this.isRetryableError(error)) {
        throw error; // Jika error fatal (misal API key tidak ada), langsung throw
      }

      // 2. Langsung fallback tanpa retry di primary untuk menghemat resource dan waktu
      console.log(`[FallbackProvider] Switching to fallback provider (${this.fallback.name})...`);
      try {
        return await operation(this.fallback);
      } catch (fallbackError: any) {
        console.error(`[FallbackProvider] Fallback also failed:`, fallbackError.message);
        throw fallbackError; // Bubble up the fallback error
      }
    }
  }

  async analyzeFood(imageBase64: string, userProfile: UserHealthProfile, consumedToday?: ConsumedToday): Promise<FoodAnalysisResult> {
    return this.executeWithFallback('analyzeFood', p => p.analyzeFood(imageBase64, userProfile, consumedToday));
  }

  async analyzeText(description: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    return this.executeWithFallback('analyzeText', p => p.analyzeText(description, userProfile));
  }

  async generateIngredients(userProfile: UserHealthProfile): Promise<any[]> {
    return this.executeWithFallback('generateIngredients', async p => {
      if (typeof p.generateIngredients === 'function') {
        return p.generateIngredients(userProfile);
      }
      return [];
    });
  }

  async enrichIngredients(ingredientNames: string[], userProfile: UserHealthProfile): Promise<any[]> {
    return this.executeWithFallback('enrichIngredients', async p => {
      if (typeof p.enrichIngredients === 'function') {
        return p.enrichIngredients(ingredientNames, userProfile);
      }
      return [];
    });
  }
}
