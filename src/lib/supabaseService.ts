import { supabase } from './supabase';
import type { Database } from './database.types';

type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];
type PayrollInsert = Database['public']['Tables']['payroll_records']['Insert'];
type PayrollUpdate = Database['public']['Tables']['payroll_records']['Update'];
type LeaveInsert = Database['public']['Tables']['leave_requests']['Insert'];
type AuditInsert = Database['public']['Tables']['audit_logs']['Insert'];

export const SupabaseService = {
  // ── Auth ───────────────────────────────────────────────────────────────────
  auth: {
    login: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),

    logout: () => supabase.auth.signOut(),

    getCurrentUser: () => supabase.auth.getUser(),

    onAuthStateChange: (callback: (user: unknown) => void) =>
      supabase.auth.onAuthStateChange((_, session) => callback(session?.user ?? null)),
  },

  // ── Employees ─────────────────────────────────────────────────────────────
  employees: {
    list: () =>
      supabase.from('employees').select('*').order('created_at', { ascending: false }),

    getById: (id: string) =>
      supabase.from('employees').select('*').eq('id', id).single(),

    create: (data: EmployeeInsert) =>
      supabase.from('employees').insert([data]).select().single(),

    update: (id: string, data: EmployeeUpdate) =>
      supabase.from('employees').update(data).eq('id', id).select().single(),

    delete: (id: string) =>
      supabase.from('employees').delete().eq('id', id),
  },

  // ── Attendance ────────────────────────────────────────────────────────────
  attendance: {
    list: (filters?: { date?: string; employee_id?: string }) => {
      let q = supabase.from('attendance_records').select('*');
      if (filters?.date) q = q.eq('date', filters.date);
      if (filters?.employee_id) q = q.eq('employee_id', filters.employee_id);
      return q.order('date', { ascending: false });
    },

    getById: (id: string) =>
      supabase.from('attendance_records').select('*').eq('id', id).single(),

    logIn: (employee_id: string) => {
      const now = new Date();
      return supabase.from('attendance_records').insert([{
        employee_id,
        date: now.toISOString().split('T')[0],
        time_in: now.toISOString(),
        total_hours: 0,
        status: 'present' as const,
      }]).select().single();
    },

    logOut: async (employee_id: string) => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('date', today)
        .is('time_out', null)
        .single();
      if (error || !data) return { data: null, error: error ?? new Error('No open record') };
      const totalHours = (now.getTime() - new Date(data.time_in).getTime()) / 3_600_000;
      return supabase
        .from('attendance_records')
        .update({ time_out: now.toISOString(), total_hours: parseFloat(totalHours.toFixed(2)) })
        .eq('id', data.id)
        .select()
        .single();
    },

    requestCorrection: (id: string, note: string) =>
      supabase
        .from('attendance_records')
        .update({ is_correction_requested: true, correction_note: note })
        .eq('id', id)
        .select()
        .single(),
  },

  // ── Payroll ───────────────────────────────────────────────────────────────
  payroll: {
    list: (filters?: { period?: string; employee_id?: string }) => {
      let q = supabase.from('payroll_records').select('*');
      if (filters?.period) q = q.eq('period', filters.period);
      if (filters?.employee_id) q = q.eq('employee_id', filters.employee_id);
      return q.order('created_at', { ascending: false });
    },

    getById: (id: string) =>
      supabase.from('payroll_records').select('*').eq('id', id).single(),

    create: (data: PayrollInsert) =>
      supabase.from('payroll_records').insert([data]).select().single(),

    update: (id: string, data: PayrollUpdate) =>
      supabase.from('payroll_records').update(data).eq('id', id).select().single(),
  },

  // ── Leave ─────────────────────────────────────────────────────────────────
  leave: {
    list: (filters?: { status?: string; employee_id?: string }) => {
      let q = supabase.from('leave_requests').select('*');
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.employee_id) q = q.eq('employee_id', filters.employee_id);
      return q.order('requested_at', { ascending: false });
    },

    getById: (id: string) =>
      supabase.from('leave_requests').select('*').eq('id', id).single(),

    submit: (data: LeaveInsert) =>
      supabase.from('leave_requests').insert([data]).select().single(),

    updateStatus: (id: string, status: 'approved' | 'rejected', remarks?: string) =>
      supabase
        .from('leave_requests')
        .update({ status, ...(remarks ? { remarks } : {}) })
        .eq('id', id)
        .select()
        .single(),
  },

  // ── Audit ─────────────────────────────────────────────────────────────────
  audit: {
    list: (filters?: { user_id?: string; action?: string; limit?: number }) => {
      let q = supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
      if (filters?.user_id) q = q.eq('user_id', filters.user_id);
      if (filters?.action) q = q.eq('action', filters.action);
      if (filters?.limit) q = q.limit(filters.limit);
      return q;
    },

    log: (data: AuditInsert) =>
      supabase.from('audit_logs').insert([data]),
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    list: (user_id: string, unreadOnly?: boolean) => {
      let q = supabase.from('notifications').select('*').eq('user_id', user_id);
      if (unreadOnly) q = q.eq('is_read', false);
      return q.order('created_at', { ascending: false });
    },

    markAsRead: (id: string) =>
      supabase.from('notifications').update({ is_read: true }).eq('id', id),

    markAllAsRead: (user_id: string) =>
      supabase.from('notifications').update({ is_read: true }).eq('user_id', user_id),
  },
};