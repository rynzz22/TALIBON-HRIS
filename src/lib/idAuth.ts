import { supabase } from './supabase';
import type { Employee } from '../types';

export interface IDAuthCredentials {
  idNumber: string;
  idType: 'SSS' | 'PhilHealth' | 'Pag-IBIG' | 'TIN' | 'Driver License' | 'Passport';
}

export const IDAuthService = {
  /**
   * Authenticate user by ID number and type
   * Returns employee record if found and active
   */
  authenticate: async (credentials: IDAuthCredentials): Promise<{ employee: Employee; error: null } | { employee: null; error: string }> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id_number', credentials.idNumber)
        .eq('id_type', credentials.idType)
        .eq('status', 'active')
        .single();

      if (error) {
        return { employee: null, error: 'Invalid ID or not found' };
      }

      if (!data) {
        return { employee: null, error: 'Employee not found' };
      }

      return { employee: data as Employee, error: null };
    } catch (err) {
      return { employee: null, error: 'Authentication failed' };
    }
  },

  /**
   * Verify ID exists in system
   */
  verifyID: async (idNumber: string, idType: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('id_number', idNumber)
        .eq('id_type', idType)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  },

  /**
   * Get employee by ID number
   */
  getEmployeeByID: async (idNumber: string, idType: string): Promise<Employee | null> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id_number', idNumber)
        .eq('id_type', idType)
        .single();

      if (error || !data) return null;
      return data as Employee;
    } catch {
      return null;
    }
  },

  /**
   * Log authentication attempt
   */
  logAuthAttempt: async (idNumber: string, success: boolean, reason?: string) => {
    try {
      await supabase.from('audit_logs').insert([
        {
          user_id: idNumber,
          user_name: 'ID Auth Attempt',
          action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
          target: `ID: ${idNumber}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to log auth attempt:', err);
    }
  },
};
