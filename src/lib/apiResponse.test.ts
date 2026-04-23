/**
 * Unit tests for API response handling
 * Run with: npm test apiResponse.test.ts
 */

import {
  createSuccessResponse,
  createErrorResponse,
  handleApiResponse,
  ApiError,
  parseApiError,
} from '../lib/apiResponse';

describe('API Response Utilities', () => {
  describe('Success Response', () => {
    test('should create a properly formatted success response', () => {
      const data = { id: 1, name: 'John' };
      const response = createSuccessResponse(data, 'Success');

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Success');
      expect(response.timestamp).toBeDefined();
    });

    test('should create success response without message', () => {
      const data = { id: 1 };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBeUndefined();
    });
  });

  describe('Error Response', () => {
    test('should create a properly formatted error response', () => {
      const response = createErrorResponse('VALIDATION_ERROR', 'Invalid input');

      expect(response.success).toBe(false);
      expect(response.error).toBe('VALIDATION_ERROR');
      expect(response.message).toBe('Invalid input');
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('Handle API Response', () => {
    test('should return data property if it exists', () => {
      const response = { data: { id: 1 }, meta: {} };
      const result = handleApiResponse(response);

      expect(result).toEqual({ id: 1 });
    });

    test('should return whole response if no data property', () => {
      const response = { id: 1, name: 'Test' };
      const result = handleApiResponse(response);

      expect(result).toEqual(response);
    });

    test('should handle non-object responses', () => {
      expect(handleApiResponse('string')).toBe('string');
      expect(handleApiResponse(123)).toBe(123);
      expect(handleApiResponse(null)).toBe(null);
    });
  });

  describe('API Error', () => {
    test('should create API error with all properties', () => {
      const error = new ApiError(400, 'BAD_REQUEST', 'Invalid data', { field: 'email' });

      expect(error.status).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Invalid data');
      expect(error.details).toEqual({ field: 'email' });
      expect(error.name).toBe('ApiError');
    });
  });

  describe('Parse API Error', () => {
    test('should parse axios error response', () => {
      const axiosError = {
        response: {
          status: 401,
          data: {
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
            details: { reason: 'password_incorrect' },
          },
        },
      };

      const error = parseApiError(axiosError);

      expect(error instanceof ApiError).toBe(true);
      expect(error.status).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Invalid credentials');
      expect(error.details).toEqual({ reason: 'password_incorrect' });
    });

    test('should handle error messages', () => {
      const error = parseApiError(new Error('Network error'));

      expect(error instanceof ApiError).toBe(true);
      expect(error.message).toBe('Network error');
    });

    test('should handle unknown errors', () => {
      const error = parseApiError({});

      expect(error instanceof ApiError).toBe(true);
      expect(error.message).toBe('An unknown error occurred');
    });

    test('should return existing ApiError as-is', () => {
      const originalError = new ApiError(500, 'SERVER_ERROR', 'Server crashed');
      const error = parseApiError(originalError);

      expect(error).toBe(originalError);
    });
  });
});
