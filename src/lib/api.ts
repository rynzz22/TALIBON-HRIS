import axios, { AxiosError, AxiosResponse, AxiosInstance } from 'axios';

// ============================================
// ENTERPRISE API CLIENT — TALIBON HRIS
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  status: number;
  timestamp: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    public details?: unknown,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'ApiError';
  }
}

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const REQUEST_TIMEOUT = 30_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1_000;

// Non-retryable status codes
const NO_RETRY_STATUSES = new Set([400, 401, 403, 404, 422]);

// ============================================
// CLIENT FACTORY
// ============================================

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Version': '1.0.0',
    },
  });

  // ── Request interceptor ──────────────────────────────────────────────────
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      config.headers['X-Request-Timestamp'] = new Date().toISOString();
      return config;
    },
    (error) => Promise.reject(error),
  );

  // ── Response interceptor ─────────────────────────────────────────────────
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
      const body = response.data;
      if (body.success) return body as any;
      throw new ApiError(
        (body as ApiErrorResponse).code ?? 'UNKNOWN_ERROR',
        response.status,
        (body as ApiErrorResponse).details,
        body.message,
      );
    },
    (error: AxiosError) => {
      const status = error.response?.status ?? 0;

      if (status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authEmployee');
        // Let the auth context handle the redirect rather than forcing a full reload.
        return Promise.reject(new ApiError('UNAUTHORIZED', 401, null, 'Session expired. Please log in again.'));
      }
      if (status === 403)
        return Promise.reject(new ApiError('FORBIDDEN', 403, null, 'Insufficient permissions.'));
      if (status === 429)
        return Promise.reject(new ApiError('RATE_LIMITED', 429, null, 'Too many requests. Please slow down.'));
      if (status >= 500)
        return Promise.reject(new ApiError('SERVER_ERROR', status, null, 'Server error. Please contact support.'));
      if (!error.response)
        return Promise.reject(new ApiError('NETWORK_ERROR', 0, null, 'Network error. Check your connection.'));

      return Promise.reject(
        new ApiError('REQUEST_FAILED', status, error.response?.data, error.message),
      );
    },
  );

  return client;
}

const apiClient = createApiClient();

// ============================================
// RETRY HELPER
// ============================================

async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_BASE_DELAY,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const apiErr = error as ApiError;
    if (retries > 0 && !NO_RETRY_STATUSES.has(apiErr.status)) {
      await new Promise((res) => setTimeout(res, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// ============================================
// AUTH API
// ============================================

export const AuthAPI = {
  login: (email: string, password: string) =>
    retryRequest(() => apiClient.post<ApiResponse<{ user: unknown; token: string; refreshToken: string }>>('/auth/login', { email, password })),

  logout: () =>
    retryRequest(() => apiClient.post<ApiResponse<null>>('/auth/logout', {})),

  refreshToken: () =>
    retryRequest(() => apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh', {})),

  getCurrentUser: () =>
    retryRequest(() => apiClient.get<ApiResponse<unknown>>('/auth/me')),
};

// ============================================
// EMPLOYEE API
// ============================================

export const EmployeeAPI = {
  list: () =>
    retryRequest(() => apiClient.get<ApiResponse<unknown[]>>('/employees')),

  getById: (id: string) =>
    retryRequest(() => apiClient.get<ApiResponse<unknown>>(`/employees/${id}`)),

  create: (data: unknown) =>
    retryRequest(() => apiClient.post<ApiResponse<unknown>>('/employees', data)),

  update: (id: string, data: unknown) =>
    retryRequest(() => apiClient.put<ApiResponse<unknown>>(`/employees/${id}`, data)),

  delete: (id: string) =>
    retryRequest(() => apiClient.delete<ApiResponse<null>>(`/employees/${id}`)),
};

// ============================================
// PAYROLL API
// ============================================

export const PayrollAPI = {
  list: (filters?: { period?: string; employeeId?: string }) =>
    retryRequest(() => apiClient.get<ApiResponse<unknown[]>>('/payroll', { params: filters })),

  getById: (id: string) =>
    retryRequest(() => apiClient.get<ApiResponse<unknown>>(`/payroll/${id}`)),

  generate: (data: unknown) =>
    retryRequest(() => apiClient.post<ApiResponse<unknown>>('/payroll', data)),

  update: (id: string, data: unknown) =>
    retryRequest(() => apiClient.put<ApiResponse<unknown>>(`/payroll/${id}`, data)),
};

// ============================================
// LEAVE API
// ============================================

export const LeaveAPI = {
  list: (filters?: { status?: string; employeeId?: string }) =>
    retryRequest(() => apiClient.get<ApiResponse<unknown[]>>('/leave', { params: filters })),

  getById: (id: string) =>
    retryRequest(() => apiClient.get<ApiResponse<unknown>>(`/leave/${id}`)),

  submit: (data: unknown) =>
    retryRequest(() => apiClient.post<ApiResponse<unknown>>('/leave', data)),

  updateStatus: (id: string, status: 'approved' | 'rejected', remarks?: string) =>
    retryRequest(() => apiClient.put<ApiResponse<unknown>>(`/leave/${id}/status`, { status, remarks })),
};

// ============================================
// ATTENDANCE API
// ============================================

export const AttendanceAPI = {
  list: (filters?: { date?: string; employeeId?: string }) =>
    retryRequest(() => apiClient.get<ApiResponse<unknown[]>>('/attendance', { params: filters })),

  log: (employeeId: string, type: 'in' | 'out') =>
    retryRequest(() =>
      apiClient.post<ApiResponse<unknown>>('/attendance/log', {
        employeeId,
        type,
        date: new Date().toISOString().split('T')[0],
        timeIn: new Date().toISOString(),
      }),
    ),
};

// ============================================
// AUDIT API
// ============================================

export const AuditAPI = {
  list: (filters?: { userId?: string; action?: string; limit?: number }) =>
    retryRequest(() => apiClient.get<ApiResponse<unknown[]>>('/audit', { params: filters })),

  log: (data: { userId: string; userName: string; action: string; target: string }) =>
    retryRequest(() => apiClient.post<ApiResponse<null>>('/audit', data)),
};

// ============================================
// NOTIFICATION API
// ============================================

export const NotificationAPI = {
  list: (userId: string, unreadOnly?: boolean) =>
    retryRequest(() =>
      apiClient.get<ApiResponse<unknown[]>>(`/notifications/${userId}`, { params: { unreadOnly } }),
    ),

  markAsRead: (notificationId: string) =>
    retryRequest(() => apiClient.put<ApiResponse<null>>(`/notifications/${notificationId}/read`, {})),
};

// ============================================
// ERROR UTILITIES
// ============================================

export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const err = error as Record<string, unknown>;

  if (err.response && typeof err.response === 'object') {
    const res = err.response as Record<string, unknown>;
    const data = res.data as Record<string, unknown> | undefined;
    return new ApiError(
      (data?.code as string) ?? 'UNKNOWN_ERROR',
      (res.status as number) ?? 0,
      data?.details,
      (data?.message as string) ?? (err.message as string),
    );
  }

  return new ApiError('UNKNOWN_ERROR', 0, null, (err.message as string) ?? 'An unknown error occurred');
}

export default apiClient;