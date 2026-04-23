import React, { useState } from 'react';
import { DollarSign, Download, Search, CheckCircle2, AlertCircle, Calendar, CreditCard, ArrowRight, Printer, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { Employee, PayrollRecord } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface PayrollProps {
  employees: Employee[];
}

export default function PayrollManagement({ employees }: PayrollProps) {
  const [payPeriod, setPayPeriod] = useState('2026-04-15');
  
  const totalGross = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0);
  const totalDeductions = totalGross * 0.12; // 12% statutory
  const totalNet = totalGross - totalDeductions;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tight">Financial Ledger</h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Fiscal Period Control</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:flex-none">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select 
                className="pl-10 pr-10 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none transition-all font-black text-[10px] uppercase tracking-widest text-slate-600 appearance-none min-w-[200px] shadow-sm"
                value={payPeriod}
                onChange={(e) => setPayPeriod(e.target.value)}
              >
                <option value="2026-04-15">April 1-15, 2026</option>
                <option value="2026-03-31">March 16-31, 2026</option>
              </select>
           </div>
           <button className="flex-1 md:flex-none px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-talibon-red shadow-xl transition-all flex items-center justify-center gap-2">
              <Printer size={14} /> Batch Print
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Gross Disbursement', value: totalGross, icon: TrendingUp, color: 'text-slate-800', bg: 'bg-white/40' },
          { label: 'Statutory Deductions', value: totalDeductions, icon: TrendingDown, color: 'text-talibon-red', bg: 'bg-talibon-red/10' },
          { label: 'Net Liquidity', value: totalNet, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-500/10' },
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.label} 
            className={cn("p-8 rounded-[2.5rem] border border-white/40 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all backdrop-blur-md", stat.bg)}
          >
            <div className="relative z-10">
               <stat.icon className={cn("mb-6", stat.color)} size={32} />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
               <h3 className={cn("text-3xl font-black mt-2 tracking-tighter font-mono", stat.color)}>{formatCurrency(stat.value)}</h3>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white blur-3xl opacity-40 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel rounded-[3rem] shadow-xl overflow-hidden">
        <div className="p-8 border-b border-white/20 flex justify-between items-center bg-white/40 backdrop-blur-md">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/60 shadow-sm rounded-xl flex items-center justify-center text-talibon-orange border border-white/80">
                 <ShieldCheck size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Verified Payroll Registry</h3>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">ISO-9001 Compliant</span>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/20 backdrop-blur-sm">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Personnel</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Rate</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Statutory Adj.</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Take-Home</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Settlement</th>
              </tr>
            </thead>
                    <tbody className="divide-y divide-white/10">
                      {employees.map((emp) => {
                        const basic = emp.salary || 0;
                        const sss = basic * 0.045;
                        const philhealth = basic * 0.04;
                        const pagibig = 200;
                        const tax = basic * 0.1;
                        const overtime = 0; // Mock OT
                        const deduct = sss + philhealth + pagibig + tax;
                        const net = basic + overtime - deduct;
                        
                        return (
                          <tr key={emp.id} className="hover:bg-white/40 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/60 text-slate-400 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:text-talibon-red border border-white/80 transition-all backdrop-blur-md">
                                  {emp.firstName ? emp.firstName[0] : ''}{emp.lastName ? emp.lastName[0] : ''}
                                </div>
                                <div>
                                  <p className="font-black text-slate-800 tracking-tight text-lg leading-none">{emp.firstName} {emp.lastName}</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">{emp.position}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 transition-all group-hover:pl-8">
                               <p className="text-sm font-black text-slate-700 tracking-tight font-mono">{formatCurrency(basic)}</p>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Base + {formatCurrency(overtime)} OT</p>
                            </td>
                            <td className="px-6 py-6">
                               <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">SSS:</span>
                                  <span className="text-[9px] font-black text-talibon-red font-mono">{formatCurrency(sss)}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">PH:</span>
                                  <span className="text-[9px] font-black text-talibon-red font-mono">{formatCurrency(philhealth)}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">TAX:</span>
                                  <span className="text-[9px] font-black text-talibon-red font-mono">{formatCurrency(tax)}</span>
                               </div>
                            </td>
                            <td className="px-6 py-6 font-mono font-black text-slate-900 text-lg">{formatCurrency(net)}</td>
                            <td className="px-8 py-6 text-right">
                              <button className="px-6 py-2 bg-emerald-500/10 text-emerald-700 rounded-full font-black text-[10px] uppercase tracking-widest border border-emerald-500/10 hover:bg-emerald-500 hover:text-white transition-all shadow-sm backdrop-blur-md active:scale-95">
                                Release & PDF
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
