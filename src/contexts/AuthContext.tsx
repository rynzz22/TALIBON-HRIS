import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role, Employee } from '../types';
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
        const storedEmployee = localStorage.getItem('authEmployee');
        if (storedEmployee) {
          const employee = JSON.parse(storedEmployee);
          setCurrentUser(employee);
          setCurrentRole(employee.role as Role);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('authEmployee');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (email: string, idNumber: string) => {
      try {
        setIsLoading(true);
        
        // For ID-based auth, we use the employee record directly
        const storedEmployee = localStorage.getItem('authEmployee');
        if (!storedEmployee) {
          throw new Error('Employee data not found');
        }

        const employee = JSON.parse(storedEmployee);
        setCurrentUser(employee);
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
      localStorage.removeItem('authEmployee');

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
