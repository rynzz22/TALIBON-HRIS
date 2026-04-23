# Supabase Integration Setup

This guide walks you through setting up Supabase for the TALIBON HRIS project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Copy your **Project URL** and **Anon Key** from Settings > API

## 2. Set Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 3. Create Database Tables

Run these SQL queries in Supabase SQL Editor:

### Employees Table
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  salary DECIMAL(12, 2) NOT NULL,
  hire_date DATE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dept_head', 'employee', 'payroll_officer')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  employment_status TEXT NOT NULL CHECK (employment_status IN ('Regular', 'Casual', 'Contractual')),
  sss TEXT,
  philhealth TEXT,
  pagibig TEXT,
  tin TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Attendance Records Table
```sql
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_in TIMESTAMP NOT NULL,
  time_out TIMESTAMP,
  total_hours DECIMAL(5, 2) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('present', 'late', 'absent', 'undertime')),
  is_correction_requested BOOLEAN DEFAULT FALSE,
  correction_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
```

### Payroll Records Table
```sql
CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  basic_salary DECIMAL(12, 2) NOT NULL,
  hazard_allowance DECIMAL(12, 2),
  bonus_allowance DECIMAL(12, 2),
  other_allowance DECIMAL(12, 2),
  sss_deduction DECIMAL(12, 2) NOT NULL,
  philhealth_deduction DECIMAL(12, 2) NOT NULL,
  pagibig_deduction DECIMAL(12, 2) NOT NULL,
  tax_deduction DECIMAL(12, 2) NOT NULL,
  late_penalty DECIMAL(12, 2) DEFAULT 0,
  overtime_pay DECIMAL(12, 2) DEFAULT 0,
  gross_pay DECIMAL(12, 2) NOT NULL,
  net_pay DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'paid')),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payroll_employee_period ON payroll_records(employee_id, period);
```

### Leave Requests Table
```sql
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Vacation', 'Sick', 'Maternity', 'Paternity', 'Emergency')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP DEFAULT NOW(),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leave_employee_status ON leave_requests(employee_id, status);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user_timestamp ON audit_logs(user_id, timestamp);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

## 4. Set Up Row Level Security (RLS)

Enable RLS on all tables:

```sql
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

## 5. Update Components to Use Supabase

Replace API calls with `SupabaseService`:

```typescript
// Old
import { EmployeeAPI } from '../lib/api';
const employees = await EmployeeAPI.list();

// New
import { SupabaseService } from '../lib/supabaseService';
const { data: employees } = await SupabaseService.employees.list();
```

## 6. Install Dependencies

```bash
npm install --legacy-peer-deps
```

## 7. Start Development

```bash
npm run dev
```

## Testing with Real Data

1. Add test employees via Supabase dashboard
2. Log in with test credentials
3. Test CRUD operations on all modules

## Troubleshooting

- **Missing env variables**: Check `.env` file has correct Supabase credentials
- **Auth errors**: Ensure Supabase Auth is enabled in project settings
- **RLS errors**: Check row-level security policies allow your operations
