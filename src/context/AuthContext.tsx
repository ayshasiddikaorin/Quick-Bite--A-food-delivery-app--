import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { AuthUser, UserRole } from '../models';
import type { RegisterRequest } from '../models/auth';
import { loginRequest, registerRequest } from '../services/authService';
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
  getUserRole: () => UserRole | null;
  switchRole: (role: UserRole) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted session (token + user) on app start
  useEffect(() => {
    const bootstrap = async () => {
      const stored = await getStoredAuth();
      if (stored) {
        setUser(stored.user);
        setToken(stored.token);
      }
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  /**
   * Login against the backend. The API responds with a JWT (`usertoken`),
   * the user's `name`, and their `role`. We store all three locally so the
   * user's features are gated by the role returned by the server.
   */
  const login = useCallback(
    async (email: string, password: string, role?: UserRole) => {
      const response = await loginRequest({ email, password, role });
      const authUser: AuthUser = { name: response.name, role: response.role };
      setUser(authUser);
      setToken(response.usertoken);
      await saveAuth({ token: response.usertoken, user: authUser });
    },
    []
  );

  /** Logout — clears the session from state and storage */
  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await clearAuth();
  }, []);

  /**
   * Register a new account. The backend responds with a JWT (`usertoken`),
   * `name` and `role` just like login, so we store the session the same way.
   */
  const register = useCallback(async (payload: RegisterRequest) => {
    const response = await registerRequest(payload);
    const authUser: AuthUser = { name: response.name, role: response.role };
    setUser(authUser);
    setToken(response.usertoken);
    await saveAuth({ token: response.usertoken, user: authUser });
  }, []);

  /** Returns the current user's role, or null if not authenticated */
  const getUserRole = useCallback((): UserRole | null => {
    return user?.role ?? null;
  }, [user]);

  /** Admin-only: switch to view another role's layout without logging out */
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
