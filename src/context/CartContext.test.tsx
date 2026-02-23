import React from 'react';

// Mock AI client to avoid ESM issues
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
  Type: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING', NUMBER: 'NUMBER' }
}));

import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCartContext } from './CartContext';
import { Recipe } from '../types';

// Mock dependencies
jest.mock('../firebase', () => ({
  chefDb: {},
  chefAuth: { onAuthStateChanged: jest.fn(() => () => {}) },
  CHEF_APP_ID: 'test-app'
}));

// Mock AuthContext to avoid Firebase dependencies
jest.mock('./AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div>{children}</div>,
  useAuthContext: () => ({ isAIEnabled: true })
}));

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  it('should add items to the cart', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });

    const mockRecipe: Recipe = { id: 'r1', title: 'Recipe 1', emoji: '🥘', summary: 'test', instructions: [], extractedTips: [], aiSuggestions: [], ingredients: [{ name: 'Ing 1', quantity: 1, unit: 'pcs' }] };

    act(() => {
      result.current.addToCart(mockRecipe, 1);
    });

    expect(result.current.cart.length).toBe(1);
    expect(result.current.cart[0].title).toBe('Recipe 1');
  });

  it('should remove items from the cart', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });

    const mockRecipe: Recipe = { id: 'r1', title: 'Recipe 1', emoji: '🥘', summary: 'test', instructions: [], extractedTips: [], aiSuggestions: [], ingredients: [] };

    act(() => {
      result.current.addToCart(mockRecipe, 1);
    });

    const cartId = result.current.cart[0].id;

    act(() => {
      result.current.removeFromCart(cartId);
    });

    expect(result.current.cart.length).toBe(0);
  });

  it('should update item scaling factor', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });

    const mockRecipe: Recipe = { id: 'r1', title: 'Recipe 1', emoji: '🥘', summary: 'test', instructions: [], extractedTips: [], aiSuggestions: [], ingredients: [] };

    act(() => {
      result.current.addToCart(mockRecipe, 1);
    });

    const cartId = result.current.cart[0].id;

    act(() => {
      result.current.updateCartItemFactor(cartId, 2);
    });

    expect(result.current.cart[0].scalingFactor).toBe(2);
  });

  it('should consolidate ingredients correctly', () => {
    const { result } = renderHook(() => useCartContext(), { wrapper });

    const mockRecipe1: Recipe = { id: 'r1', title: 'Recipe 1', emoji: '🥘', summary: 'test', instructions: [], extractedTips: [], aiSuggestions: [], ingredients: [{ name: 'Sugar', quantity: 100, unit: 'g' }] };
    const mockRecipe2: Recipe = { id: 'r2', title: 'Recipe 2', emoji: '🥘', summary: 'test', instructions: [], extractedTips: [], aiSuggestions: [], ingredients: [{ name: 'Sugar', quantity: 0.1, unit: 'kg' }] };

    act(() => {
      result.current.addToCart(mockRecipe1, 1);
      result.current.addToCart(mockRecipe2, 1);
    });

    expect(result.current.consolidatedList.length).toBe(1);
    expect(result.current.consolidatedList[0].name).toBe('Sugar');
    // 100g + 0.1kg = 200g
    expect(result.current.consolidatedList[0].quantity).toBe(200);
    expect(result.current.consolidatedList[0].unit).toBe('g');
  });
});
