import axios, { AxiosError, AxiosResponse, AxiosInstance } from 'axios';

// ============================================
// ENTERPRISE-GRADE API CLIENT WITH SECURITY
// ============================================

interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  status: number;
  timestamp: string;
  details?: any;
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    public details?: any,
    message?: string
  ) {
    super(message || code);
    this.name = 'ApiError';
  }
}

// ============================================
// API CLIENT CONFIGURATION
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// ============================================
// SECURITY HEADERS & INTERCEPTORS
// ============================================

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Version': '1.0.0',
    },
  });

  // Request Interceptor - Add Auth Token & Security Headers
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracing
      config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Add timestamp to prevent replay attacks
      config.headers['X-Request-Timestamp'] = new Date().toISOString();

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor - Handle Errors & Token Refresh
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<any>>) => {
      if (response.data.success) {
        return response.data;
      }
      throw new ApiError(
        response.data.code || 'UNKNOWN_ERROR',
        response.status,
        response.data.details,
        response.data.message
      );
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Unauthorized - Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('authEmployee');
        window.location.href = '/login';
        return Promise.reject(
          new ApiError('UNAUTHORIZED', 401, null, 'Session expired. Please login again.')
        );
      }

      if (error.response?.status === 403) {
        // Forbidden - Insufficient permissions
        return Promise.reject(
          new ApiError('FORBIDDEN', 403, null, 'You do not have permission to perform this action.')
        );
      }

      if (error.response?.status === 429) {
        // Rate limited
        return Promise.reject(
          new ApiError('RATE_LIMITED', 429, null, 'Too many requests. Please try again later.')
        );
      }

      if (error.response?.status === 500) {
        // Server error
        return Promise.reject(
          new ApiError('SERVER_ERROR', 500, null, 'Server error. Please contact support.')
        );
      }

      if (!error.response) {
        // Network error
        return Promise.reject(
          new ApiError('NETWORK_ERROR', 0, null, 'Network error. Please check your connection.')
        );
      }

      return Promise.reject(
        new ApiError(
          'REQUEST_FAILED',
          error.response?.status || 0,
          error.response?.data,
          error.message
        )
      );
    }
  );

  return client;
};

const apiClient = createApiClient();

// ============================================
// RETRY LOGIC FOR RESILIENCE
// ============================================

const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error as ApiError).status >= 500) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// ============================================
// API ENDPOINTS
// ============================================

export const AuthAPI = {
  login: (email: string, password: string) =>
    retryRequest(() =>
      apiClient.post<ApiResponse<any>>('/auth/login', { email, password })
    ),
  logout: () =>
    retryRequest(() =>
      apiClient.post<ApiResponse<null>>('/auth/logout', {})
    ),
  refreshToken: () =>
    retryRequest(() =>
      apiClient.post<ApiResponse<any>>('/auth/refresh', {})
    ),
  getCurrentUser: () =>
    retryRequest(() =>
      apiClient.get<ApiResponse<any>>('/auth/me')
    ),
};

export const EmployeeAPI = {
  list: () =>
    retryRequest(() =>
      apiClient.get<ApiResponse<any[]>>('/employees')
    ),
  getById: (id: string) =>
    retryRequest(() =>
      apiClient.get<ApiResponse<any>>(`/employees/${id}`)
    ),
  create: (data: any) =>
    retryRequest(() =>
      apiClient.post<ApiResponse<any>>('/employees', data)
    ),
  update: (id: string, data: any) =>
    retryRequest(() =>
      apiClient.put<ApiResponse<any>>(`/employees/${id}`, data)
    ),
  delete: (id: string) =>
    retryRequest(() =>
      apiClient.delete<ApiResponse<null>>(`/employees/${id}`)
    ),
};

export const PayrollAPI = {
  list: (filters?: { period?: string; employeeId?: string }) =>
    retryRequest(() =>
      apiClient.get<ApiResponse<any[]>>('/payroll', { params: filters })
    ),
  getById: (id: string) =>
    retryRequest(() =>
      apiClient.get<ApiResponse<any>>(`/payroll/${id}`)
    ),
  generate: (data: any) =>
    retryRequest(() =>
      apiClient.post<ApiResponse<any>>('/payroll', data)
    ),
  update: (id: string, data: any) =>
    retryRequest(() =>
      apiClient.put<ApiResponse<any>>(`/payroll/${id}`, data)
    ),
};

export const LeaveAPI = {
  list: (filters?: { status?: string; employeeId?: string }) =>
    retryRequest(() =>
      apiClient.get<ApiResponse<any[]>>('/leave', { params: filters })
    ),
  getById: (id: string) =>
    retryRequest(() =>
      apiClient.get<ApiResponse<any>>(`/leave/${id}`)
    ),
  submit: (data: any) =>
    retryRequest(() =>
      apiClient.post<ApiResponse<any>>('/leave', data)
    ),
  updateStatus: (id: string, status: 'approved' | 'rejected', remarks?: string) =>
    retryRequest(() =>
      apiClient.put<ApiResponse<any>>(`/leave/${id}/status`, { status, remarks })
    ),
};

export const AttendanceAPI = {
  list: (filters?: { date?: string; employeeId?: string }) =>
    retryRequest(() =>
      apiClient.get<ApiResponse<any[]>>('/attendance', { params: filters })
    ),
  log: (employeeId: string, type: 'in' | 'out') =>
    retryRequest(() =>
      apiClient.post<ApiResponse<any>>('/attendance/log', {
        employeeId,
        type,
        date: new Date().toISOString().split('T')[0],
        timeIn: new Date().toISOString(),
      })
    ),
};

export const AuditAPI = {
  list: (filters?: { userId?: string; action?: string; limit?: number }) =>
    retryRequest(() =>
      apiClient.get<ApiResponse<any[]>>('/audit', { params: filters })
    ),
  log: (data: { userId: string; userName: string; action: string; target: string }) =>
    retryRequest(() =>
      apiClient.post<ApiResponse<null>>('/audit', data)
    ),
};

export const NotificationAPI = {
  list: (userId: string, unreadOnly?: boolean) =>
    retryRequest(() =>
      apiClient.get<ApiResponse<any[]>>(`/notifications/${userId}`, { params: { unreadOnly } })
    ),
  markAsRead: (notificationId: string) =>
    retryRequest(() =>
      apiClient.put<ApiResponse<null>>(`/notifications/${notificationId}/read`, {})
    ),
};

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

export const parseApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.response?.data) {
    return new ApiError(
      error.response.data.code || 'UNKNOWN_ERROR',
      error.response.status,
      error.response.data.details,
      error.response.data.message
    );
  }

  return new ApiError('UNKNOWN_ERROR', 0, null, error.message || 'An unknown error occurred');
};

export { ApiError, ApiResponse, ApiSuccessResponse, ApiErrorResponse };
export default apiClient;
