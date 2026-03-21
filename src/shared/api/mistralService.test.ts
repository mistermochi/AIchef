/** @jest-environment jsdom */

import { mistralService } from './mistralService';

// Mock the Mistral client
const mockChatComplete = jest.fn();
const mockListModels = jest.fn();
const mockConversationsStart = jest.fn();
jest.mock("@mistralai/mistralai", () => {
  return {
    Mistral: jest.fn().mockImplementation(() => ({
      chat: {
        complete: mockChatComplete,
      },
      models: {
        list: mockListModels,
      },
      beta: {
        conversations: {
          start: mockConversationsStart,
        }
      }
    }))
  };
});

describe('MistralService', () => {
  beforeEach(() => {
    localStorage.setItem('mistral_api_key', 'test-mistral-key');
    jest.clearAllMocks();
  });

  describe('validateAIConnection', () => {
    it('should return healthy when connection is valid', async () => {
      mockListModels.mockResolvedValue({ data: [] });

      const result = await mistralService.validateAIConnection();
      expect(result.status).toBe('healthy');
      expect(result.message).toBe('Connected');
    });

    it('should return auth_error when API key is invalid', async () => {
      mockListModels.mockRejectedValue(new Error('401 Unauthorized'));

      const result = await mistralService.validateAIConnection();
      expect(result.status).toBe('auth_error');
    });
  });

  describe('processRecipe', () => {
    it('should parse and return structured recipe and use beta conversations API', async () => {
      const mockRecipe = { title: 'Test Recipe', instructions: ['Step 1'] };
      mockConversationsStart.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockRecipe) } }]
      });

      const result = await mistralService.processRecipe('input', 'prefs');
      expect(result.title).toBe('Test Recipe');
      expect(mockConversationsStart).toHaveBeenCalledWith(expect.objectContaining({
        model: 'mistral-large-2512',
        inputs: [{ role: 'user', content: expect.stringContaining('input') }],
        responseFormat: expect.objectContaining({
          type: 'json_schema',
          jsonSchema: expect.objectContaining({
            name: 'recipe'
          })
        })
      }));
    });
  });
});
