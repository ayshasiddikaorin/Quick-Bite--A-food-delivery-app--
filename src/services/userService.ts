import { apiRequest } from './apiClient';
import type { AuthUser } from '../models';

/**
 * Fetch the currently authenticated user's full profile.
 * Requires a valid JWT in storage.
 */
export function fetchMyProfile(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me', {}, true);
}

/**
 * Update the current user's profile fields.
 * Only allowed fields: name, phone, avatar.
 * Role and password changes are blocked server-side.
 */
export function updateMyProfile(
  data: Partial<Pick<AuthUser, 'name' | 'phone' | 'avatar'>>,
): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true);
}
