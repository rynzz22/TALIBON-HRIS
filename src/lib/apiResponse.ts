/**
 * API Response wrapper and utilities
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Create a standardized response wrapper
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(error: string, message?: string): ApiResponse<never> {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
  };
}

// Response interceptor for consistency
export function handleApiResponse<T>(response: any): T {
  if (response && typeof response === 'object') {
    // If response has data property, return that
    if ('data' in response) {
      return response.data;
    }
    // Otherwise return the whole response
    return response;
  }
  return response;
}

// Error handler for API calls
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function parseApiError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    const message = data?.message || error.message;
    const code = data?.code || `HTTP_${status}`;
    const details = data?.details;

    return new ApiError(status, code, message, details);
  }

  if (error.message) {
    return new ApiError(0, 'UNKNOWN_ERROR', error.message);
  }

  return new ApiError(0, 'UNKNOWN_ERROR', 'An unknown error occurred');
}

// Retry logic for failed requests
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
    }
  }
  throw new Error('Max retries exceeded');
}
