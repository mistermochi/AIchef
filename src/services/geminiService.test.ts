/** @jest-environment jsdom */

// Create a stable mock function reference
const mockCountTokens = jest.fn();

// Mock the GoogleGenAI client
jest.mock("@google/genai", () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        countTokens: mockCountTokens,
        generateContent: jest.fn(),
      }
    })),
    Type: {
        OBJECT: 'OBJECT',
        STRING: 'STRING',
        NUMBER: 'NUMBER',
        ARRAY: 'ARRAY'
    }
  };
});

describe('GeminiService', () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.setItem('chefai_pass', 'test-key');
    jest.clearAllMocks();
    mockCountTokens.mockReset();
  });

  describe('validateAIConnection', () => {
    it('should return healthy when connection is valid', async () => {
      const { validateAIConnection } = require('./geminiService');
      mockCountTokens.mockResolvedValue({ totalTokens: 10 });

      const result = await validateAIConnection();
      expect(result.status).toBe('healthy');
      expect(result.message).toBe('Connected');
    });

    it('should return auth_error when API key is invalid', async () => {
      const { validateAIConnection } = require('./geminiService');
      mockCountTokens.mockRejectedValue(new Error('API_KEY_INVALID'));

      const result = await validateAIConnection();
      expect(result.status).toBe('auth_error');
    });

    it('should return quota_error when limit is reached', async () => {
      const { validateAIConnection } = require('./geminiService');
      mockCountTokens.mockRejectedValue(new Error('Quota exceeded'));

      const result = await validateAIConnection();
      expect(result.status).toBe('quota_error');
    });
  });
});
