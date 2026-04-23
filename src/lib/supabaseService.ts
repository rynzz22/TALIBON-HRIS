import { supabase } from './supabase';
import type { Database } from './database.types';

type Employee = Database['public']['Tables']['employees']['Row'];
type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row'];
type PayrollRecord = Database['public']['Tables']['payroll_records']['Row'];
type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'];
type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

export const SupabaseService = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    logout: () => supabase.auth.signOut(),
    getCurrentUser: () => supabase.auth.getUser(),
    onAuthStateChange: (callback: (user: any) => void) =>
      supabase.auth.onAuthStateChange((_, session) => callback(session?.user)),
  },

  // Employees
  employees: {
    list: () => supabase.from('employees').select('*'),
    getById: (id: string) => supabase.from('employees').select('*').eq('id', id).single(),
    create: (data: Database['public']['Tables']['employees']['Insert']) =>
      supabase.from('employees').insert([data]).select().single(),
    update: (id: string, data: Database['public']['Tables']['employees']['Update']) =>
      supabase.from('employees').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('employees').delete().eq('id', id),
  },

  // Attendance
  attendance: {
    list: (filters?: { date?: string; employeeId?: string }) => {
      let query = supabase.from('attendance_records').select('*');
      if (filters?.date) query = query.eq('date', filters.date);
      if (filters?.employeeId) query = query.eq('employee_id', filters.employeeId);
      return query;
    },
    getById: (id: string) =>
      supabase.from('attendance_records').select('*').eq('id', id).single(),
    log: (employeeId: string, type: 'in' | 'out') => {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const timeIn = now.toISOString();

      if (type === 'in') {
        return supabase.from('attendance_records').insert([
          {
            employee_id: employeeId,
            date,
            time_in: timeIn,
            total_hours: 0,
            status: 'present',
          },
        ]);
      } else {
        // For time out, find today's record and update
        return supabase
          .from('attendance_records')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('date', date)
          .single()
          .then(({ data, error }) => {
            if (error) return { data: null, error };
            const timeInDate = new Date(data.time_in);
            const totalHours = (now.getTime() - timeInDate.getTime()) / (1000 * 60 * 60);
            return supabase
              .from('attendance_records')
              .update({ time_out: timeIn, total_hours: totalHours })
              .eq('id', data.id)
              .select()
              .single();
          });
      }
    },
    correctAttendance: (id: string, data: any) =>
      supabase
        .from('attendance_records')
        .update({
          is_correction_requested: true,
          correction_note: data.note,
        })
        .eq('id', id)
        .select()
        .single(),
  },

  // Payroll
  payroll: {
    list: (filters?: { period?: string; employeeId?: string }) => {
      let query = supabase.from('payroll_records').select('*');
      if (filters?.period) query = query.eq('period', filters.period);
      if (filters?.employeeId) query = query.eq('employee_id', filters.employeeId);
      return query;
    },
    getById: (id: string) =>
      supabase.from('payroll_records').select('*').eq('id', id).single(),
    create: (data: Database['public']['Tables']['payroll_records']['Insert']) =>
      supabase.from('payroll_records').insert([data]).select().single(),
    update: (id: string, data: Database['public']['Tables']['payroll_records']['Update']) =>
      supabase.from('payroll_records').update(data).eq('id', id).select().single(),
  },

  // Leave
  leave: {
    list: (filters?: { status?: string; employeeId?: string }) => {
      let query = supabase.from('leave_requests').select('*');
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.employeeId) query = query.eq('employee_id', filters.employeeId);
      return query;
    },
    getById: (id: string) =>
      supabase.from('leave_requests').select('*').eq('id', id).single(),
    submit: (data: Database['public']['Tables']['leave_requests']['Insert']) =>
      supabase.from('leave_requests').insert([data]).select().single(),
    updateStatus: (id: string, status: 'approved' | 'rejected', remarks?: string) =>
      supabase
        .from('leave_requests')
        .update({ status, remarks })
        .eq('id', id)
        .select()
        .single(),
  },

  // Audit
  audit: {
    list: (filters?: { userId?: string; action?: string; limit?: number }) => {
      let query = supabase.from('audit_logs').select('*');
      if (filters?.userId) query = query.eq('user_id', filters.userId);
      if (filters?.action) query = query.eq('action', filters.action);
      if (filters?.limit) query = query.limit(filters.limit);
      return query.order('timestamp', { ascending: false });
    },
    log: (data: Database['public']['Tables']['audit_logs']['Insert']) =>
      supabase.from('audit_logs').insert([data]),
  },

  // Notifications
  notifications: {
    list: (userId: string, unreadOnly?: boolean) => {
      let query = supabase.from('notifications').select('*').eq('user_id', userId);
      if (unreadOnly) query = query.eq('is_read', false);
      return query.order('created_at', { ascending: false });
    },
    markAsRead: (notificationId: string) =>
      supabase.from('notifications').update({ is_read: true }).eq('id', notificationId),
    markAllAsRead: (userId: string) =>
      supabase.from('notifications').update({ is_read: true }).eq('user_id', userId),
  },
};
