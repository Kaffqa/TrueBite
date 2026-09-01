import type { AIProvider, FoodAnalysisResult, UserHealthProfile } from '@/types/ai.types';
import { buildSystemPrompt, buildUserPrompt } from './prompt-builder';

/**
 * Implementation of AIProvider using the Groq REST API.
 */
export class GroqProvider implements AIProvider {
  name = 'groq';
  /**
   * Analyzes food from an image base64 string using Groq.
   * @param imageBase64 - The base64 encoded image string (with or without data URI prefix).
   * @param userProfile - The user's health profile.
   * @returns A promise resolving to the FoodAnalysisResult.
   */
  async analyzeFood(imageBase64: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    const startTime = Date.now();
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('Groq API key is not configured.');
    }

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    
    // Ensure we have a data URI for the image content in OpenAI compat format
    const imageUrl = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;

    const systemPrompt = buildSystemPrompt(userProfile);
    const userPrompt = buildUserPrompt();

    // Note: Provide the schema explicitly in the system prompt for Groq as they support json_object format
    const fullSystemPrompt = `${systemPrompt}\n\nEnsure your response is valid JSON matching the schema requirements.`;

    const requestBody = {
      model: 'llama-3.2-90b-vision-preview', // Groq's supported vision model
      messages: [
        {
          role: 'system',
          content: fullSystemPrompt
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            { 
              type: 'image_url', 
              image_url: { url: imageUrl } 
            }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Invalid response structure from Groq API.');
      }

      const result = JSON.parse(content) as FoodAnalysisResult;
      result.processingTimeMs = Date.now() - startTime;
      
      return result;
    } catch (error) {
      console.error('Error in Groq analysis:', error);
      throw new Error(`Failed to analyze food with Groq: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
