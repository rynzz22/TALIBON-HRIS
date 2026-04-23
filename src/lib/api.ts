import axios, { AxiosError, AxiosResponse } from 'axios';
import { parseApiError, ApiError } from './apiResponse';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors consistently
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;
    // Ensure response has consistent structure
    if (typeof data === 'object' && data !== null) {
      return {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    }
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  },
  (error: AxiosError) => {
    const apiError = parseApiError(error);
    console.error(`[Enterprise API Error]: ${apiError.message}`, {
      code: apiError.code,
      status: apiError.status,
      details: apiError.details,
    });

    // Handle specific error codes
    if (apiError.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }

    return Promise.reject(apiError);
  }
);

// Authentication API
export const AuthAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout', {}),
  refreshToken: () => api.post('/auth/refresh', {}),
  getCurrentUser: () => api.get('/auth/me'),
};

// Employee API
export const EmployeeAPI = {
  list: () => api.get('/employees'),
  create: (data: any) => api.post('/employees', data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  getById: (id: string) => api.get(`/employees/${id}`),
};

// Payroll API
export const PayrollAPI = {
  list: (filters?: { period?: string; employeeId?: string }) =>
    api.get('/payroll', { params: filters }),
  generate: (data: any) => api.post('/payroll', data),
  getById: (id: string) => api.get(`/payroll/${id}`),
  update: (id: string, data: any) => api.put(`/payroll/${id}`, data),
};

// Leave API
export const LeaveAPI = {
  list: (filters?: { status?: string; employeeId?: string }) =>
    api.get('/leave', { params: filters }),
  submit: (data: any) => api.post('/leave', data),
  updateStatus: (id: string, status: 'approved' | 'rejected', remarks?: string) =>
    api.put(`/leave/${id}/status`, { status, remarks }),
  getById: (id: string) => api.get(`/leave/${id}`),
};

// Attendance API
export const AttendanceAPI = {
  list: (filters?: { date?: string; employeeId?: string }) =>
    api.get('/attendance', { params: filters }),
  log: (employeeId: string, type: 'in' | 'out') =>
    api.post('/attendance/log', {
      employeeId,
      type,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toISOString(),
    }),
  correctAttendance: (id: string, data: any) =>
    api.post(`/attendance/${id}/correct`, data),
  getById: (id: string) => api.get(`/attendance/${id}`),
};

// Audit API
export const AuditAPI = {
  list: (filters?: { userId?: string; action?: string; limit?: number }) =>
    api.get('/audit', { params: filters }),
  log: (data: { userId: string; userName: string; action: string; target: string; details?: any }) =>
    api.post('/audit', data),
};

// Notification API
export const NotificationAPI = {
  list: (userId: string, unreadOnly?: boolean) =>
    api.get(`/notifications/${userId}`, { params: { unreadOnly } }),
  markAsRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`, {}),
  markAllAsRead: (userId: string) =>
    api.put(`/notifications/${userId}/read-all`, {}),
  subscribe: (userId: string, endpoint: string) =>
    api.post('/notifications/subscribe', { userId, endpoint }),
};

// Real-time subscription helper
export function subscribeToNotifications(userId: string, callback: (notification: any) => void) {
  // WebSocket or SSE implementation can be added here
  if ('EventSource' in window) {
    const eventSource = new EventSource(`/api/notifications/${userId}/stream`);

    eventSource.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data);
      callback(notification);
    });

    eventSource.addEventListener('error', () => {
      console.error('Notification subscription failed');
      eventSource.close();
    });

    return () => eventSource.close();
  }

  return () => {};
}

export default api;
