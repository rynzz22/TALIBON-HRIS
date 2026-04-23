import React, { useState, useEffect } from 'react';
import { LeaveRequest, Employee } from '../types';
import { Plus, X, Check, Loader2, Calendar, FileText, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaveManagementProps {
  employees: Employee[];
  isAdmin: boolean;
}

export default function LeaveManagement({ employees, isAdmin }: LeaveManagementProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newRequest, setNewRequest] = useState<Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>>({
    employeeId: '',
    type: 'Vacation',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/leave');
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch leave requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRequest,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setIsAdding(false);
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to submit leave request', error);
    }
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    // For now, we'll just update locally as we don't have a PUT route yet
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center glass-panel p-6 rounded-3xl">
        <div>
          <h2 className="font-black text-2xl text-slate-800 tracking-tight">Leave Management</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Personnel Absence Tracking</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-talibon-orange text-white px-8 py-3 rounded-2xl flex items-center gap-2 hover:bg-talibon-red transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-talibon-orange/10 active:scale-95"
        >
          <Plus size={18} />
          File Leave Request
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-2xl p-10 rounded-[2rem] border-2 border-talibon-orange/30 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-talibon-orange/5 blur-3xl -mr-32 -mt-32"></div>
              <div className="flex justify-between items-center border-b border-white/40 pb-6 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-talibon-orange text-white rounded-xl flex items-center justify-center shadow-lg shadow-talibon-orange/20">
                      <Calendar size={20} />
                   </div>
                   <h3 className="font-black text-xl text-slate-800 tracking-tight">Employee Leave Filing</h3>
                </div>
                <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-talibon-red bg-white/40 p-2 rounded-xl transition-colors border border-white/60">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Staff Member</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-white/40 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold"
                    value={newRequest.employeeId}
                    onChange={e => setNewRequest({...newRequest, employeeId: e.target.value})}
                  >
                    <option value="">Select Personnel...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="bg-white text-slate-800">{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Leave Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-white/40 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold"
                    value={newRequest.type}
                    onChange={e => setNewRequest({...newRequest, type: e.target.value as any})}
                  >
                    <option value="Vacation" className="bg-white text-slate-800">Vacation Leave</option>
                    <option value="Sick" className="bg-white text-slate-800">Sick Leave</option>
                    <option value="Maternity" className="bg-white text-slate-800">Maternity Leave</option>
                    <option value="Paternity" className="bg-white text-slate-800">Paternity Leave</option>
                    <option value="Emergency" className="bg-white text-slate-800">Emergency Leave</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Status Date</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date" 
                      required 
                      className="w-full px-4 py-3 bg-white/40 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold text-xs" 
                      value={newRequest.startDate}
                      onChange={e => setNewRequest({...newRequest, startDate: e.target.value})}
                    />
                    <input 
                      type="date" 
                      required 
                      className="w-full px-4 py-3 bg-white/40 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold text-xs" 
                      value={newRequest.endDate}
                      onChange={e => setNewRequest({...newRequest, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Justification / Reason</label>
                  <textarea 
                    required 
                    className="w-full px-4 py-3 bg-white/40 border border-white/60 rounded-xl focus:bg-white focus:outline-none focus:border-talibon-red/30 transition-all font-bold min-h-[100px]" 
                    value={newRequest.reason}
                    onChange={e => setNewRequest({...newRequest, reason: e.target.value})}
                    placeholder="Provide a brief explanation for the leave request..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-6 border-t border-white/40 relative z-10">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-3 bg-white/40 rounded-xl text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-white/60 transition-all border border-white/60"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-talibon-orange shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-talibon-red" size={48} />
          </div>
        ) : requests.length === 0 ? (
          <div className="glass-panel p-20 rounded-[2rem] text-center">
             <div className="opacity-10 font-black text-4xl uppercase tracking-[0.5em] text-slate-400">Clear Records</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map(req => {
              const emp = employees.find(e => e.id === req.employeeId);
              return (
                <motion.div 
                  layout
                  key={req.id} 
                  className="glass-panel p-8 rounded-[2rem] hover:bg-white/60 transition-all group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 rounded-full transition-colors ${
                    req.status === 'approved' ? 'bg-emerald-500' : req.status === 'rejected' ? 'bg-talibon-red' : 'bg-amber-500'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-6 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/60 text-talibon-red rounded-xl flex items-center justify-center font-black shadow-sm border border-white/80 backdrop-blur-md transition-transform group-hover:scale-110">
                        {emp?.firstName[0]}{emp?.lastName[0]}
                      </div>
                      <div>
                         <p className="font-black text-slate-800 tracking-tight leading-none">{emp?.firstName} {emp?.lastName}</p>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mt-1">{emp?.position}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border backdrop-blur-md ${
                      req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                      req.status === 'rejected' ? 'bg-talibon-red/10 text-talibon-red border-talibon-red/20' : 
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="space-y-4 relative">
                    <div className="bg-white/40 p-4 rounded-2xl border border-white/60 backdrop-blur-sm shadow-sm">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Calendar size={12} className="text-talibon-orange" /> Duration
                       </p>
                       <p className="font-black text-slate-700 tracking-tight">{new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="bg-white/20 p-4 rounded-2xl border border-white/20">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <FileText size={12} className="text-talibon-orange" /> Reason
                       </p>
                       <p className="text-xs font-medium text-slate-600 leading-relaxed italic pr-4">"{req.reason}"</p>
                    </div>
                  </div>

                  {req.status === 'pending' && isAdmin && (
                    <div className="flex gap-2 mt-8 pt-6 border-t border-white/20 relative">
                       <button 
                        onClick={() => handleAction(req.id, 'approved')}
                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                       >
                         <Check size={14} /> Approve
                       </button>
                       <button 
                        onClick={() => handleAction(req.id, 'rejected')}
                        className="flex-1 py-3 bg-white/40 text-talibon-red border border-white/60 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-talibon-red hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 backdrop-blur-sm"
                       >
                         <X size={14} /> Decline
                       </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
