export type Role = 'admin' | 'dept_head' | 'employee' | 'payroll_officer';
export type EmploymentStatus = 'Regular' | 'Casual' | 'Contractual';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: Department;
  position: string;
  salary: number;
  hire_date: string;
  role: Role;
  status: 'active' | 'inactive';
  employment_status: EmploymentStatus;
  sss?: string;
  philhealth?: string;
  pagibig?: string;
  tin?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD
  time_in: string; // ISO
  time_out?: string; // ISO
  total_hours: number;
  status: 'present' | 'late' | 'absent' | 'undertime';
  is_correction_requested?: boolean;
  correction_note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  period: string; // YYYY-MM
  basic_salary: number;
  hazard_allowance?: number;
  bonus_allowance?: number;
  other_allowance?: number;
  sss_deduction: number;
  philhealth_deduction: number;
  pagibig_deduction: number;
  tax_deduction: number;
  late_penalty: number;
  overtime_pay: number;
  gross_pay: number;
  net_pay: number;
  status: 'pending' | 'approved' | 'paid';
  processed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  type: 'Vacation' | 'Sick' | 'Maternity' | 'Paternity' | 'Emergency';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  target: string;
  timestamp: string;
  created_at?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export const DEPARTMENTS = [
  'Administrative',
  'Health Services',
  'Public Safety',
  'Engineering',
  'Agriculture',
  'Tourism',
  'Social Welfare',
  'Planning & Development'
] as const;

export type Department = (typeof DEPARTMENTS)[number];
