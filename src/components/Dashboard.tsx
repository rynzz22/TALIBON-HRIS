import { Employee, Role, DEPARTMENTS } from '../types';
import {
  Users,
  Building2,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  employees: Employee[];
  userRole: Role;
}

export default function Dashboard({ employees = [], userRole }: DashboardProps) {
  const safe = Array.isArray(employees) ? employees : [];

  const adminStats = [
    {
      label: 'Total Personnel',
      value: safe.length,
      sub: '+2 this month',
      trend: 'up' as const,
      icon: Users,
      color: 'text-talibon-red',
      bg: 'bg-talibon-red/5',
    },
    {
      label: 'Monthly Payroll',
      value: formatCurrency(safe.reduce((acc, e) => acc + (e.salary ?? 0), 0)),
      sub: 'Next run in 4 days',
      trend: 'neutral' as const,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/5',
    },
    {
      label: 'Pending Approvals',
      value: '14',
      sub: 'Leaves & Corrections',
      trend: 'up' as const,
      icon: ShieldCheck,
      color: 'text-talibon-orange',
      bg: 'bg-talibon-orange/5',
    },
    {
      label: 'Active Workforce',
      value: '98.5%',
      sub: 'Attendance Score',
      trend: 'up' as const,
      icon: Activity,
      color: 'text-sky-600',
      bg: 'bg-sky-500/5',
    },
  ];

  const employeeStats = [
    {
      label: 'Vacation Balance',
      value: '12 Days',
      sub: 'Earned this year',
      trend: 'neutral' as const,
      icon: CalendarDays,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/5',
    },
    {
      label: 'Sick Leave',
      value: '8 Days',
      sub: 'Usage: 2.5d/yr',
      trend: 'neutral' as const,
      icon: ShieldCheck,
      color: 'text-talibon-red',
      bg: 'bg-talibon-red/5',
    },
    {
      label: 'Next Payslip',
      value: 'Apr 30',
      sub: 'Status: Processing',
      trend: 'neutral' as const,
      icon: TrendingUp,
      color: 'text-talibon-orange',
      bg: 'bg-talibon-orange/5',
    },
    {
      label: 'Punctuality',
      value: '94%',
      sub: '-2% vs last month',
      trend: 'down' as const,
      icon: Activity,
      color: 'text-sky-600',
      bg: 'bg-sky-500/5',
    },
  ];

  const stats =
    userRole === 'admin' || userRole === 'dept_head' || userRole === 'payroll_officer'
      ? adminStats
      : employeeStats;

  const recent = [...safe].sort((a, b) => (b.id ?? '').localeCompare(a.id ?? '')).slice(0, 5);

  return (
    <div className="space-y-10 pb-32">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            {userRole === 'admin' ? 'Executive Command' : 'My Workspace'}
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
            {userRole === 'admin'
              ? 'Strategic Intelligence Center'
              : 'Personnel Overview & Self-Service'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
            Systems Nominal
          </span>
        </div>
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 rounded-[2rem] group hover:bg-white/80 transition-all cursor-default relative overflow-hidden"
          >
            <div
              className={cn(
                'absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 rounded-full -mr-8 -mt-8',
                stat.bg,
              )}
            />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={cn('p-4 rounded-2xl shadow-sm border border-white/40 glass-panel', stat.color, stat.bg)}>
                <stat.icon size={24} />
              </div>
              {stat.trend === 'up' && (
                <div className="bg-emerald-500/20 text-emerald-600 p-1 rounded-lg border border-emerald-500/20">
                  <ArrowUpRight size={16} />
                </div>
              )}
              {stat.trend === 'down' && (
                <div className="bg-rose-500/20 text-rose-600 p-1 rounded-lg border border-rose-500/20">
                  <ArrowDownRight size={16} />
                </div>
              )}
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black mt-1 text-slate-800 tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-2">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent employees + service health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-panel p-10 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-talibon-red to-talibon-orange" />
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center text-talibon-red border border-white/60 shadow-inner">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Recent Personnel</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  Latest Entries
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {recent.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No employee records yet.</p>
            ) : (
              recent.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/20 border border-white/20 hover:bg-white/40 hover:border-talibon-orange transition-all group backdrop-blur-sm"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/60 text-talibon-red rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:bg-talibon-red group-hover:text-white transition-all border border-white/40">
                      {emp.first_name?.[0]}
                      {emp.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 tracking-tight text-lg leading-none">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                        {emp.department} •{' '}
                        <span className="text-talibon-orange">{emp.position}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {emp.status === 'active' ? 'Operational' : 'Inactive'}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono tracking-tighter">
                      REF: {emp.id?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/90 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-talibon-orange blur-[100px] opacity-20 -mr-32 -mt-32 group-hover:opacity-40 transition-opacity" />
            <ShieldCheck size={48} className="text-talibon-orange mb-6" />
            <h3 className="text-2xl font-black tracking-tight leading-tight">ISO-Certified Security</h3>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed font-medium">
              Personnel database encrypted using industry-standard protocols. Immutable audit logs as per
              municipal transparency bylaws.
            </p>
            <button className="mt-10 w-full py-4 bg-white/10 hover:bg-talibon-orange text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10">
              Audit Security Protocols
            </button>
          </div>

          <div className="glass-panel p-8 rounded-[2.5rem]">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
              Service Health
            </h4>
            <div className="space-y-5">
              {[
                { name: 'Personnel Engine', status: 'Optimal' },
                { name: 'Payroll Ledger', status: 'Stable' },
                { name: 'Supabase Sync', status: 'Active' },
              ].map((svc) => (
                <div key={svc.name} className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700">{svc.name}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[8px] font-black rounded uppercase tracking-widest border border-emerald-500/10">
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}