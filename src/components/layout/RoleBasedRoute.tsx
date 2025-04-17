import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types/user';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/' 
}: RoleBasedRouteProps) {
  const { user, loading, userRole } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if the user's role is in the allowed roles
  if (userRole && allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }
  
  // If not allowed, redirect to the specified path
  return <Navigate to={redirectTo} replace />;
}
