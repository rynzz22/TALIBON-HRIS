/**
 * Unit tests for form validation utilities
 * Run with: npm test validation.test.ts
 */

import {
  isValidEmail,
  isValidPhoneNumber,
  isValidSSS,
  isValidTIN,
  isValidSalary,
  isValidDate,
  validateEmployeeForm,
  validateLeaveForm,
  validatePayrollForm,
  getFieldError,
} from '../lib/validation';

describe('Email Validation', () => {
  test('should validate correct email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.email@company.co.uk')).toBe(true);
  });

  test('should reject invalid email', () => {
    expect(isValidEmail('invalid.email')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('Phone Number Validation', () => {
  test('should validate correct Philippine phone numbers', () => {
    expect(isValidPhoneNumber('09123456789')).toBe(true);
    expect(isValidPhoneNumber('+639123456789')).toBe(true);
    expect(isValidPhoneNumber('9123456789')).toBe(true);
  });

  test('should reject invalid phone numbers', () => {
    expect(isValidPhoneNumber('1234567')).toBe(false);
    expect(isValidPhoneNumber('08123456789')).toBe(false);
  });
});

describe('Government ID Validation', () => {
  test('should validate SSS format', () => {
    expect(isValidSSS('12-3456789-0')).toBe(true);
    expect(isValidSSS('1-2345678-0')).toBe(false);
  });

  test('should validate TIN format', () => {
    expect(isValidTIN('123-456-789-000')).toBe(true);
    expect(isValidTIN('123-456-789')).toBe(false);
  });
});

describe('Salary Validation', () => {
  test('should validate positive salary', () => {
    expect(isValidSalary(25000)).toBe(true);
    expect(isValidSalary(0)).toBe(true);
  });

  test('should reject negative salary', () => {
    expect(isValidSalary(-5000)).toBe(false);
    expect(isValidSalary(NaN)).toBe(false);
  });
});

describe('Date Validation', () => {
  test('should validate correct date format', () => {
    expect(isValidDate('2024-04-23')).toBe(true);
    expect(isValidDate('2024-12-31')).toBe(true);
  });

  test('should reject invalid date format', () => {
    expect(isValidDate('invalid-date')).toBe(false);
    expect(isValidDate('04-23-2024')).toBe(false);
  });
});

describe('Employee Form Validation', () => {
  test('should validate complete employee data', () => {
    const result = validateEmployeeForm({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      position: 'Developer',
      department: 'IT',
      salary: 50000,
      hireDate: '2024-01-01',
      employmentStatus: 'Regular',
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject incomplete employee data', () => {
    const result = validateEmployeeForm({
      firstName: 'John',
      // missing other required fields
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(getFieldError('lastName', result.errors)).toBeTruthy();
  });

  test('should validate government IDs', () => {
    const result = validateEmployeeForm({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      position: 'Developer',
      department: 'IT',
      salary: 50000,
      hireDate: '2024-01-01',
      employmentStatus: 'Regular',
      govIds: {
        sss: 'invalid-format',
      },
    });

    expect(result.isValid).toBe(false);
    expect(getFieldError('govIds.sss', result.errors)).toBeTruthy();
  });
});

describe('Leave Form Validation', () => {
  test('should validate complete leave data', () => {
    const result = validateLeaveForm({
      type: 'Vacation',
      startDate: '2024-05-01',
      endDate: '2024-05-05',
      reason: 'Family vacation time',
    });

    expect(result.isValid).toBe(true);
  });

  test('should reject invalid date range', () => {
    const result = validateLeaveForm({
      type: 'Vacation',
      startDate: '2024-05-05',
      endDate: '2024-05-01', // End date before start date
      reason: 'Family vacation time',
    });

    expect(result.isValid).toBe(false);
    expect(getFieldError('dateRange', result.errors)).toBeTruthy();
  });

  test('should validate reason length', () => {
    const result = validateLeaveForm({
      type: 'Vacation',
      startDate: '2024-05-01',
      endDate: '2024-05-05',
      reason: 'Sick', // Too short
    });

    expect(result.isValid).toBe(false);
  });
});

describe('Payroll Form Validation', () => {
  test('should validate complete payroll data', () => {
    const result = validatePayrollForm({
      period: '2024-04',
      basicSalary: 50000,
      overtimePay: 5000,
      deductions: 2000,
    });

    expect(result.isValid).toBe(true);
  });

  test('should reject negative values', () => {
    const result = validatePayrollForm({
      period: '2024-04',
      basicSalary: 50000,
      overtimePay: -5000, // Invalid
      deductions: -2000, // Invalid
    });

    expect(result.isValid).toBe(false);
  });
});
