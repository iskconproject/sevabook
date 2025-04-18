import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/supabase/client';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { UserProfile, UserRole, SUPER_ADMIN_EMAIL } from '../lib/types/user';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  userRole: UserRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isManager: boolean;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to determine the role based on email - moved outside for cleaner code
const getRoleFromEmail = (email: string): UserRole | null => {
  if (email === SUPER_ADMIN_EMAIL) return 'superAdmin';
  if (email === 'arindam.dawn@monet.work') return 'admin';
  if (email === 'projectiskcon@gmail.com') return 'seller';
  if (email === 'arindam@appexert.com') return 'manager';
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Fetch user profile from database or create a temporary one
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      // First check session storage for cached profile to avoid unnecessary DB calls
      const cachedProfile = sessionStorage.getItem(`user_profile_${userId}`);
      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);
        setUserProfile(profile);
        setUserRole(profile.role);
        return;
      }

      // Get user profile from the database
      const { data, error } = await db.users.getUserById(userId);

      if (data) {
        // If we have data, use it and cache it
        setUserProfile(data);
        setUserRole(data.role);
        sessionStorage.setItem(`user_profile_${userId}`, JSON.stringify(data));
        return;
      }

      if (error) {
        console.error('Error fetching user profile:', error);
      }

      // If no data, check if the email is in the allowed list
      const defaultRole = getRoleFromEmail(email);

      // If email is not in the allowed list, sign out
      if (!defaultRole) {
        console.error('Unauthorized email:', email);
        await signOut();
        return;
      }

      // For allowed emails, set a temporary profile
      const tempProfile: UserProfile = {
        id: userId,
        name: email.split('@')[0] || 'User',
        email: email,
        role: defaultRole,
        status: 'active',
        lastLogin: new Date().toISOString()
      };

      setUserProfile(tempProfile);
      setUserRole(defaultRole);

      // Cache the profile
      sessionStorage.setItem(`user_profile_${userId}`, JSON.stringify(tempProfile));

      // Create the user in the database if it doesn't exist
      await db.users.createUserIfNotExists(tempProfile);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      await signOut();
    }
  };

  useEffect(() => {
    // Check if user session exists
    const initializeAuth = async () => {
      try {
        // Get the session first to properly check existing auth state
        const { data: sessionData } = await db.auth.getSession();

        if (sessionData.session?.user) {
          const currentUser = sessionData.session.user;
          setUser(currentUser);
          await fetchUserProfile(currentUser.id, currentUser.email || '');
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: authListener } = db.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event);

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          // Clear user data on signout
          if (user?.id) {
            sessionStorage.removeItem(`user_profile_${user.id}`);
          }
          setUser(null);
          setUserProfile(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await db.auth.signInWithGoogle();
      return { error };
    } catch (error) {
      console.error('Sign in with Google error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    // Clear session storage before signing out
    if (user?.id) {
      sessionStorage.removeItem(`user_profile_${user.id}`);
    }
    // Use the actual Supabase auth
    await db.auth.signOut();
    // Clear the state
    setUser(null);
    setUserProfile(null);
    setUserRole(null);
  };

  // Role-based helper properties
  const isSuperAdmin = userRole === 'superAdmin';
  const isAdmin = userRole === 'admin' || isSuperAdmin;
  const isSeller = userRole === 'seller' || isAdmin;
  const isManager = userRole === 'manager' || isAdmin;

  const value = {
    user,
    userProfile,
    loading,
    userRole,
    isSuperAdmin,
    isAdmin,
    isSeller,
    isManager,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
