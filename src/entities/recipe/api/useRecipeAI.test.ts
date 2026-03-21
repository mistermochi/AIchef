import { renderHook, act } from '@testing-library/react';

// Mock everything that might cause ESM issues BEFORE importing anything that uses them
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
  Type: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING', NUMBER: 'NUMBER' }
}));

import { useRecipeAI } from './useRecipeAI';
import { useAuthContext } from '../../../entities/user/model/AuthContext';
import { getAIService } from '../../../shared/api/aiServiceFactory';

// Mock the services and context
jest.mock('../../../shared/api/aiServiceFactory');
jest.mock('../../../entities/user/model/AuthContext');

describe('useRecipeAI hook', () => {
  const mockAI = {
    processRecipe: jest.fn(),
    generateGenieIdeas: jest.fn(),
    refineRecipe: jest.fn(),
  };
  const mockReportError = jest.fn();
  const mockGetProfileContext = jest.fn().mockReturnValue('mock prefs');

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthContext as jest.Mock).mockReturnValue({
      isAIEnabled: true,
      reportError: mockReportError,
      getProfileContext: mockGetProfileContext,
      profile: { aiProvider: 'gemini' }
    });
    (getAIService as jest.Mock).mockReturnValue(mockAI);
  });

  it('should process a recipe successfully', async () => {
    const mockRecipe = { title: 'Test Recipe', ingredients: [], instructions: [] };
    mockAI.processRecipe.mockResolvedValue(mockRecipe);

    const { result } = renderHook(() => useRecipeAI());

    let processedRecipe;
    await act(async () => {
      processedRecipe = await result.current.processRecipe('input text');
    });

    expect(result.current.loading).toBe(false);
    expect(processedRecipe).toEqual({
      ...mockRecipe,
      ingredients: [],
      instructions: [],
      extractedTips: [],
      aiSuggestions: []
    });
    expect(mockAI.processRecipe).toHaveBeenCalledWith('input text', 'mock prefs');
  });

  it('should handle AI errors during recipe processing', async () => {
    mockAI.processRecipe.mockRejectedValue(new Error('Quota Exceeded'));

    const { result } = renderHook(() => useRecipeAI());

    await act(async () => {
      await result.current.processRecipe('input text');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Quota Exceeded');
    expect(mockReportError).toHaveBeenCalledWith('quota_error', 'Quota Exceeded');
  });

  it('should generate genie ideas successfully', async () => {
    const mockIdeas = [{ title: 'Idea 1', summary: 'Summary 1', emoji: '🥗' }];
    mockAI.generateGenieIdeas.mockResolvedValue(mockIdeas);

    const { result } = renderHook(() => useRecipeAI());

    await act(async () => {
      await result.current.generateGenieIdeas('ingredients');
    });

    expect(result.current.genieLoading).toBe(false);
    expect(result.current.genieIdeas).toEqual(mockIdeas);
  });

  it('should handle auth errors', async () => {
    mockAI.processRecipe.mockRejectedValue(new Error('api_key_not_found'));

    const { result } = renderHook(() => useRecipeAI());

    await act(async () => {
      await result.current.processRecipe('input text');
    });

    expect(mockReportError).toHaveBeenCalledWith('auth_error', 'Invalid or Missing API Key');
  });
});
