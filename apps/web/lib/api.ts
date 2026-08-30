import type { ApiResponse } from '@devlearn/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Format raw error to a clean, user-friendly message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return 'Invalid email or password. Please verify your credentials and try again.';
    }
    if (error.code === 'EMAIL_ALREADY_EXISTS') {
      return 'An account with this email address already exists. Please log in instead.';
    }
    if (error.code === 'UNAUTHORIZED') {
      return 'Your session has expired. Please sign in again.';
    }
    if (error.code === 'VALIDATION_ERROR') {
      return error.message || 'Please check your inputs and try again.';
    }
    if (error.code === 'NOT_FOUND') {
      return error.message || 'The requested resource could not be found.';
    }
    if (error.code === 'RATE_LIMITED') {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    // Clean any accidental database error strings
    if (error.message.includes('prisma') || error.message.includes('column') || error.message.includes('invocation')) {
      return 'An unexpected server error occurred. Please try again later.';
    }
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return 'Unable to connect to DevLearn server. Please ensure the backend is running and try again.';
    }
    if (error.message.includes('prisma') || error.message.includes('column') || error.message.includes('invocation')) {
      return 'An unexpected server error occurred. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensure cookies are sent with requests
    });
  } catch (err) {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Unable to connect to the server. Please check your network connection.'
    );
  }

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: {
      code: 'PARSE_ERROR',
      message: 'Failed to parse response from server',
    },
  }));

  if (!response.ok || !json.success) {
    const rawMessage = json.error?.message || 'An unexpected error occurred';
    const sanitizedMessage = rawMessage.includes('prisma') || rawMessage.includes('column') || rawMessage.includes('invocation')
      ? 'An unexpected server error occurred. Please try again.'
      : rawMessage;

    throw new ApiError(
      response.status,
      json.error?.code || 'UNKNOWN_ERROR',
      sanitizedMessage,
      json.error?.details
    );
  }

  return json.data as T;
}
