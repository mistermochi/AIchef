import { renderHook, act } from '@testing-library/react';

// Mock AI client to avoid ESM issues
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
  Type: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING', NUMBER: 'NUMBER' }
}));

import { useCookingSession } from './useMakeController';

// Mock dependencies
jest.mock('../../hooks/useVoiceControl', () => ({
  useVoiceControl: () => ({
    isListening: false,
    isSpeaking: false,
    toggleListening: jest.fn(),
    transcript: '',
    speak: jest.fn(),
    cancel: jest.fn()
  })
}));

jest.mock('../../hooks/useDevice', () => ({
  useWakeLock: () => true
}));

describe('useCookingSession controller', () => {
  const mockRecipe = {
    instructions: ['Step 1', 'Step 2', 'Step 3'],
    ingredients: [],
    extractedTips: [],
    aiSuggestions: []
  };
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should navigate between steps', () => {
    const { result } = renderHook(() => useCookingSession({ recipe: mockRecipe, onClose: mockOnClose }));

    expect(result.current.state.currentStep).toBe(0);

    act(() => {
      result.current.actions.nextStep();
    });
    expect(result.current.state.currentStep).toBe(1);

    act(() => {
      result.current.actions.prevStep();
    });
    expect(result.current.state.currentStep).toBe(0);
  });

  it('should not navigate beyond boundaries', () => {
    const { result } = renderHook(() => useCookingSession({ recipe: mockRecipe, onClose: mockOnClose }));

    act(() => {
      result.current.actions.prevStep();
    });
    expect(result.current.state.currentStep).toBe(0);

    act(() => {
      result.current.actions.nextStep();
      result.current.actions.nextStep();
      result.current.actions.nextStep();
    });
    expect(result.current.state.currentStep).toBe(2);
  });

  it('should manage smart timers', () => {
    const { result } = renderHook(() => useCookingSession({ recipe: mockRecipe, onClose: mockOnClose }));

    act(() => {
      result.current.actions.startSmartTimer(60, 'Timer 1');
    });

    expect(result.current.state.activeTimer).toEqual(expect.objectContaining({
      total: 60,
      label: 'Timer 1',
      status: 'running'
    }));

    act(() => {
      result.current.actions.toggleTimer(); // Pause
    });
    expect(result.current.state.activeTimer?.status).toBe('paused');

    act(() => {
      result.current.actions.stopTimer();
    });
    expect(result.current.state.activeTimer).toBeNull();
  });

  it('should set timer to done when time is up', () => {
    const { result } = renderHook(() => useCookingSession({ recipe: mockRecipe, onClose: mockOnClose }));

    act(() => {
      result.current.actions.startSmartTimer(10, 'Short Timer');
    });

    act(() => {
      jest.advanceTimersByTime(11000);
    });

    expect(result.current.state.activeTimer?.status).toBe('done');
  });
});
