
export type AIStatus = 'healthy' | 'auth_error' | 'quota_error' | 'network_error' | 'region_restricted' | 'unhealthy';

export interface AIErrorResult {
  status: AIStatus;
  message: string;
}

/**
 * Maps raw AI errors to structured AIErrorResult for consistent UI handling.
 * @param {any} error - The caught error object.
 * @returns {AIErrorResult} Structured error result.
 */
export const mapAIError = (error: any): AIErrorResult => {
  const msg = error?.message?.toLowerCase() || '';

  if (msg.includes('location') || msg.includes('region') || msg.includes('unsupported country')) {
    return { status: 'region_restricted', message: 'Location Not Supported' };
  }

  if (msg.includes('quota') || msg.includes('429')) {
    return { status: 'quota_error', message: 'Quota Exceeded' };
  }

  if (msg.includes('api_key') || msg.includes('403') || msg.includes('400') || msg.includes('not found') || msg.includes('auth')) {
    return { status: 'auth_error', message: 'Invalid or Missing API Key' };
  }

  return { status: 'unhealthy', message: error?.message || 'AI Service Failure' };
};
