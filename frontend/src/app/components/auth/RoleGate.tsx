'use client';

import { useAuth } from '../../context/AuthContext';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: ('super_admin' | 'admin' | 'manager' | 'customer')[];
  fallback?: React.ReactNode;
}

export default function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
