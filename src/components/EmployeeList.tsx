import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, Mail, Briefcase, Calendar, Filter, ChevronDown, Download, MoreHorizontal, UserCheck, Shield, X, Users, Briefcase as BriefcaseIcon } from 'lucide-react';
import { Employee, Department, DEPARTMENTS } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatDate, cn } from '../lib/utils';

interface EmployeeListProps {
  employees: Employee[];
  loading: boolean;
  onAdd: (employee: Omit<Employee, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Employee>) => void;
}

export default function EmployeeList({ employees, loading, onAdd, onDelete, onUpdate }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [filterDept, setFilterDept] = useState<string>('All');
  
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id' | 'role' | 'status' | 'leaveBalances'>>({
    firstName: '',
    lastName: '',
    email: '',
    department: DEPARTMENTS[0],
    position: '',
    salary: 0,
    hireDate: new Date().toISOString().split('T')[0],
    employmentStatus: 'Regular',
    govIds: {
      sss: '',
      philhealth: '',
      pagibig: '',
      tin: '',
    }
  });

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.id}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || emp.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newEmployee,
      leaveBalances: { vacation: 15, sick: 15, emergency: 5 }
    } as any);
    setIsAdding(false);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      department: DEPARTMENTS[0],
      position: '',
      salary: 0,
      hireDate: new Date().toISOString().split('T')[0],
      employmentStatus: 'Regular',
      govIds: { sss: '', philhealth: '', pagibig: '', tin: '' }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      onUpdate(editingEmployee.id, editingEmployee);
      setEditingEmployee(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Statistics */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tight">Personnel Registry</h2>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Managing {employees.length} Active Records</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <button className="flex-1 md:flex-none px-6 py-3 bg-white/40 hover:bg-white/60 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border border-white/60 shadow-sm">
              <Download size={14} /> Export CSV
           </button>
           <button 
            onClick={() => setIsAdding(true)}
            className="flex-1 md:flex-none px-8 py-3 bg-talibon-red text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 shadow-xl shadow-talibon-red/20 transition-all flex items-center justify-center gap-2 active:scale-95"
           >
              <Plus size={16} /> New Employee
           </button>
        </div>
      </header>

      {/* Persistence Controls */}
      <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Universal Search (Name, Email, ID...)" 
            className="w-full pl-14 pr-6 py-4 bg-white/20 border border-white/40 rounded-2xl focus:bg-white/40 focus:outline-none focus:ring-4 focus:ring-talibon-red/5 focus:border-talibon-red/30 transition-all font-bold text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
           <div className="relative flex-1 lg:flex-none">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select 
                className="pl-10 pr-10 py-4 bg-white/20 border border-white/40 rounded-2xl focus:bg-white/40 focus:outline-none transition-all font-black text-[10px] uppercase tracking-widest text-slate-600 appearance-none min-w-[200px]"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-slate-900/90 backdrop-blur-2xl text-white p-10 rounded-[3rem] shadow-2xl space-y-8 relative border border-white/10">
              <div className="absolute top-0 right-0 p-8">
                 <Shield className="text-talibon-orange opacity-20" size={64} />
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-talibon-red rounded-xl flex items-center justify-center">
                    <UserCheck size={20} />
                 </div>
                 <h3 className="text-2xl font-black tracking-tight">Onboard New Personnel</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">First Name</label>
                  <input required type="text" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none focus:border-talibon-orange transition-all font-bold placeholder:text-white/20" placeholder="e.g. Juan" value={newEmployee.firstName} onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Last Name</label>
                  <input required type="text" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none focus:border-talibon-orange transition-all font-bold placeholder:text-white/20" placeholder="e.g. Dela Cruz" value={newEmployee.lastName} onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Official Email</label>
                  <input required type="email" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none focus:border-talibon-orange transition-all font-bold placeholder:text-white/20" placeholder="name@talibon.gov.ph" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Assignment</label>
                  <select className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none focus:border-talibon-orange transition-all font-bold" value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value as Department})}>
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept} className="bg-slate-900">{dept}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Job Designation</label>
                  <input required type="text" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none focus:border-talibon-orange transition-all font-bold" value={newEmployee.position} onChange={e => setNewEmployee({...newEmployee, position: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Monthly Salary (PHP)</label>
                  <input required type="number" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none focus:border-talibon-orange transition-all font-bold" value={newEmployee.salary} onChange={e => setNewEmployee({...newEmployee, salary: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Effective Date</label>
                  <input required type="date" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none focus:border-talibon-orange transition-all font-bold" value={newEmployee.hireDate} onChange={e => setNewEmployee({...newEmployee, hireDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Employment Status</label>
                  <select className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none focus:border-talibon-orange transition-all font-bold" value={newEmployee.employmentStatus} onChange={e => setNewEmployee({...newEmployee, employmentStatus: e.target.value as any})}>
                    <option value="Regular" className="bg-slate-900">Regular</option>
                    <option value="Casual" className="bg-slate-900">Casual</option>
                    <option value="Contractual" className="bg-slate-900">Contractual</option>
                  </select>
                </div>
                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">SSS Number</label>
                     <input type="text" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none transition-all font-bold" value={newEmployee.govIds?.sss} onChange={e => setNewEmployee({...newEmployee, govIds: {...newEmployee.govIds, sss: e.target.value}})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">PhilHealth</label>
                     <input type="text" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none transition-all font-bold" value={newEmployee.govIds?.philhealth} onChange={e => setNewEmployee({...newEmployee, govIds: {...newEmployee.govIds, philhealth: e.target.value}})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Pag-IBIG MID</label>
                     <input type="text" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none transition-all font-bold" value={newEmployee.govIds?.pagibig} onChange={e => setNewEmployee({...newEmployee, govIds: {...newEmployee.govIds, pagibig: e.target.value}})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">TIN</label>
                     <input type="text" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:outline-none transition-all font-bold" value={newEmployee.govIds?.tin} onChange={e => setNewEmployee({...newEmployee, govIds: {...newEmployee.govIds, tin: e.target.value}})} />
                   </div>
                </div>
                <div className="flex items-end gap-3 lg:col-start-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-4 py-4 bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-4 bg-talibon-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-talibon-orange/80 transition-all shadow-xl shadow-talibon-orange/20">Finalize</button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEmployee && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingEmployee(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white/60 backdrop-blur-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/40"
            >
              <form onSubmit={handleUpdate} className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-talibon-red rounded-2xl flex items-center justify-center text-white shadow-lg shadow-talibon-red/20">
                      <Edit2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Edit Personnel Profile</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {editingEmployee.id}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setEditingEmployee(null)} className="p-3 bg-white/40 text-slate-400 hover:text-talibon-red rounded-2xl transition-all border border-white/60">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
                    <input required type="text" className="w-full px-5 py-4 bg-white/40 border border-white/60 rounded-2xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold" value={editingEmployee.firstName} onChange={e => setEditingEmployee({...editingEmployee, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
                    <input required type="text" className="w-full px-5 py-4 bg-white/40 border border-white/60 rounded-2xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold" value={editingEmployee.lastName} onChange={e => setEditingEmployee({...editingEmployee, lastName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Official Email</label>
                    <input required type="email" className="w-full px-5 py-4 bg-white/40 border border-white/60 rounded-2xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold" value={editingEmployee.email} onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assignment</label>
                    <select className="w-full px-5 py-4 bg-white/40 border border-white/60 rounded-2xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold" value={editingEmployee.department} onChange={e => setEditingEmployee({...editingEmployee, department: e.target.value as Department})}>
                      {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Job Designation</label>
                    <input required type="text" className="w-full px-5 py-4 bg-white/40 border border-white/60 rounded-2xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold" value={editingEmployee.position} onChange={e => setEditingEmployee({...editingEmployee, position: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Monthly Salary (PHP)</label>
                    <input required type="number" className="w-full px-5 py-4 bg-white/40 border border-white/60 rounded-2xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold" value={editingEmployee.salary} onChange={e => setEditingEmployee({...editingEmployee, salary: parseFloat(e.target.value)})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-50">
                  <button type="button" onClick={() => setEditingEmployee(null)} className="flex-1 py-4 bg-white/60 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/80 transition-all border border-white/40">Cancel Edits</button>
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-talibon-red transition-all shadow-xl shadow-slate-900/20">Commit Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="glass-panel rounded-[3rem] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/40"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/40 backdrop-blur-sm">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Staff Identity</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Assignment</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Comp. (Mo.)</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tenure Start</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {loading ? (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="w-12 h-12 border-4 border-talibon-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Municipal Ledger...</p>
                   </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic opacity-40">No entries found for active filters</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/40 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/60 text-talibon-red rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform border border-white/80 backdrop-blur-md">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight text-lg leading-none">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                             <Mail size={10} className="text-talibon-red" /> {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                       <p className="text-sm font-black text-slate-700 tracking-tight">{emp.position}</p>
                       <p className="text-[9px] font-black text-talibon-red/60 uppercase tracking-widest mt-1">{emp.department}</p>
                    </td>
                    <td className="px-6 py-6">
                       <p className="text-sm font-black text-slate-800 tracking-tight font-mono">{formatCurrency(emp.salary)}</p>
                    </td>
                    <td className="px-6 py-6 text-xs text-slate-500 font-bold">{formatDate(emp.hireDate)}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingEmployee(emp)}
                          className="p-3 text-slate-400 hover:text-talibon-red hover:bg-white/60 rounded-xl transition-all shadow-sm border border-transparent hover:border-white/80"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(emp.id)}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-3 text-slate-400 hover:text-slate-600 rounded-xl">
                           <MoreHorizontal size={16} />
                        </button>
                      </div>
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
