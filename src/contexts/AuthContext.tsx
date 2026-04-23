import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role, Employee } from '../types';
import { AuthAPI } from '../lib/api';
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

  // Initialize auth state from localStorage/session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        const storedRole = localStorage.getItem('userRole');

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setCurrentRole((storedRole as Role) || 'employee');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('userRole');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        // Call backend auth endpoint
        const response = await AuthAPI.login({ email, password });
        const user = response.data.user;

        setCurrentUser(user);
        setCurrentRole(user.role);
        setIsAuthenticated(true);

        localStorage.setItem('authUser', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);

        addToast(`Welcome back, ${user.firstName}!`, 'success');
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
      await AuthAPI.logout();

      setCurrentUser(null);
      setCurrentRole('employee');
      setIsAuthenticated(false);

      localStorage.removeItem('authUser');
      localStorage.removeItem('userRole');

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
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      localStorage.setItem('userRole', role);
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
