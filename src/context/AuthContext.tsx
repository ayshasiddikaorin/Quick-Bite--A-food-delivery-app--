import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { AuthUser, UserRole } from '../types';

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (role: UserRole, credentials?: Partial<AuthUser>) => void;
  logout: () => void;
  getUserRole: () => UserRole | null;
  switchRole: (role: UserRole) => void;
}

// ─── Mock users per role (simulates backend auth) ─────────────────────────────
const MOCK_USERS: Record<UserRole, AuthUser> = {
  buyer: {
    id: 'u_001',
    name: 'Aysha Siddika',
    email: 'aysha@example.com',
    phone: '01312939830',
    role: 'buyer',
    isPremium: true,
  },
  seller: {
    id: 's_001',
    name: 'Ahmed Rahman',
    email: 'ahmed@restaurant.com',
    phone: '01712345678',
    role: 'seller',
    restaurantName: 'Spice Garden',
  },
  rider: {
    id: 'r_001',
    name: 'Karim Hossain',
    email: 'karim@rider.com',
    phone: '01812345678',
    role: 'rider',
    vehicleType: 'Motorcycle',
  },
  admin: {
    id: 'a_001',
    name: 'Platform Admin',
    email: 'admin@foody.com',
    phone: '01912345678',
    role: 'admin',
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * Login with a given role.
   * In a real app this would call an API; here we return the mock user.
   */
  const login = useCallback(
    (role: UserRole, credentials?: Partial<AuthUser>) => {
      const base = MOCK_USERS[role];
      setUser({ ...base, ...credentials });
    },
    []
  );

  /** Hard logout — clears user state */
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  /**
   * Returns the current user's role, or null if not authenticated.
   * This is the canonical "getUserRole" utility the requirement mentions.
   */
  const getUserRole = useCallback((): UserRole | null => {
    return user?.role ?? null;
  }, [user]);

  /**
   * Admin-only: switch to view another role's layout without logging out.
   */
  const switchRole = useCallback(
    (role: UserRole) => {
      if (!user) return;
      setUser({ ...MOCK_USERS[role], id: user.id });
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        getUserRole,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
