
import React from 'react';
import ReactDOM from 'react-dom/client';
import ChefAIApp from './App';
import { ChefProvider } from './context/ChefContext';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <ChefProvider>
    <ChefAIApp />
  </ChefProvider>
);
