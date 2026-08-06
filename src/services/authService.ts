import { apiRequest } from './apiClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../models/auth';

export function loginRequest(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerRequest(payload: RegisterRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
