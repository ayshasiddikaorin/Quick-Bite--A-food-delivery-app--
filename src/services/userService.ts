/**
 * userService.ts
 * ──────────────
 * Authenticated user profile endpoints.
 * Requires a valid JWT stored via authStorage.
 */
import { apiRequest } from './apiClient';
import type { AuthUser } from '../models/user';

/** Fetch the logged-in user's current profile from the backend. */
export function fetchMyProfile(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me', {}, true);
}

/**
 * Update the logged-in user's profile.
 * Only name, phone, and avatar are accepted — role and password are blocked server-side.
 */
export function updateMyProfile(
  data: Partial<Pick<AuthUser, 'name' | 'phone' | 'avatar'>>,
): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true);
}
