
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UIProvider, useUIContext } from './UIContext';

// Helper component to consume context
const Consumer = () => {
  const { view, setView } = useUIContext();
  return (
    <div>
      <span data-testid="view">{view}</span>
      <button onClick={() => setView('profile')}>Change View</button>
    </div>
  );
};

describe('UIContext', () => {
  it('provides default view', () => {
    render(
      <UIProvider>
        <Consumer />
      </UIProvider>
    );
    expect(screen.getByTestId('view')).toHaveTextContent('cookbook');
  });

  it('updates view', async () => {
    render(
      <UIProvider>
        <Consumer />
      </UIProvider>
    );
    const button = screen.getByText('Change View');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByTestId('view')).toHaveTextContent('profile');
  });
});
