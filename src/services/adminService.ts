/**
 * adminService.ts
 * ───────────────
 * Admin-only API calls.
 */
import { apiRequest } from './apiClient';
import type { AdminStats } from '../models/dashboard';
import type { AuthUser } from '../models/user';

/** Get platform-wide aggregated stats. */
export function fetchAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>('/admin/stats', {}, true);
}

/** List all users, optionally filtered by role ('buyer' | 'seller' | 'rider'). */
export function adminFetchUsers(role?: string): Promise<AuthUser[]> {
  const qs = role ? `?role=${role}` : '';
  return apiRequest<AuthUser[]>(`/auth/admin/users${qs}`, {}, true);
}

/** Toggle a user's active/inactive status. Returns updated user. */
export function adminToggleUser(id: string): Promise<AuthUser> {
  return apiRequest<AuthUser>(`/auth/admin/users/${id}/toggle`, { method: 'PATCH' }, true);
}
