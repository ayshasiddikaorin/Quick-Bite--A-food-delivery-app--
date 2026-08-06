import { apiRequest } from './apiClient';
import type { AdminStats } from '../models';

/** Admin: get platform stats */
export function fetchAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>('/admin/stats', {}, true);
}

/** Admin: list all users (optional role filter) */
export function adminFetchUsers(role?: string): Promise<object[]> {
  const qs = role ? `?role=${role}` : '';
  return apiRequest<object[]>(`/auth/admin/users${qs}`, {}, true);
}

/** Admin: toggle user active/inactive */
export function adminToggleUser(id: string): Promise<object> {
  return apiRequest<object>(`/auth/admin/users/${id}/toggle`, { method: 'PATCH' }, true);
}
