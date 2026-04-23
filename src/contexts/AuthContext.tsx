import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role, Employee } from '../types';
import { SupabaseService } from '../lib/supabaseService';
import { useToast } from './ToastContext';

interface AuthContextType {
  currentUser: Employee | null;
  currentRole: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (role: Role) => void;
  hasPermission: (requiredRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>('employee');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  // Initialize auth state from Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data, error } = await SupabaseService.auth.getCurrentUser();
        if (error || !data.user) {
          setIsLoading(false);
          return;
        }

        // Fetch employee data from Supabase
        const { data: employee, error: empError } = await SupabaseService.employees.getById(
          data.user.id
        );

        if (!empError && employee) {
          setCurrentUser(employee as any);
          setCurrentRole(employee.role as Role);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const unsubscribe = SupabaseService.auth.onAuthStateChange((user) => {
      if (!user) {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe?.();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        const { data, error } = await SupabaseService.auth.login(email, password);

        if (error) throw error;

        // Fetch employee data
        const { data: employee, error: empError } = await SupabaseService.employees.getById(
          data.user!.id
        );

        if (empError) throw empError;

        setCurrentUser(employee as any);
        setCurrentRole(employee.role as Role);
        setIsAuthenticated(true);

        addToast(`Welcome back, ${employee.first_name}!`, 'success');
      } catch (error) {
        addToast(error instanceof Error ? error.message : 'Login failed', 'error');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await SupabaseService.auth.logout();

      setCurrentUser(null);
      setCurrentRole('employee');
      setIsAuthenticated(false);

      addToast('Logged out successfully', 'success');
    } catch (error) {
      addToast('Logout failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const updateRole = useCallback((role: Role) => {
    setCurrentRole(role);
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
    }
  }, [currentUser]);

  const hasPermission = useCallback(
    (requiredRoles: Role[]): boolean => {
      return requiredRoles.includes(currentRole);
    },
    [currentRole]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// RBAC helper component for protecting features
interface ProtectedProps {
  requiredRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedFeature({ requiredRoles, children, fallback = null }: ProtectedProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
