import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      // Get user profile from the database
      const { data, error } = await db.users.getUserById(userId);

      if (error) {
        console.error('Error fetching user profile:', error);
        // On database error, don't clear the user state yet
        // The trigger should have created the profile
      }

      if (data) {
        // If we have data, use it
        setUserProfile(data);
        setUserRole(data.role);
        return;
      }

      // If no data, check if the email is in the allowed list
      const email = user?.email || '';
      let defaultRole: UserRole | null = null;

      if (email === SUPER_ADMIN_EMAIL) {
        defaultRole = 'superAdmin';
      } else if (email === 'arindam.dawn@monet.work') {
        defaultRole = 'admin';
      } else if (email === 'projectiskcon@gmail.com') {
        defaultRole = 'seller';
      } else if (email === 'arindam@appexert.com') {
        defaultRole = 'manager';
      }

      // If email is not in the allowed list, sign out
      if (!defaultRole) {
        console.error('Unauthorized email:', email);
        await signOut();
        return;
      }

      // For allowed emails, set a temporary profile until the database is updated
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
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // On unexpected error, sign out
      await signOut();
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data } = await db.auth.getUser();
        setUser(data.user);

        if (data.user) {
          await fetchUserProfile(data.user.id);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const { data: authListener } = db.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
