import { renderHook, act } from '@testing-library/react';

// Mock AI client to avoid ESM issues
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
  Type: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING', NUMBER: 'NUMBER' }
}));

import { useTracker } from './useTracker';
import { useTrackerContext } from '../../../entities/tracker/model/TrackerContext';
import { useAuthContext } from '../../../context/AuthContext';
import { useRecipeContext } from '../../../context/RecipeContext';

// Mock contexts
jest.mock('../../../entities/tracker/model/TrackerContext');
jest.mock('../../../context/AuthContext');
jest.mock('../../../context/RecipeContext');

describe('useTracker', () => {
  const mockSavePurchase = jest.fn();
  const mockDeletePurchase = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTrackerContext as jest.Mock).mockReturnValue({
      products: [],
      purchases: [],
      savePurchase: mockSavePurchase,
      deletePurchase: mockDeletePurchase,
      loadMorePurchases: jest.fn(),
      hasMore: false
    });
    (useAuthContext as jest.Mock).mockReturnValue({
      isAIEnabled: true,
      reportError: jest.fn()
    });
    (useRecipeContext as jest.Mock).mockReturnValue({
      savedRecipes: [],
      setActiveRecipe: jest.fn()
    });
  });

  it('should switch tabs', () => {
    const { result } = renderHook(() => useTracker());

    expect(result.current.state.activeTab).toBe('catalog');

    act(() => {
      result.current.actions.setActiveTab('history');
    });

    expect(result.current.state.activeTab).toBe('history');
  });

  it('should manage modal state', () => {
    const { result } = renderHook(() => useTracker());

    expect(result.current.state.modal.type).toBe('none');

    act(() => {
      result.current.actions.setModal({ type: 'log' });
    });
    expect(result.current.state.modal.type).toBe('log');

    act(() => {
      result.current.actions.closeModal();
    });
    expect(result.current.state.modal.type).toBe('none');
  });

  it('should handle save action', async () => {
    const { result } = renderHook(() => useTracker());

    act(() => {
      result.current.actions.setModal({ type: 'edit', id: '1' });
    });

    mockSavePurchase.mockResolvedValue(true);

    await act(async () => {
      await result.current.actions.handleSave({ productName: 'New Name' });
    });

    expect(mockSavePurchase).toHaveBeenCalledWith({ productName: 'New Name' }, true, '1');
    expect(result.current.state.modal.type).toBe('none');
  });

  it('should handle delete action', async () => {
    const { result } = renderHook(() => useTracker());

    act(() => {
      result.current.actions.setModal({ type: 'edit', id: '1' });
    });

    await act(async () => {
      await result.current.actions.handleDelete();
    });

    expect(mockDeletePurchase).toHaveBeenCalledWith('1');
    expect(result.current.state.modal.type).toBe('none');
  });
});
