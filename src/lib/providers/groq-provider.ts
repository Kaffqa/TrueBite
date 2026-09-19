import type { AIProvider, FoodAnalysisResult, UserHealthProfile, ConsumedToday } from '@/types/ai.types';
import { buildSystemPrompt, buildTextSystemPrompt, buildUserPrompt, buildIngredientsSystemPrompt, FOOD_ANALYSIS_SCHEMA, INGREDIENTS_GENERATION_SCHEMA } from './prompt-builder';

/**
 * Implementation of AIProvider using the Groq REST API.
 */
export class GroqProvider implements AIProvider {
  name = 'groq';
  
  /**
   * Analyzes food from an image base64 string using Groq (Qwen Vision).
   */
  async analyzeFood(imageBase64: string, userProfile: UserHealthProfile, consumedToday?: ConsumedToday): Promise<FoodAnalysisResult> {
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

    const systemPrompt = buildSystemPrompt(userProfile, consumedToday);
    const userPrompt = buildUserPrompt();

    const fullSystemPrompt = `${systemPrompt}\n\nEnsure your response is a valid JSON object matching exactly this JSON schema:\n${JSON.stringify(FOOD_ANALYSIS_SCHEMA, null, 2)}`;

    const requestBody = {
      model: 'qwen/qwen3.8-27b',
      max_tokens: 4096,
      temperature: 0.3,
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

  /**
   * Analyzes text description using Groq (GPT OSS 120B).
   */
  async analyzeText(description: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    const startTime = Date.now();
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) throw new Error('Groq API key is not configured.');

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    
    const systemPrompt = buildTextSystemPrompt(userProfile);
    const userPrompt = `Analyze this food description: "${description}". Estimate nutrition and check for safety concerns based on my health profile.`;
    const fullSystemPrompt = `${systemPrompt}\n\nEnsure your response is a valid JSON object matching exactly this JSON schema:\n${JSON.stringify(FOOD_ANALYSIS_SCHEMA, null, 2)}`;

    const requestBody = {
      model: 'openai/gpt-oss-120b',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: userPrompt }
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
      if (!content) throw new Error('Invalid response structure from Groq API.');

      const result = JSON.parse(content) as FoodAnalysisResult;
      result.processingTimeMs = Date.now() - startTime;
      
      return result;
    } catch (error) {
      console.error('Error in Groq text analysis:', error);
      throw error;
    }
  }

  /**
   * Generate ingredients
   */
  async generateIngredients(userProfile: UserHealthProfile): Promise<any[]> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) throw new Error('Groq API key is not configured.');

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const systemPrompt = buildIngredientsSystemPrompt(userProfile);
    const fullSystemPrompt = `${systemPrompt}\n\nEnsure your response is a valid JSON object matching exactly this JSON schema:\n${JSON.stringify(INGREDIENTS_GENERATION_SCHEMA, null, 2)}`;

    const requestBody = {
      model: 'openai/gpt-oss-120b',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: 'Generate personalized ingredients.' }
      ],
      response_format: { type: 'json_object' }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    return parsed.ingredients || [];
  }

  /**
   * Enrich ingredients
   */
  async enrichIngredients(ingredientNames: string[], userProfile: UserHealthProfile): Promise<any[]> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) throw new Error('Groq API key is not configured.');

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
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

Return ONLY the JSON object like this: { "results": [ ...array items... ] }`;

    const requestBody = {
      model: 'openai/gpt-oss-120b',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return parsed.results || [];
  }
}
