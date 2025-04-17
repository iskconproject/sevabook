export type UserRole = 'superAdmin' | 'admin' | 'seller' | 'manager';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
}

export const SUPER_ADMIN_EMAIL = 'arindamdawn3@gmail.com';
