'use client';

import React from 'react';
import { PermissionAction } from './rules';
import { usePermissions, UserContext } from './usePermissions';

interface CanProps {
  action: PermissionAction;
  /** The pod in view. Pass it for pod-scoped actions. */
  podId?: string;
  currentUser: UserContext;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  action,
  podId,
  currentUser,
  fallback = null,
  children,
}) => {
  const { can } = usePermissions(currentUser);

  if (!can(action, podId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};