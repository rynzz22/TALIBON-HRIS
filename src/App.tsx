import { useState } from 'react';
import { 
  LayoutDashboard, Users, CreditCard, Building2, 
  Shield, Briefcase, Bell, LogOut, Sparkles, Clock
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
import { EmployeeListSkeleton, LoadingOverlay, ErrorState, EmptyState } from './components/LoadingSkeletons';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'payroll' | 'leave' | 'attendance' | 'audit'>('dashboard');
  const { currentUser, currentRole, isAuthenticated, logout, hasPermission } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Enterprise Data Orchestration with error handling
  const { 
    data: employeeResponse, 
    isLoading: employeeLoading,
    isError: employeeError,
    error: employeeErrorDetails,
    refetch: refetchEmployees
  } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await EmployeeAPI.list();
      return response;
    },
    retry: 2,
  });

  const { 
    data: attendanceResponse,
    isError: attendanceError,
    refetch: refetchAttendance
  } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const response = await EmployeeAPI.list();
      return response;
    },
  });

  const { 
    data: auditResponse,
    isError: auditError,
    refetch: refetchAudit
  } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => {
      const response = await AuditAPI.list();
      return response;
    },
  });

  const employees = Array.isArray(employeeResponse?.data) ? employeeResponse.data : [];
  const attendanceRecords = Array.isArray(attendanceResponse?.data) ? attendanceResponse.data : [];
  const auditLogs = Array.isArray(auditResponse?.data) ? auditResponse.data : [];

  // Mutations with error handling and toast notifications
  const addMutation = useMutation({
    mutationFn: async (newEmp: any) => {
      const validation = validateEmployeeForm(newEmp);
      if (!validation.isValid) {
        throw new Error(validation.errors[0].message);
      }
      const response = await EmployeeAPI.create(newEmp);
      return response.data;
    },
    onSuccess: () => {
      addToast('Employee added successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      AuditAPI.log({
        userId: currentUser?.id || 'system',
        userName: `${currentUser?.first_name} ${currentUser?.last_name}`,
        action: 'CREATE',
        target: 'Employee',
      });
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to add employee', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await EmployeeAPI.delete(id);
      return id;
    },
    onSuccess: (_, employeeId) => {
      addToast('Employee deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      AuditAPI.log({
        userId: currentUser?.id || 'system',
        userName: `${currentUser?.first_name} ${currentUser?.last_name}`,
        action: 'DELETE',
        target: `Employee ${employeeId}`,
      });
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to delete employee', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await EmployeeAPI.update(id, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      addToast('Employee updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      AuditAPI.log({
        userId: currentUser?.id || 'system',
        userName: `${currentUser?.first_name} ${currentUser?.last_name}`,
        action: 'UPDATE',
        target: `Employee ${id}`,
      });
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to update employee', 'error');
    },
  });

  const handleAddEmployee = async (employee: Omit<Employee, 'id'>) => {
    addMutation.mutate({ ...employee, role: 'employee' });
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    deleteMutation.mutate(id);
  };

  const handleUpdateEmployee = async (id: string, data: Partial<Employee>) => {
    updateMutation.mutate({ id, data });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      addToast('Logout failed', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 overflow-hidden relative">
      {/* Floating Global Navigation */}
      <header 
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-6 py-2 bg-slate-900/95 backdrop-blur-3xl rounded-full shadow-2xl border border-white/10 shadow-black/40"
        role="banner"
      >
        <div 
          className="flex items-center gap-3 pr-4 border-r border-white/10 group cursor-pointer" 
          onClick={() => setActiveTab('dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('dashboard')}
          aria-label="Go to dashboard"
        >
          <div className="w-8 h-8 bg-talibon-red rounded-lg flex items-center justify-center text-white relative overflow-hidden transition-transform group-hover:scale-110">
            <Building2 size={16} className="relative z-10" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[10px] font-black text-white leading-none tracking-tight">TALIBON</h1>
            <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mt-1">HRIS</p>
          </div>
        </div>

        <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { 
              id: 'employees', 
              label: 'Personnel', 
              icon: Users, 
              requiredRoles: ['admin', 'dept_head']
            },
            { id: 'attendance', label: 'Attendance', icon: Clock },
            { 
              id: 'payroll', 
              label: 'Financial', 
              icon: CreditCard, 
              requiredRoles: ['admin', 'payroll_officer']
            },
            { id: 'leave', label: 'Mobility', icon: Briefcase },
            { 
              id: 'audit', 
              label: 'Audit', 
              icon: Shield, 
              requiredRoles: ['admin']
            },
          ].map((item) => (
            (!item.requiredRoles || hasPermission(item.requiredRoles as Role[])) && (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap",
                  activeTab === item.id 
                    ? "bg-white text-slate-900 shadow-xl" 
                    : "text-white/50 hover:text-white hover:bg-white/10"
                )}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                <item.icon size={14} className={activeTab === item.id ? "text-talibon-red" : ""} />
                {item.label}
              </button>
            )
          ))}
        </nav>

        <div className="flex items-center gap-1.5 pl-4 border-l border-white/10">
          <button 
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-all rounded-full hover:bg-white/10"
            aria-label="Notifications"
            title="Notifications (Coming soon)"
          >
            <Bell size={14} />
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center text-white bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30 hover:scale-110 transition-all"
            aria-label="AI Assistant"
            title="AI Assistant (Coming soon)"
          >
            <Sparkles size={14} />
          </button>
          <div className="w-8 h-8 flex items-center justify-center text-white/20">
            <div className="h-4 w-[1px] bg-white/10"></div>
          </div>
          <div className="w-8 h-8 bg-talibon-orange rounded-full flex items-center justify-center text-white text-[8px] font-black border-2 border-white/10 uppercase">
            {currentUser?.first_name?.slice(0, 1)}{currentUser?.last_name?.slice(0, 1)}
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

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative px-10 py-32 dotted-grid">
        {/* Secondary Header / Breadcrumb */}
        <div className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">PH-TAL-01 SECURE</span>
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
            <div 
              className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center text-slate-400 hover:text-talibon-red transition-all cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Notifications"
            >
              <Bell size={20} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && <Dashboard employees={employees} userRole={currentRole} />}

              {/* Employees Tab */}
              {activeTab === 'employees' && (
                <ProtectedFeature requiredRoles={['admin', 'dept_head']}>
                  {employeeError ? (
                    <ErrorState
                      title="Failed to load employees"
                      message={(employeeErrorDetails as any)?.message || 'Please try again'}
                      onRetry={() => refetchEmployees()}
                    />
                  ) : employeeLoading ? (
                    <EmployeeListSkeleton />
                  ) : employees.length === 0 ? (
                    <EmptyState
                      title="No employees found"
                      message="Start by adding your first employee to the system"
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

              {/* Attendance Tab */}
              {activeTab === 'attendance' && (
                attendanceError ? (
                  <ErrorState
                    title="Failed to load attendance records"
                    message="Please try again"
                    onRetry={() => refetchAttendance()}
                  />
                ) : (
                  <AttendanceTracker 
                    records={attendanceRecords} 
                    currentUserRole={currentRole}
                    onLog={async (type) => {
                      try {
                        await EmployeeAPI.list();
                        queryClient.invalidateQueries({ queryKey: ['attendance'] });
                      } catch (error: any) {
                        addToast(error.message || 'Failed to log attendance', 'error');
                      }
                    }}
                  />
                )
              )}

              {/* Payroll Tab */}
              {activeTab === 'payroll' && (
                <ProtectedFeature requiredRoles={['admin', 'payroll_officer']}>
                  <PayrollManagement employees={employees} />
                </ProtectedFeature>
              )}

              {/* Leave Tab */}
              {activeTab === 'leave' && (
                <LeaveManagement 
                  employees={employees}
                  isAdmin={currentRole === 'admin' || currentRole === 'dept_head'}
                />
              )}

              {/* Audit Tab */}
              {activeTab === 'audit' && (
                <ProtectedFeature requiredRoles={['admin']}>
                  {auditError ? (
                    <ErrorState
                      title="Failed to load audit logs"
                      message="Please try again"
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
