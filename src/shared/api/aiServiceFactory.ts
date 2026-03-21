
import { geminiService } from './geminiService';
import { mistralService } from './mistralService';
import { AIService } from './aiService';

/**
 * @function getAIService
 * @description Factory function to retrieve the appropriate AI service based on the selected provider.
 * @param {'gemini' | 'mistral'} provider - The AI provider to use. Defaults to 'mistral'.
 * @returns {AIService} The corresponding AI service instance.
 */
export const getAIService = (provider: 'gemini' | 'mistral' = 'mistral'): AIService => {
  if (provider === 'gemini') {
    return geminiService;
  }
  return mistralService;
};
