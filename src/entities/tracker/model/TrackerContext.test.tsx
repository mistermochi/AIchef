import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { TrackerProvider, useTrackerContext } from './TrackerContext';
import { useAuthContext } from '../../../context/AuthContext';
import { useUIContext } from '../../../context/UIContext';
import * as firestore from 'firebase/firestore';

// Mock dependencies
jest.mock('../../../firebase', () => ({
  trackerDb: {},
  CHEF_APP_ID: 'test-app'
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuthContext: jest.fn()
}));

jest.mock('../../../context/UIContext', () => ({
  useUIContext: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  onSnapshot: jest.fn(() => () => {}),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  addDoc: jest.fn(),
  writeBatch: jest.fn(),
  deleteDoc: jest.fn()
}));

describe('TrackerContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthContext as jest.Mock).mockReturnValue({
      currentHomeId: 'home1',
      trackerUser: { uid: 'user1' }
    });
    (useUIContext as jest.Mock).mockReturnValue({
      view: 'tracker'
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TrackerProvider>{children}</TrackerProvider>
  );

  it('should call onSnapshot when activated', () => {
    renderHook(() => useTrackerContext(), { wrapper });
    expect(firestore.onSnapshot).toHaveBeenCalled();
  });

  it('should handle savePurchase successfully', async () => {
    const { result } = renderHook(() => useTrackerContext(), { wrapper });

    const mockData = { productName: 'Bread', price: 2 };
    (firestore.addDoc as jest.Mock).mockResolvedValue({ id: 'new-id' });

    let success;
    await act(async () => {
      success = await result.current.savePurchase(mockData, false);
    });

    expect(success).toBe(true);
    expect(firestore.addDoc).toHaveBeenCalled();
  });

  it('should handle deletePurchase successfully', async () => {
    const { result } = renderHook(() => useTrackerContext(), { wrapper });

    (firestore.deleteDoc as jest.Mock).mockResolvedValue(undefined);

    await act(async () => {
      await result.current.deletePurchase('purchase-id');
    });

    expect(firestore.deleteDoc).toHaveBeenCalled();
  });
});
