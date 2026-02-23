import { mapAIError } from './ai';

describe('mapAIError utility', () => {
  it('should map region restricted error correctly', () => {
    const error = new Error('User location is not supported for the API use');
    const result = mapAIError(error);
    expect(result.status).toBe('region_restricted');
    expect(result.message).toBe('Location Not Supported');
  });

  it('should map quota exceeded error correctly', () => {
    const error = new Error('429 Too Many Requests: Resource has been exhausted');
    const result = mapAIError(error);
    expect(result.status).toBe('quota_error');
    expect(result.message).toBe('Quota Exceeded');
  });

  it('should map auth error correctly', () => {
    const error = new Error('API_KEY_INVALID');
    const result = mapAIError(error);
    expect(result.status).toBe('auth_error');
    expect(result.message).toBe('Invalid or Missing API Key');
  });

  it('should fallback to unhealthy for unknown errors', () => {
    const error = new Error('Something went wrong with the AI');
    const result = mapAIError(error);
    expect(result.status).toBe('unhealthy');
    expect(result.message).toBe('Something went wrong with the AI');
  });

  it('should handle null or undefined error', () => {
    expect(mapAIError(null).status).toBe('unhealthy');
    expect(mapAIError(undefined).status).toBe('unhealthy');
  });
});
