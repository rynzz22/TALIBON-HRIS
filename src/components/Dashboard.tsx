import { Employee, DEPARTMENTS, Role } from '../types';
import { Users, Building2, TrendingUp, CalendarDays, ArrowUpRight, ArrowDownRight, ShieldCheck, Activity } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  employees: Employee[];
  userRole: Role;
}

export default function Dashboard({ employees = [], userRole }: DashboardProps) {
  const safeEmployees = Array.isArray(employees) ? employees : [];
  
  const adminStats = [
    { 
      label: 'Total Personnel', 
      value: safeEmployees.length, 
      sub: '+2 this month', 
      trend: 'up',
      icon: Users, 
      color: 'text-talibon-red',
      bg: 'bg-talibon-red/5'
    },
    { 
      label: 'Monthly Payroll', 
      value: formatCurrency(safeEmployees.reduce((acc, emp) => acc + (emp.salary || 0), 0)), 
      sub: 'Next run in 4 days', 
      trend: 'neutral',
      icon: TrendingUp, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/5'
    },
    { 
      label: 'Pending Approvals', 
      value: '14', 
      sub: 'Leaves & Corrections', 
      trend: 'up',
      icon: ShieldCheck, 
      color: 'text-talibon-orange',
      bg: 'bg-talibon-orange/5'
    },
    { 
      label: 'Active Workforce', 
      value: '98.5%', 
      sub: 'Attendance Score', 
      trend: 'up',
      icon: Activity, 
      color: 'text-sky-600',
      bg: 'bg-sky-500/5'
    },
  ];

  const employeeStats = [
    { 
      label: 'Vacation Balance', 
      value: '12 Days', 
      sub: 'Earned this year', 
      trend: 'neutral',
      icon: CalendarDays, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/5'
    },
    { 
      label: 'Sick Leave', 
      value: '8 Days', 
      sub: 'Usage: 2.5d/yr', 
      trend: 'neutral',
      icon: ShieldCheck, 
      color: 'text-talibon-red',
      bg: 'bg-talibon-red/5'
    },
    { 
      label: 'Next Payslip', 
      value: 'Apr 30', 
      sub: 'Status: Processing', 
      trend: 'neutral',
      icon: TrendingUp, 
      color: 'text-talibon-orange',
      bg: 'bg-talibon-orange/5'
    },
    { 
      label: 'Punctuality', 
      value: '94%', 
      sub: '-2% vs last month', 
      trend: 'down',
      icon: Activity, 
      color: 'text-sky-600',
      bg: 'bg-sky-500/5'
    },
  ];

  const stats = userRole === 'admin' || userRole === 'dept_head' || userRole === 'payroll_officer' ? adminStats : employeeStats;
  const recentEmployees = [...safeEmployees].sort((a, b) => (b.id || '').localeCompare(a.id || '')).slice(0, 5);

  return (
    <div className="space-y-10 pb-32">
      <header className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tight">
             {userRole === 'admin' ? 'Executive Command' : 'My Workspace'}
           </h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
             {userRole === 'admin' ? 'Strategic Intelligence Center' : 'Personnel Overview & Self-Service'}
           </p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Systems Nominal</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.label} 
            className="glass-panel p-6 rounded-[2rem] group hover:bg-white/80 transition-all cursor-default relative overflow-hidden"
          >
            <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 rounded-full -mr-8 -mt-8", stat.bg)}></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={cn("p-4 rounded-2xl shadow-sm border border-white/40 glass-panel", stat.color, stat.bg)}>
                <stat.icon size={24} />
              </div>
              {stat.trend === 'up' && <div className="bg-emerald-500/20 text-emerald-600 p-1 rounded-lg backdrop-blur-sm border border-emerald-500/20"><ArrowUpRight size={16} /></div>}
              {stat.trend === 'down' && <div className="bg-rose-500/20 text-rose-600 p-1 rounded-lg backdrop-blur-sm border border-rose-500/20"><ArrowDownRight size={16} /></div>}
            </div>
            <div className="relative z-10">
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
               <h3 className="text-2xl font-black mt-1 text-slate-800 tracking-tight">{stat.value}</h3>
               <p className="text-[10px] font-bold text-slate-400 mt-2">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-panel p-10 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-talibon-red to-talibon-orange"></div>
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center text-talibon-red border border-white/60 shadow-inner">
                  <Activity size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Personnel Audit Logs</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Real-time Stream</p>
               </div>
            </div>
            <button className="text-talibon-red font-black text-[10px] uppercase tracking-widest bg-talibon-red/10 px-4 py-2 rounded-full hover:bg-talibon-red hover:text-white transition-all backdrop-blur-md border border-talibon-red/10">Export ISO-27001</button>
          </div>
          <div className="space-y-4">
            {recentEmployees.map(emp => (
              <div key={emp.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/20 border border-white/20 hover:bg-white/40 hover:border-talibon-orange hover:shadow-lg transition-all group backdrop-blur-sm">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/60 text-talibon-red rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:bg-talibon-red group-hover:text-white transition-all border border-white/40">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 tracking-tight text-lg leading-none">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{emp.department} • <span className="text-talibon-orange">{emp.position}</span></p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="flex items-center gap-2 justify-end mb-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Operational</p>
                   </div>
                   <p className="text-[10px] text-slate-400 font-mono tracking-tighter">REF: {emp.id.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900/90 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group border border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-talibon-orange blur-[100px] opacity-20 -mr-32 -mt-32 group-hover:opacity-40 transition-opacity"></div>
              <ShieldCheck size={48} className="text-talibon-orange mb-6" />
              <h3 className="text-2xl font-black tracking-tight leading-tight">ISO-Certified Security</h3>
              <p className="text-slate-400 text-sm mt-4 leading-relaxed font-medium">
                Personnel database is encrypted using industry-standard protocols. Access logs are immutable and archived as per municipal transparency bylaws.
              </p>
              <button className="mt-10 w-full py-4 bg-white/10 hover:bg-talibon-orange text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10 backdrop-blur-md">
                Audit Security Protocols
              </button>
           </div>

           <div className="glass-panel p-8 rounded-[2.5rem] shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Service Health</h4>
              <div className="space-y-5">
                 {[
                   { name: 'Personnel Engine', status: 'Optimal' },
                   { name: 'Payroll Ledger', status: 'Stable' },
                   { name: 'Supabase Sync', status: 'Active' },
                 ].map(svc => (
                   <div key={svc.name} className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700">{svc.name}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[8px] font-black rounded uppercase tracking-widest border border-emerald-500/10 backdrop-blur-md">{svc.status}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
