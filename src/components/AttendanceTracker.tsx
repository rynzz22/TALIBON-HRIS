import React, { useState } from 'react';
import { Clock, Fingerprint, Calendar as CalendarIcon, CheckCircle2, AlertCircle, Navigation, ChevronRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { cn, formatDate } from '../lib/utils';
import { AttendanceRecord, Role } from '../types';

interface AttendanceTrackerProps {
  records: AttendanceRecord[];
  currentUserRole: Role;
  onLog: (type: 'in' | 'out') => void;
}

export default function AttendanceTracker({ records, currentUserRole, onLog }: AttendanceTrackerProps) {
  const [currentDate] = useState(new Date());

  const stats = {
    today: records.filter(r => r.date === format(new Date(), 'yyyy-MM-dd')),
    onTime: 85, // Mock percentage
    late: 12,
    absent: 3
  };

  return (
    <div className="space-y-8 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tight">Time & Attendance</h2>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Precision Logging & Workforce Tracking</p>
        </div>
        <div className="flex items-center gap-4 border border-white/60 bg-white/40 px-6 py-3 rounded-2xl backdrop-blur-md">
           <CalendarIcon size={16} className="text-talibon-red" />
           <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{format(currentDate, 'MMMM dd, yyyy')}</span>
        </div>
      </header>

      {/* Hero Clock-In Action (Employee View) */}
      {currentUserRole === 'employee' && (
        <div className="glass-panel p-10 rounded-[3rem] relative overflow-hidden group">
           <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-talibon-red/5 rounded-full blur-3xl transition-all group-hover:bg-talibon-red/10"></div>
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex gap-8 items-center">
                 <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative">
                    <Clock size={40} />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white animate-pulse"></div>
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-3">Enterprise Clock-In</h3>
                    <p className="text-sm font-bold text-slate-500 max-w-sm">Secure biometric-ready logging for the Municipality of Talibon. Verify your session and record your attendance.</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-6">
                 <button 
                   onClick={() => onLog('in')}
                   className="group relative px-12 py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-600/30 overflow-hidden transition-all hover:scale-105 active:scale-95"
                 >
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                    <span className="relative flex items-center gap-3">
                       <ArrowUpRight size={18} /> Time-In Session
                    </span>
                 </button>
                 <button 
                   onClick={() => onLog('out')}
                   className="px-12 py-6 bg-white/60 text-slate-700 border border-white/80 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl backdrop-blur-md transition-all hover:bg-white hover:text-talibon-red active:scale-95"
                 >
                    <span className="flex items-center gap-3">
                       <ArrowDownLeft size={18} /> End Session
                    </span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Admin/Dept Head Stats Grid */}
      {currentUserRole !== 'employee' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="glass-card p-6 rounded-3xl group transition-all hover:translate-y-[-4px]">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <CheckCircle2 size={24} />
                 </div>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+4.2%</span>
              </div>
              <h4 className="text-3xl font-black text-slate-800 mb-1">{stats.onTime}%</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Punctuality Rate</p>
           </div>
           <div className="glass-card p-6 rounded-3xl group transition-all hover:translate-y-[-4px]">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-talibon-orange/10 rounded-2xl flex items-center justify-center text-talibon-orange group-hover:bg-talibon-orange group-hover:text-white transition-all">
                    <Clock size={24} />
                 </div>
                 <span className="text-[10px] font-black text-talibon-orange uppercase tracking-widest">12 Personnel</span>
              </div>
              <h4 className="text-3xl font-black text-slate-800 mb-1">{stats.late}%</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Late Arrivals Today</p>
           </div>
           <div className="glass-card p-6 rounded-3xl group transition-all hover:translate-y-[-4px]">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-talibon-red/10 rounded-2xl flex items-center justify-center text-talibon-red group-hover:bg-talibon-red group-hover:text-white transition-all">
                    <AlertCircle size={24} />
                 </div>
                 <span className="text-[10px] font-black text-talibon-red uppercase tracking-widest">3 Missing</span>
              </div>
              <h4 className="text-3xl font-black text-slate-800 mb-1">{stats.absent}%</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absence Rate</p>
           </div>
           <div className="glass-card p-6 rounded-3xl group transition-all hover:translate-y-[-4px]">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-slate-900/10 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Fingerprint size={24} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Feed</span>
              </div>
              <h4 className="text-3xl font-black text-slate-800 mb-1">204</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Logs Processed</p>
           </div>
        </div>
      )}

      {/* Recent Logs Table */}
      <div className="glass-panel rounded-[3rem] overflow-hidden">
         <div className="p-8 border-b border-white/20 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Personnel Engagement Stream</h3>
            <button className="text-[10px] font-black text-talibon-red uppercase tracking-widest hover:underline px-4 py-2 bg-talibon-red/5 rounded-xl transition-all">
               View Full Matrix
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white/40">
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity / ID</th>
                     <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Event Date</th>
                     <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Checkpoint In</th>
                     <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Checkpoint Out</th>
                     <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Metric Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/10">
                  {records.length === 0 ? (
                     <tr>
                        <td colSpan={6} className="px-8 py-16 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">No attendance packets detected in this cycle</td>
                     </tr>
                  ) : (
                     records.map((rec) => (
                        <tr key={rec.id} className="hover:bg-white/30 transition-colors group">
                           <td className="px-8 py-5">
                              <p className="text-xs font-black text-slate-800 tracking-tight">EMP-{rec.employeeId.slice(0,6)}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Biometric Verified</p>
                           </td>
                           <td className="px-6 py-5 text-[10px] font-bold text-slate-600">{formatDate(rec.date)}</td>
                           <td className="px-6 py-5">
                              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                 {format(new Date(rec.timeIn), 'hh:mm a')}
                              </span>
                           </td>
                           <td className="px-6 py-5">
                              {rec.timeOut ? (
                                 <span className="px-3 py-1.5 bg-talibon-orange/10 text-talibon-orange rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    {format(new Date(rec.timeOut), 'hh:mm a')}
                                 </span>
                              ) : (
                                 <span className="px-3 py-1.5 bg-slate-900/5 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">Active</span>
                              )}
                           </td>
                           <td className="px-6 py-5 text-xs font-black text-slate-800 font-mono">{rec.totalHours.toFixed(1)} hrs</td>
                           <td className="px-8 py-5 text-right">
                              <span className={cn(
                                 "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                 rec.status === 'present' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                 rec.status === 'late' ? "bg-talibon-orange/10 text-talibon-orange border-talibon-orange/20" :
                                 "bg-talibon-red/10 text-talibon-red border-talibon-red/20"
                              )}>
                                 {rec.status}
                              </span>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
