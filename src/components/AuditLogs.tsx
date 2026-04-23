import React from 'react';
import { History, ShieldAlert, Cpu, Terminal, ChevronRight, Search, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { AuditLog } from '../types';
import { formatDate } from '../lib/utils';
import { format } from 'date-fns';

interface AuditLogsProps {
  logs: AuditLog[];
}

export default function AuditLogs({ logs }: AuditLogsProps) {
  return (
    <div className="space-y-8 pb-32">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tight">Municipal Audit Trail</h2>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Zero-Trust Activity Monitoring & Accountability</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <button className="flex-1 md:flex-none px-6 py-3 bg-white/40 hover:bg-white/60 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border border-white/60 shadow-sm">
              <Download size={14} /> Full Export (.LOG)
           </button>
        </div>
      </header>

      <div className="glass-panel p-6 rounded-[2.5rem] flex items-center gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Query Audit Vault (Action, User, Target...)" 
              className="w-full pl-14 pr-6 py-4 bg-white/20 border border-white/40 rounded-2xl focus:bg-white/40 focus:outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
            />
         </div>
         <div className="flex items-center gap-2 px-6 py-4 bg-slate-900 rounded-2xl text-white">
            <Cpu size={16} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Real-time Feed Online</span>
         </div>
      </div>

      <div className="glass-panel rounded-[3rem] overflow-hidden border border-white/40">
         <div className="bg-slate-900 text-white p-6 flex items-center gap-4">
            <Terminal size={18} className="text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Immutable System Event Registry</span>
         </div>
         <div className="divide-y divide-white/20">
            {logs.length === 0 ? (
               <div className="p-20 text-center">
                  <History className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Vault Empty. Security system initialized.</p>
               </div>
            ) : (
               logs.map((log) => (
                  <div key={log.id} className="p-8 hover:bg-white/40 transition-colors flex items-center justify-between group">
                     <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center border border-white shadow-sm transition-transform group-hover:scale-110">
                           <ShieldAlert size={20} className={cn(
                              log.action.includes('Delete') ? "text-talibon-red" : 
                              log.action.includes('Update') ? "text-talibon-orange" : 
                              "text-emerald-500"
                           )} />
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-800 tracking-tight">{log.action}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.target}</span>
                           </div>
                           <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-500">
                              <span className="flex items-center gap-1"><Terminal size={10} /> {log.userName}</span>
                              <span>•</span>
                              <span>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                           </div>
                        </div>
                     </div>
                     <button className="p-3 text-slate-300 hover:text-slate-600 transition-all">
                        <ChevronRight size={18} />
                     </button>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
