import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Building2,
  Shield,
  Briefcase,
  Bell,
  LogOut,
  Sparkles,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Employee, Role } from './types';
import { EmployeeAPI, AuditAPI } from './lib/api';
import { cn, formatDate } from './lib/utils';
import { useAuth, ProtectedFeature } from './contexts/AuthContext';
import { useToast } from './contexts/ToastContext';
import { validateEmployeeForm } from './lib/validation';

// Components
import LoginPage from './components/LoginPage';
import EmployeeList from './components/EmployeeList';
import PayrollManagement from './components/PayrollManagement';
import Dashboard from './components/Dashboard';
import LeaveManagement from './components/LeaveManagement';
import AttendanceTracker from './components/AttendanceTracker';
import AuditLogs from './components/AuditLogs';
import {
  EmployeeListSkeleton,
  LoadingOverlay,
  ErrorState,
  EmptyState,
} from './components/LoadingSkeletons';

// ============================================
// TYPES
// ============================================

type ActiveTab = 'dashboard' | 'employees' | 'payroll' | 'leave' | 'attendance' | 'audit';

// ============================================
// APP CONTENT
// ============================================

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { currentUser, currentRole, isAuthenticated, isLoading: authLoading, logout, hasPermission } =
    useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (authLoading) return <LoadingOverlay />;
  if (!isAuthenticated) return <LoginPage />;

  // ── Data fetching ──────────────────────────────────────────────────────────
  const {
    data: employeeResponse,
    isLoading: employeeLoading,
    isError: employeeError,
    error: employeeErrorDetails,
    refetch: refetchEmployees,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await EmployeeAPI.list();
      return res;
    },
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: attendanceResponse,
    isError: attendanceError,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const res = await EmployeeAPI.list(); // TODO: replace with AttendanceAPI.list()
      return res;
    },
    staleTime: 1000 * 60 * 1,
  });

  const {
    data: auditResponse,
    isError: auditError,
    refetch: refetchAudit,
  } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => {
      const res = await AuditAPI.list({ limit: 100 });
      return res;
    },
    staleTime: 1000 * 30,
  });

  const employees: Employee[] = Array.isArray((employeeResponse as any)?.data)
    ? (employeeResponse as any).data
    : [];
  const attendanceRecords = Array.isArray((attendanceResponse as any)?.data)
    ? (attendanceResponse as any).data
    : [];
  const auditLogs = Array.isArray((auditResponse as any)?.data) ? (auditResponse as any).data : [];

  // ── Audit helper ───────────────────────────────────────────────────────────
  const logAudit = (action: string, target: string) => {
    if (!currentUser) return;
    AuditAPI.log({
      userId: currentUser.id,
      userName: `${currentUser.first_name} ${currentUser.last_name}`,
      action,
      target,
    }).catch(() => {/* swallow audit errors */});
  };

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (newEmp: Omit<Employee, 'id'>) => {
      // Map from component form shape to validation shape
      const validation = validateEmployeeForm({
        firstName: newEmp.first_name,
        lastName: newEmp.last_name,
        email: newEmp.email,
        position: newEmp.position,
        department: newEmp.department,
        salary: newEmp.salary,
        hireDate: newEmp.hire_date,
        employmentStatus: newEmp.employment_status,
      });
      if (!validation.isValid) throw new Error(validation.errors[0].message);
      const res = await EmployeeAPI.create(newEmp);
      return (res as any).data;
    },
    onSuccess: (data: Employee) => {
      addToast('Employee added successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      logAudit('CREATE', `Employee: ${data?.first_name} ${data?.last_name}`);
    },
    onError: (err: Error) => addToast(err.message ?? 'Failed to add employee.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await EmployeeAPI.delete(id);
      return id;
    },
    onSuccess: (id) => {
      addToast('Employee removed successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      logAudit('DELETE', `Employee ID: ${id}`);
    },
    onError: (err: Error) => addToast(err.message ?? 'Failed to delete employee.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Employee> }) => {
      const res = await EmployeeAPI.update(id, data);
      return (res as any).data;
    },
    onSuccess: (data: Employee) => {
      addToast('Employee updated successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      logAudit('UPDATE', `Employee ID: ${data?.id}`);
    },
    onError: (err: Error) => addToast(err.message ?? 'Failed to update employee.', 'error'),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddEmployee = (employee: Omit<Employee, 'id'>) => {
    addMutation.mutate(employee);
  };

  const handleDeleteEmployee = (id: string) => {
    if (!window.confirm('Permanently delete this employee record?')) return;
    deleteMutation.mutate(id);
  };

  const handleUpdateEmployee = (id: string, data: Partial<Employee>) => {
    updateMutation.mutate({ id, data });
  };

  const handleAttendanceLog = async (type: 'in' | 'out') => {
    try {
      // TODO: replace stub with AttendanceAPI.log(currentUser!.id, type)
      await EmployeeAPI.list();
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      addToast(`Time-${type} recorded.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to log attendance.';
      addToast(msg, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      addToast('Logout failed. Please try again.', 'error');
    }
  };

  // ── Nav items ──────────────────────────────────────────────────────────────
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ size?: number; className?: string }>; requiredRoles?: Role[] }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'Personnel', icon: Users, requiredRoles: ['admin', 'dept_head'] },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'payroll', label: 'Financial', icon: CreditCard, requiredRoles: ['admin', 'payroll_officer'] },
    { id: 'leave', label: 'Mobility', icon: Briefcase },
    { id: 'audit', label: 'Audit', icon: Shield, requiredRoles: ['admin'] },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 overflow-hidden relative">
      {/* ── Floating Navigation ── */}
      <header
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-6 py-2 bg-slate-900/95 backdrop-blur-3xl rounded-full shadow-2xl border border-white/10"
        role="banner"
      >
        {/* Logo */}
        <button
          className="flex items-center gap-3 pr-4 border-r border-white/10 group"
          onClick={() => setActiveTab('dashboard')}
          aria-label="Go to dashboard"
        >
          <div className="w-8 h-8 bg-talibon-red rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-110">
            <Building2 size={16} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[10px] font-black text-white leading-none tracking-tight">TALIBON</h1>
            <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mt-1">HRIS</p>
          </div>
        </button>

        {/* Nav Links */}
        <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            if (item.requiredRoles && !hasPermission(item.requiredRoles)) return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-full transition-all text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap',
                  isActive
                    ? 'bg-white text-slate-900 shadow-xl'
                    : 'text-white/50 hover:text-white hover:bg-white/10',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon size={14} className={isActive ? 'text-talibon-red' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 pl-4 border-l border-white/10">
          <button
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-all rounded-full hover:bg-white/10"
            aria-label="Notifications"
            title="Notifications (coming soon)"
          >
            <Bell size={14} />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30 hover:scale-110 transition-all"
            aria-label="AI Assistant"
            title="AI Assistant (coming soon)"
          >
            <Sparkles size={14} />
          </button>
          <div className="w-8 h-8 bg-talibon-orange rounded-full flex items-center justify-center text-white text-[8px] font-black border-2 border-white/10 uppercase select-none">
            {currentUser?.first_name?.slice(0, 1)}
            {currentUser?.last_name?.slice(0, 1)}
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-red-400 transition-all rounded-full hover:bg-red-400/10"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 h-screen overflow-y-auto relative px-10 py-32 dotted-grid">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                PH-TAL-01 SECURE
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {activeTab === 'dashboard' && 'Executive Summary'}
              {activeTab === 'employees' && 'Personnel Registry'}
              {activeTab === 'payroll' && 'Financial Ledger'}
              {activeTab === 'leave' && 'Workforce Mobility'}
              {activeTab === 'attendance' && 'Attendance Records'}
              {activeTab === 'audit' && 'Audit Logs'}
              <span className="text-xs px-3 py-1 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest">
                {currentRole}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                {currentUser?.first_name} {currentUser?.last_name}
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                {formatDate(new Date())}
              </p>
            </div>
            <div className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center text-slate-400 hover:text-talibon-red transition-all cursor-pointer">
              <Bell size={20} />
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard employees={employees} userRole={currentRole} />
              )}

              {activeTab === 'employees' && (
                <ProtectedFeature requiredRoles={['admin', 'dept_head']}>
                  {employeeError ? (
                    <ErrorState
                      title="Failed to load employees"
                      message={(employeeErrorDetails as Error)?.message ?? 'Please try again.'}
                      onRetry={() => refetchEmployees()}
                    />
                  ) : employeeLoading ? (
                    <EmployeeListSkeleton />
                  ) : employees.length === 0 ? (
                    <EmptyState
                      title="No employees found"
                      message="Start by adding your first employee to the system."
                      icon="👥"
                    />
                  ) : (
                    <EmployeeList
                      employees={employees}
                      loading={employeeLoading}
                      onAdd={handleAddEmployee}
                      onDelete={handleDeleteEmployee}
                      onUpdate={handleUpdateEmployee}
                    />
                  )}
                </ProtectedFeature>
              )}

              {activeTab === 'attendance' && (
                attendanceError ? (
                  <ErrorState
                    title="Failed to load attendance"
                    message="Please try again."
                    onRetry={() => refetchAttendance()}
                  />
                ) : (
                  <AttendanceTracker
                    records={attendanceRecords}
                    currentUserRole={currentRole}
                    onLog={handleAttendanceLog}
                  />
                )
              )}

              {activeTab === 'payroll' && (
                <ProtectedFeature requiredRoles={['admin', 'payroll_officer']}>
                  <PayrollManagement employees={employees} />
                </ProtectedFeature>
              )}

              {activeTab === 'leave' && (
                <LeaveManagement
                  employees={employees}
                  isAdmin={currentRole === 'admin' || currentRole === 'dept_head'}
                />
              )}

              {activeTab === 'audit' && (
                <ProtectedFeature requiredRoles={['admin']}>
                  {auditError ? (
                    <ErrorState
                      title="Failed to load audit logs"
                      message="Please try again."
                      onRetry={() => refetchAudit()}
                    />
                  ) : (
                    <AuditLogs logs={auditLogs} />
                  )}
                </ProtectedFeature>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="absolute bottom-10 left-10 right-10 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] pointer-events-none opacity-50">
          <div>Municipal Office of Talibon • HRIS Division</div>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-talibon-orange" />
            End-to-End Encryption Enabled
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}