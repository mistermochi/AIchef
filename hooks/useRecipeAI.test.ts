import { renderHook, act } from '@testing-library/react';

// Mock everything that might cause ESM issues BEFORE importing anything that uses them
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
  Type: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING', NUMBER: 'NUMBER' }
}));

import { useRecipeAI } from './useRecipeAI';
import * as gemini from '../services/geminiService';
import { useAuthContext } from '../context/AuthContext';

// Mock the services and context
jest.mock('../services/geminiService');
jest.mock('../context/AuthContext');

describe('useRecipeAI hook', () => {
  const mockReportError = jest.fn();
  const mockOpenKeySelector = jest.fn();
  const mockGetProfileContext = jest.fn().mockReturnValue('mock prefs');

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthContext as jest.Mock).mockReturnValue({
      isAIEnabled: true,
      reportError: mockReportError,
      openKeySelector: mockOpenKeySelector,
      getProfileContext: mockGetProfileContext
    });
  });

  it('should process a recipe successfully', async () => {
    const mockRecipe = { title: 'Test Recipe', ingredients: [], instructions: [] };
    (gemini.processRecipe as jest.Mock).mockResolvedValue(mockRecipe);

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
    expect(gemini.processRecipe).toHaveBeenCalledWith('input text', 'mock prefs');
  });

  it('should handle AI errors during recipe processing', async () => {
    (gemini.processRecipe as jest.Mock).mockRejectedValue(new Error('Quota Exceeded'));

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
    (gemini.generateGenieIdeas as jest.Mock).mockResolvedValue(mockIdeas);

    const { result } = renderHook(() => useRecipeAI());

    await act(async () => {
      await result.current.generateGenieIdeas('ingredients');
    });

    expect(result.current.genieLoading).toBe(false);
    expect(result.current.genieIdeas).toEqual(mockIdeas);
  });

  it('should handle auth errors by opening key selector', async () => {
    (gemini.processRecipe as jest.Mock).mockRejectedValue(new Error('api_key_not_found'));

    const { result } = renderHook(() => useRecipeAI());

    await act(async () => {
      await result.current.processRecipe('input text');
    });

    expect(mockOpenKeySelector).toHaveBeenCalled();
    expect(mockReportError).toHaveBeenCalledWith('auth_error', 'Invalid or Missing API Key');
  });
});
