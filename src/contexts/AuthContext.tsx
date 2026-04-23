import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Employee, Role } from '../types';
import { SupabaseService } from '../lib/supabaseService';
import { AuthAPI } from '../lib/api';
import { useToast } from './ToastContext';

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  currentUser: Employee | null;
  currentRole: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (requiredRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const unsubRef = useRef<(() => void) | null>(null);

  // Derived state — avoids double source of truth
  const currentRole: Role = currentUser?.role ?? 'employee';
  const isAuthenticated = currentUser !== null;

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { data, error } = await SupabaseService.auth.getCurrentUser();
        if (cancelled) return;

        if (!error && data?.user) {
          const { data: emp, error: empErr } = await SupabaseService.employees.getById(data.user.id);
          if (!cancelled && !empErr && emp) {
            setCurrentUser(emp as Employee);
          }
        }
      } catch {
        // silently ignore — user stays logged-out
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    // Supabase auth state listener (handles token refresh, tab-sync, etc.)
    const { data: { subscription } } = (SupabaseService.auth as any).onAuthStateChangeRaw?.() ?? {
      data: { subscription: null },
    };
    if (subscription) unsubRef.current = () => subscription.unsubscribe();

    return () => {
      cancelled = true;
      unsubRef.current?.();
    };
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        // Try Supabase auth first; fall back to NestJS mock endpoint.
        const { data: authData, error: authError } = await SupabaseService.auth.login(email, password);

        if (!authError && authData?.user) {
          // Supabase path
          const { data: emp, error: empErr } = await SupabaseService.employees.getById(authData.user.id);
          if (empErr) throw new Error('Employee record not found.');
          setCurrentUser(emp as Employee);
          addToast(`Welcome back, ${(emp as Employee).first_name}!`, 'success');
        } else {
          // NestJS mock path (offline / no Supabase config)
          const res = await AuthAPI.login(email, password);
          const payload = (res as any).data as { user: Employee; token: string };
          localStorage.setItem('authToken', payload.token);
          setCurrentUser(payload.user);
          addToast(`Welcome back, ${payload.user.first_name}!`, 'success');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
        addToast(msg, 'error');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast],
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await SupabaseService.auth.logout();
    } catch {
      // ignore — clear local state regardless
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('authEmployee');
    setCurrentUser(null);
    addToast('Logged out successfully.', 'success');
    setIsLoading(false);
  }, [addToast]);

  // ── RBAC helper ───────────────────────────────────────────────────────────
  const hasPermission = useCallback(
    (requiredRoles: Role[]) => requiredRoles.includes(currentRole),
    [currentRole],
  );

  return (
    <AuthContext.Provider
      value={{ currentUser, currentRole, isAuthenticated, isLoading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ============================================
// RBAC GUARD COMPONENT
// ============================================

interface ProtectedFeatureProps {
  requiredRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedFeature({ requiredRoles, children, fallback = null }: ProtectedFeatureProps) {
  const { hasPermission } = useAuth();
  return hasPermission(requiredRoles) ? <>{children}</> : <>{fallback}</>;
}