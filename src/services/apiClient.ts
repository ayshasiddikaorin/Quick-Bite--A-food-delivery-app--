import { API_BASE_URL } from '../config/api';
import { getAuthToken } from '../storage/authStorage';

// ─── Error class ──────────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Backend envelope shape ───────────────────────────────────────────────────
interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

/**
 * Make an HTTP request against the backend.
 * Automatically unwraps the ApiResponse envelope → returns `data` directly.
 * Throws ApiError on non-success responses.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const token = authenticated ? await getAuthToken() : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const envelope = await response.json().catch(() => null) as ApiEnvelope<T> | null;

  if (!response.ok || !envelope?.success) {
    throw new ApiError(
      response.status,
      envelope?.message ?? `Request failed (${response.status})`,
    );
  }

  return envelope.data as T;
}
