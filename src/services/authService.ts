/**
 * authService.ts
 * ──────────────
 * Public auth endpoints (login + register).
 * No auth token needed — these create the session.
 */
import { apiRequest } from './apiClient';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth';

/** Log in with email + password. Returns JWT and full user profile. */
export function loginRequest(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Register a new account. Returns JWT and full user profile. */
export function registerRequest(payload: RegisterRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
