import type { AIProvider, FoodAnalysisResult, UserHealthProfile } from '@/types/ai.types';
import { buildSystemPrompt, buildUserPrompt, FOOD_ANALYSIS_SCHEMA } from './prompt-builder';

/**
 * Implementation of AIProvider using the Gemini REST API.
 */
export class GeminiProvider implements AIProvider {
  name = 'gemini';
  /**
   * Analyzes food from an image base64 string using Gemini.
   * @param imageBase64 - The base64 encoded image string (with or without data URI prefix).
   * @param userProfile - The user's health profile.
   * @returns A promise resolving to the FoodAnalysisResult.
   */
  async analyzeFood(imageBase64: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    const startTime = Date.now();
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    // Strip data URI prefix if present
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    const systemPrompt = buildSystemPrompt(userProfile);
    const userPrompt = buildUserPrompt();

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ],
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: FOOD_ANALYSIS_SCHEMA
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Invalid response structure from Gemini API.');
      }

      const result = JSON.parse(content) as FoodAnalysisResult;
      result.processingTimeMs = Date.now() - startTime;
      
      return result;
    } catch (error) {
      console.error('Error in Gemini analysis:', error);
      throw new Error(`Failed to analyze food with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
