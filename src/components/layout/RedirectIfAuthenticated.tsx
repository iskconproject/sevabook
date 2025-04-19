import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const { user, loading, userRole } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // If user is authenticated, redirect based on role
  if (user) {
    if (userRole === 'seller') {
      return <Navigate to="/seller" replace />;
    } else if (userRole === 'manager') {
      return <Navigate to="/manager" replace />;
    } else if (userRole === 'admin' || userRole === 'superAdmin') {
      return <Navigate to="/admin" replace />;
    } else {
      // If user has no valid role, redirect to root which will handle further redirection
      return <Navigate to="/" replace />;
    }
  }
  
  // If not authenticated, show the login page
  return <>{children}</>;
}
