
import { mistralService } from './mistralService';
import { AIService } from './aiService';

/**
 * @function getAIService
 * @description Factory function to retrieve the appropriate AI service based on the selected provider.
 * @param {'gemini' | 'mistral' | 'openrouter'} provider - The AI provider to use. Defaults to 'mistral'.
 * @returns {AIService} The corresponding AI service instance.
 */
export const getAIService = (provider: 'gemini' | 'mistral' | 'openrouter' = 'mistral'): AIService => {
  // Gemini is deprecated and removed
  if (provider === 'mistral') {
    return mistralService;
  }
  // Fallback to mistral for unknown or deprecated providers
  return mistralService;
};
