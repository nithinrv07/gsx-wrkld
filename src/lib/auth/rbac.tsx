'use client';

import React, { createContext, useContext, useState, useMemo, useRef, useEffect } from 'react';
import { CURRENT_USER } from '@/constants/navigation';
import { UserProfile } from '@/types';
import { useMockSession } from '@/features/auth/useMockSession';

export type UserRole =
  | 'Super Admin'
  | 'Frontend Lead'
  | 'Project Lead'
  | 'Pod Lead'
  | 'Engineer'
  | 'Contributor'
  | 'Viewer';

export interface AuthContextType {
  user: UserProfile;
  setRole: (role: UserRole) => void;
  canCreateProject: boolean;
  canEditProject: (projectLeadEmail?: string) => boolean;
  canCreateSprint: boolean;
}

function titleCase(s: string): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 1 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(' ');
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
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
  // Frontend Lead / Project Lead / Pod Lead can edit projects in their domain
  const normalized = user.role.trim().toLowerCase();
  return (
    normalized === 'frontend lead' ||
    normalized === 'project lead' ||
    normalized === 'pod lead'
  );
}

export function checkCanCreateSprint(user?: { role?: string } | null): boolean {
  if (!user || !user.role) return false;
  if (isSuperAdmin(user.role)) return true;
  const normalized = user.role.trim().toLowerCase();
  return (
    normalized === 'frontend lead' ||
    normalized === 'project lead' ||
    normalized === 'pod lead'
  );
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = useMockSession();
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);
  const prevUserIdRef = useRef<string | null>(null);

  // If session persona changes, reset any testing role override
  useEffect(() => {
    const currentId = session.status === 'signed-in' ? session.user.id : null;
    if (prevUserIdRef.current !== currentId) {
      prevUserIdRef.current = currentId;
      setRoleOverride(null);
    }
  }, [session]);

  const baseUser: UserProfile = useMemo(() => {
    if (session.status === 'signed-in' && session.user) {
      const name = titleCase(session.user.name);
      return {
        name,
        role: session.user.globalRole,
        email: session.user.email,
        avatarUrl: session.user.image,
        initials: initialsOf(name),
      };
    }
    return CURRENT_USER;
  }, [session]);

  const activeUser: UserProfile = useMemo(() => {
    if (roleOverride) {
      return { ...baseUser, role: roleOverride };
    }
    return baseUser;
  }, [baseUser, roleOverride]);

  const setRole = (role: UserRole) => {
    setRoleOverride(role);
  };

  const value = useMemo<AuthContextType>(() => {
    return {
      user: activeUser,
      setRole,
      canCreateProject: checkCanCreateProject(activeUser),
      canEditProject: (projectLeadEmail?: string) => checkCanEditProject(activeUser, projectLeadEmail),
      canCreateSprint: checkCanCreateSprint(activeUser),
    };
  }, [activeUser]);

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
