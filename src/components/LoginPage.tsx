import React, { useState } from 'react';
import { LogIn, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { IDAuthService } from '../lib/idAuth';

const ID_TYPES = ['SSS', 'PhilHealth', 'Pag-IBIG', 'TIN', 'Driver License', 'Passport'] as const;

export default function LoginPage() {
  const [idNumber, setIdNumber] = useState('');
  const [idType, setIdType] = useState<typeof ID_TYPES[number]>('SSS');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idNumber.trim()) {
      addToast('ID number is required', 'warning');
      return;
    }

    if (!idType) {
      addToast('ID type is required', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      
      // Authenticate using ID
      const { employee, error } = await IDAuthService.authenticate({
        idNumber: idNumber.trim(),
        idType: idType as any,
      });

      if (error || !employee) {
        addToast(error || 'Authentication failed', 'error');
        await IDAuthService.logAuthAttempt(idNumber, false, error);
        return;
      }

      // Log successful attempt
      await IDAuthService.logAuthAttempt(idNumber, true);

      // Store employee data and log in
      localStorage.setItem('authEmployee', JSON.stringify(employee));
      
      // Trigger login in auth context
      await login(employee.email, idNumber);
      
      addToast(`Welcome, ${employee.first_name}!`, 'success');
    } catch (error) {
      addToast('Login failed', 'error');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-talibon-red/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-talibon-red rounded-lg shadow-lg shadow-talibon-red/30 mb-4">
              <LogIn size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">TALIBON</h1>
            <p className="text-sm text-slate-400 mt-1">Human Resources Information System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ID Type Select */}
            <div>
              <label htmlFor="idType" className="block text-sm font-semibold text-slate-200 mb-2">
                ID Type
              </label>
              <select
                id="idType"
                value={idType}
                onChange={(e) => setIdType(e.target.value as typeof ID_TYPES[number])}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-talibon-red focus:ring-2 focus:ring-talibon-red/20 transition-all"
                disabled={isLoading}
              >
                {ID_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-slate-900">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* ID Number Input */}
            <div>
              <label htmlFor="idNumber" className="block text-sm font-semibold text-slate-200 mb-2">
                ID Number
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="idNumber"
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Enter your ID number"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-talibon-red focus:ring-2 focus:ring-talibon-red/20 transition-all"
                  aria-label="ID number"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-talibon-red to-talibon-red/80 hover:from-talibon-red/90 hover:to-talibon-red text-white font-bold rounded-lg transition-all shadow-lg shadow-talibon-red/20 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Verifying ID...
                </span>
              ) : (
                'Sign In with ID'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-3 bg-blue-600/20 border border-blue-400/30 rounded-lg text-center">
            <p className="text-xs text-blue-200">
              Enter your government ID number to access the system
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <p>Secure HRIS Platform • Powered by Talibon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
