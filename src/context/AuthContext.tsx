import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import type { AuthUser, UserRole } from '../models';
import type { RegisterRequest } from '../models/auth';
import { loginRequest, registerRequest } from '../services/authService';
import { fetchMyProfile, updateMyProfile } from '../services/userService';
import { getStoredAuth, saveAuth, clearAuth } from '../storage/authStorage';

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;

  /** Fetch fresh profile data from the backend and update local state. */
  refreshProfile: () => Promise<void>;

  /** Patch allowed profile fields (name, phone, avatar) and persist. */
  updateProfile: (data: Partial<Pick<AuthUser, 'name' | 'phone' | 'avatar'>>) => Promise<void>;

  getUserRole: () => UserRole | null;

  /** Admin-only: switch role view without logging out. */
  switchRole: (role: UserRole) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Helper: map LoginResponse → AuthUser ─────────────────────────────────────
function responseToAuthUser(r: {
  userId: string; name: string; email: string; phone: string;
  role: UserRole; avatar: string; isPremium: boolean;
  loyaltyPoints: number; walletBalance: number; totalOrders: number;
  memberSince: string; restaurantName?: string; vehicleType?: string;
}): AuthUser {
  return {
    userId:        r.userId,
    name:          r.name,
    email:         r.email,
    phone:         r.phone,
    role:          r.role,
    avatar:        r.avatar,
    isPremium:     r.isPremium,
    loyaltyPoints: r.loyaltyPoints,
    walletBalance: r.walletBalance,
    totalOrders:   r.totalOrders,
    memberSince:   r.memberSince,
    restaurantName: r.restaurantName,
    vehicleType:   r.vehicleType,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted session on app start, then silently refresh from backend
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = await getStoredAuth();
        if (stored) {
          setUser(stored.user);
          setToken(stored.token);

          // Try refreshing with live data in the background — ignore errors
          // (user stays logged in from cache if network is unavailable)
          try {
            const fresh = await fetchMyProfile();
            setUser(fresh);
            await saveAuth({ token: stored.token, user: fresh });
          } catch {
            // network unavailable — cached user is fine
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string, role?: UserRole) => {
      const response = await loginRequest({ email, password, role });
      const authUser = responseToAuthUser(response);
      setUser(authUser);
      setToken(response.usertoken);
      await saveAuth({ token: response.usertoken, user: authUser });
    },
    [],
  );

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (payload: RegisterRequest) => {
    const response = await registerRequest(payload);
    const authUser = responseToAuthUser(response);
    setUser(authUser);
    setToken(response.usertoken);
    await saveAuth({ token: response.usertoken, user: authUser });
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await clearAuth();
  }, []);

  // ── Refresh profile from backend ───────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    const fresh = await fetchMyProfile();
    setUser(fresh);
    // Update cache with new data, preserving existing token
    const stored = await getStoredAuth();
    if (stored) await saveAuth({ token: stored.token, user: fresh });
  }, []);

  // ── Update profile ─────────────────────────────────────────────────────────
  const updateProfile = useCallback(
    async (data: Partial<Pick<AuthUser, 'name' | 'phone' | 'avatar'>>) => {
      const updated = await updateMyProfile(data);
      setUser(updated);
      const stored = await getStoredAuth();
      if (stored) await saveAuth({ token: stored.token, user: updated });
    },
    [],
  );

  // ── Role helpers ───────────────────────────────────────────────────────────
  const getUserRole = useCallback((): UserRole | null => user?.role ?? null, [user]);

  const switchRole = useCallback((role: UserRole) => {
    setUser((prev) => (prev ? { ...prev, role } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
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
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
