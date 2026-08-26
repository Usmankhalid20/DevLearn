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

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are sent with requests
  });

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: {
      code: 'PARSE_ERROR',
      message: 'Failed to parse response from server',
    },
  }));

  if (!response.ok || !json.success) {
    throw new ApiError(
      response.status,
      json.error?.code || 'UNKNOWN_ERROR',
      json.error?.message || 'An unexpected error occurred',
      json.error?.details
    );
  }

  return json.data as T;
}
