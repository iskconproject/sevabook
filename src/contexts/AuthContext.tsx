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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Mock user profiles for development
  const mockUserProfiles: Record<string, UserProfile> = {
    // This will be populated as users log in
  };

  // Fetch user profile from database or mock data
  const fetchUserProfile = async (userId: string) => {
    try {
      // For development, use mock data instead of actual database calls
      // In production, uncomment the following code to use the actual database
      // const { data, error } = await db.users.getUserById(userId);

      // Mock implementation
      const mockData = mockUserProfiles[userId];
      const mockError = !mockData;

      if (mockError || !mockData) {
        // If user profile doesn't exist yet, create a default one
        const email = user?.email || '';
        const defaultRole: UserRole = email === SUPER_ADMIN_EMAIL ? 'superAdmin' : 'admin';

        const newProfile: UserProfile = {
          id: userId,
          name: email.split('@')[0] || 'User',
          email: email,
          role: defaultRole,
          status: 'active',
          lastLogin: new Date().toISOString()
        };

        // Save to mock data
        mockUserProfiles[userId] = newProfile;

        // In production, uncomment this to save to the database
        // await db.users.updateUser(userId, newProfile);

        setUserProfile(newProfile);
        setUserRole(defaultRole);
        return;
      }

      setUserProfile(mockData);
      setUserRole(mockData.role);
    } catch (error) {
      console.error('Error fetching user profile:', error);

      // Fallback to default role if there's an error
      const email = user?.email || '';
      const defaultRole: UserRole = email === SUPER_ADMIN_EMAIL ? 'superAdmin' : 'admin';
      setUserRole(defaultRole);
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

  const signIn = async (email: string, password: string) => {
    try {
      // For development, simulate successful login
      if (import.meta.env.DEV) {
        // Create a mock user
        const mockUser = {
          id: `mock-user-id-${Date.now()}`, // Unique ID for each login
          email: email,
          user_metadata: {}
        } as User;

        setUser(mockUser);

        // Set role based on email for development
        let role: UserRole = 'admin'; // Default role

        if (email === SUPER_ADMIN_EMAIL) {
          role = 'superAdmin';
        } else if (email.includes('seller')) {
          role = 'seller';
        } else if (email.includes('manager')) {
          role = 'manager';
        }

        // Create a mock profile
        const mockProfile: UserProfile = {
          id: mockUser.id,
          name: email.split('@')[0] || 'User',
          email: email,
          role: role,
          status: 'active',
          lastLogin: new Date().toISOString()
        };

        // Save to mock data
        mockUserProfiles[mockUser.id] = mockProfile;

        // Update state
        setUserProfile(mockProfile);
        setUserRole(role);

        return { error: null };
      }

      // For production, use the actual Supabase auth
      const { error } = await db.auth.signIn(email, password);
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    if (import.meta.env.DEV) {
      // For development, just clear the state
      setUser(null);
      setUserProfile(null);
      setUserRole(null);
    } else {
      // For production, use the actual Supabase auth
      await db.auth.signOut();
    }
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
    signIn,
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
