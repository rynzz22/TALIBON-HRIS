/**
 * Client-side form validation utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (Philippine format)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(?:\+63|0)?(?:9)\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

// SSS/TIN/etc format validation
export const isValidSSS = (sss: string): boolean => /^\d{2}-\d{7}-\d$/.test(sss);
export const isValidTIN = (tin: string): boolean => /^\d{3}-\d{3}-\d{3}-\d{3}$/.test(tin);
export const isValidPhilHealth = (philhealth: string): boolean => /^\d{12}$/.test(philhealth);

// Salary validation
export const isValidSalary = (salary: number): boolean => {
  return salary >= 0 && Number.isFinite(salary);
};

// Date validation
export const isValidDate = (date: string): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const isDateInPast = (date: string): boolean => {
  return new Date(date) < new Date();
};

export const isDateInFuture = (date: string): boolean => {
  return new Date(date) > new Date();
};

// Date range validation
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  return new Date(startDate) < new Date(endDate);
};

// Employee validation
export interface EmployeeFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  position?: string;
  department?: string;
  salary?: number;
  hireDate?: string;
  employmentStatus?: string;
  govIds?: {
    sss?: string;
    philhealth?: string;
    pagibig?: string;
    tin?: string;
  };
}

export const validateEmployeeForm = (data: EmployeeFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!data.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!data.position?.trim()) {
    errors.push({ field: 'position', message: 'Position is required' });
  }

  if (!data.department?.trim()) {
    errors.push({ field: 'department', message: 'Department is required' });
  }

  if (data.salary === undefined || data.salary === null) {
    errors.push({ field: 'salary', message: 'Salary is required' });
  } else if (!isValidSalary(data.salary)) {
    errors.push({ field: 'salary', message: 'Salary must be a positive number' });
  }

  if (!data.hireDate?.trim()) {
    errors.push({ field: 'hireDate', message: 'Hire date is required' });
  } else if (!isValidDate(data.hireDate)) {
    errors.push({ field: 'hireDate', message: 'Invalid date format' });
  }

  if (!data.employmentStatus?.trim()) {
    errors.push({ field: 'employmentStatus', message: 'Employment status is required' });
  }

  // Optional government IDs with format validation
  if (data.govIds?.sss && !isValidSSS(data.govIds.sss)) {
    errors.push({ field: 'govIds.sss', message: 'Invalid SSS format (XX-XXXXXXX-X)' });
  }

  if (data.govIds?.tin && !isValidTIN(data.govIds.tin)) {
    errors.push({ field: 'govIds.tin', message: 'Invalid TIN format (XXX-XXX-XXX-XXX)' });
  }

  if (data.govIds?.philhealth && !isValidPhilHealth(data.govIds.philhealth)) {
    errors.push({ field: 'govIds.philhealth', message: 'Invalid PhilHealth format (12 digits)' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Leave request validation
export interface LeaveFormData {
  type?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export const validateLeaveForm = (data: LeaveFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.type?.trim()) {
    errors.push({ field: 'type', message: 'Leave type is required' });
  }

  if (!data.startDate?.trim()) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  } else if (!isValidDate(data.startDate)) {
    errors.push({ field: 'startDate', message: 'Invalid date format' });
  }

  if (!data.endDate?.trim()) {
    errors.push({ field: 'endDate', message: 'End date is required' });
  } else if (!isValidDate(data.endDate)) {
    errors.push({ field: 'endDate', message: 'Invalid date format' });
  }

  if (data.startDate && data.endDate) {
    if (!isValidDateRange(data.startDate, data.endDate)) {
      errors.push({
        field: 'dateRange',
        message: 'End date must be after start date',
      });
    }
  }

  if (!data.reason?.trim()) {
    errors.push({ field: 'reason', message: 'Reason is required' });
  } else if (data.reason.length < 5) {
    errors.push({ field: 'reason', message: 'Reason must be at least 5 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Payroll validation
export interface PayrollFormData {
  period?: string;
  basicSalary?: number;
  overtimePay?: number;
  deductions?: number;
}

export const validatePayrollForm = (data: PayrollFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.period?.trim()) {
    errors.push({ field: 'period', message: 'Period is required' });
  }

  if (data.basicSalary === undefined || data.basicSalary === null) {
    errors.push({ field: 'basicSalary', message: 'Basic salary is required' });
  } else if (!isValidSalary(data.basicSalary)) {
    errors.push({ field: 'basicSalary', message: 'Basic salary must be a positive number' });
  }

  if (data.overtimePay !== undefined && data.overtimePay < 0) {
    errors.push({ field: 'overtimePay', message: 'Overtime pay cannot be negative' });
  }

  if (data.deductions !== undefined && data.deductions < 0) {
    errors.push({ field: 'deductions', message: 'Deductions cannot be negative' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Utility to get error message for a field
export const getFieldError = (field: string, errors: ValidationError[]): string | null => {
  return errors.find((e) => e.field === field)?.message || null;
};

// Utility to check if a field has errors
export const hasFieldError = (field: string, errors: ValidationError[]): boolean => {
  return errors.some((e) => e.field === field);
};
