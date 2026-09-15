import type { AIProvider, FoodAnalysisResult, UserHealthProfile, ConsumedToday } from '@/types/ai.types';
import { buildSystemPrompt, buildTextSystemPrompt, buildUserPrompt, buildIngredientsSystemPrompt, FOOD_ANALYSIS_SCHEMA, INGREDIENTS_GENERATION_SCHEMA } from './prompt-builder';

/**
 * Implementation of AIProvider using the Gemini REST API.
 */
export class GeminiProvider implements AIProvider {
  name = 'gemini';
  /**
   * Analyzes food from an image base64 string using Gemini.
   * @param imageBase64 - The base64 encoded image string (with or without data URI prefix).
   * @param userProfile - The user's health profile.
   * @param consumedToday - Optional data about what the user has already consumed today.
   * @returns A promise resolving to the FoodAnalysisResult.
   */
  async analyzeFood(imageBase64: string, userProfile: UserHealthProfile, consumedToday?: ConsumedToday): Promise<FoodAnalysisResult> {
    const startTime = Date.now();
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    
    // Strip data URI prefix if present
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    const systemPrompt = buildSystemPrompt(userProfile, consumedToday);
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

  /**
   * Analyzes food from a text description using Gemini.
   */
  async analyzeText(description: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    const startTime = Date.now();
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    
    const systemPrompt = buildTextSystemPrompt(userProfile);
    const userPrompt = `Analyze this food description: "${description}". Estimate nutrition and check for safety concerns based on my health profile.`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt }
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
      console.error('Error in Gemini text analysis:', error);
      throw new Error(`Failed to analyze text with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates personalized ingredient list based on user profile.
   */
  async generateIngredients(userProfile: UserHealthProfile): Promise<any[]> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key is not configured.');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const systemPrompt = buildIngredientsSystemPrompt(userProfile);

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: "Generate my personalized ingredient dictionary based on my health profile." }]
        }
      ],
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: INGREDIENTS_GENERATION_SCHEMA
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error('Invalid response structure from Gemini API.');

      const parsed = JSON.parse(content);
      return parsed.ingredients || [];
    } catch (error) {
      console.error('Error generating ingredients:', error);
      throw error;
    }
  }

  /**
   * Enriches a list of ingredients with category, description, and commonly found in.
   */
  async enrichIngredients(ingredientNames: string[], userProfile: UserHealthProfile): Promise<any[]> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key is not configured.');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    
    const prompt = `You are a nutrition expert. I have a list of food items or ingredients: ${JSON.stringify(ingredientNames)}.
For each item, provide detailed information. 
The user's health profile:
Allergies: ${userProfile.allergies?.join(', ') || 'None'}
Medical Conditions: ${userProfile.medicalConditions?.join(', ') || 'None'}

Return a JSON array of objects with the exact following schema for each item:
{
  "ingredientName": "exact name from my list",
  "category": "e.g., Protein, Additive, Vegetable",
  "reason": "Why this is safe/flagged/allergen specifically for this user's profile (max 2 sentences)",
  "description": "Comprehensive educational description explaining what it is and its health effects (2-3 sentences).",
  "commonlyFoundIn": [
    {"icon": "ONE SINGLE EMOJI", "label": "food name"}
  ]
}

Return ONLY the raw JSON array. Do not use markdown blocks.`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    try {
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    } catch (e) {
      return [];
    }
  }
}

export const geminiProvider = new GeminiProvider();
