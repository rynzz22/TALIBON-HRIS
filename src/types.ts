export type Role = 'admin' | 'dept_head' | 'employee' | 'payroll_officer';
export type EmploymentStatus = 'Regular' | 'Casual' | 'Contractual';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: Department;
  position: string;
  salary: number;
  hireDate: string;
  role: Role;
  status: 'active' | 'inactive';
  employmentStatus: EmploymentStatus;
  govIds: {
    sss?: string;
    philhealth?: string;
    pagibig?: string;
    tin?: string;
  };
  leaveBalances: {
    vacation: number;
    sick: number;
    emergency: number;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  timeIn: string; // ISO
  timeOut?: string; // ISO
  totalHours: number;
  status: 'present' | 'late' | 'absent' | 'undertime';
  isCorrectionRequested?: boolean;
  correctionNote?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  period: string; // YYYY-MM
  basicSalary: number;
  allowances: {
    hazard?: number;
    bonus?: number;
    other?: number;
  };
  deductions: {
    sss: number;
    philhealth: number;
    pagibig: number;
    tax: number;
    latePenalty: number;
  };
  overtimePay: number;
  grossPay: number;
  netPay: number;
  status: 'pending' | 'approved' | 'paid';
  processedAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Vacation' | 'Sick' | 'Maternity' | 'Paternity' | 'Emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
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
