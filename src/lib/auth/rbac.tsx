'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { CURRENT_USER } from '@/constants/navigation';
import { UserProfile } from '@/types';

export type UserRole =
  | 'Super Admin'
  | 'Frontend Lead'
  | 'Pod Lead'
  | 'Engineer'
  | 'Viewer';

export interface AuthContextType {
  user: UserProfile;
  setRole: (role: UserRole) => void;
  canCreateProject: boolean;
  canEditProject: (projectLeadEmail?: string) => boolean;
  canCreateSprint: boolean;
}

export function isSuperAdmin(role?: string): boolean {
  if (!role) return false;
  return role.trim().toLowerCase() === 'super admin';
}

export function checkCanCreateProject(user?: { role?: string } | null): boolean {
  if (!user || !user.role) return false;
  return isSuperAdmin(user.role);
}

export function checkCanEditProject(
  user?: { role?: string; email?: string } | null,
  projectLeadEmail?: string
): boolean {
  if (!user || !user.role) return false;
  if (isSuperAdmin(user.role)) return true;
  // If user is project lead
  if (projectLeadEmail && user.email && projectLeadEmail.toLowerCase() === user.email.toLowerCase()) {
    return true;
  }
  // Frontend Lead / Pod Lead can edit projects in their domain
  const normalized = user.role.trim().toLowerCase();
  return normalized === 'frontend lead' || normalized === 'pod lead';
}

export function checkCanCreateSprint(user?: { role?: string } | null): boolean {
  if (!user || !user.role) return false;
  if (isSuperAdmin(user.role)) return true;
  const normalized = user.role.trim().toLowerCase();
  return normalized === 'frontend lead' || normalized === 'pod lead';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(CURRENT_USER);

  const setRole = (role: UserRole) => {
    setUser((prev) => ({
      ...prev,
      role,
    }));
  };

  const value = useMemo<AuthContextType>(() => {
    return {
      user,
      setRole,
      canCreateProject: checkCanCreateProject(user),
      canEditProject: (projectLeadEmail?: string) => checkCanEditProject(user, projectLeadEmail),
      canCreateSprint: checkCanCreateSprint(user),
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback if rendered outside provider (e.g. in standalone tests)
    return {
      user: CURRENT_USER,
      setRole: () => {},
      canCreateProject: checkCanCreateProject(CURRENT_USER),
      canEditProject: (projectLeadEmail?: string) => checkCanEditProject(CURRENT_USER, projectLeadEmail),
      canCreateSprint: checkCanCreateSprint(CURRENT_USER),
    };
  }
  return context;
}
