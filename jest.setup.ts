import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { ReadableStream } from 'node:stream/web';

// @ts-ignore
if (!global.ReadableStream) {
  global.ReadableStream = ReadableStream as any;
}

// Mocking window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
