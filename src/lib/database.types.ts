export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          department: string;
          position: string;
          salary: number;
          hire_date: string;
          role: 'admin' | 'dept_head' | 'employee' | 'payroll_officer';
          status: 'active' | 'inactive';
          employment_status: 'Regular' | 'Casual' | 'Contractual';
          sss: string | null;
          philhealth: string | null;
          pagibig: string | null;
          tin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employees']['Insert']>;
      };
      attendance_records: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          time_in: string;
          time_out: string | null;
          total_hours: number;
          status: 'present' | 'late' | 'absent' | 'undertime';
          is_correction_requested: boolean;
          correction_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attendance_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['attendance_records']['Insert']>;
      };
      payroll_records: {
        Row: {
          id: string;
          employee_id: string;
          period: string;
          basic_salary: number;
          hazard_allowance: number | null;
          bonus_allowance: number | null;
          other_allowance: number | null;
          sss_deduction: number;
          philhealth_deduction: number;
          pagibig_deduction: number;
          tax_deduction: number;
          late_penalty: number;
          overtime_pay: number;
          gross_pay: number;
          net_pay: number;
          status: 'pending' | 'approved' | 'paid';
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payroll_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payroll_records']['Insert']>;
      };
      leave_requests: {
        Row: {
          id: string;
          employee_id: string;
          type: 'Vacation' | 'Sick' | 'Maternity' | 'Paternity' | 'Emergency';
          start_date: string;
          end_date: string;
          reason: string;
          status: 'pending' | 'approved' | 'rejected';
          requested_at: string;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leave_requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leave_requests']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          user_name: string;
          action: string;
          target: string;
          timestamp: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
  };
};
