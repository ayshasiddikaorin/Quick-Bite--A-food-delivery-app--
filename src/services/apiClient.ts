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
 * The backend serializes MongoDB documents, so ids come back as `_id`.
 * The app's models expect `id` — normalize every nested `_id` key to `id`.
 */
function normalizeMongoId<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(normalizeMongoId) as unknown as T;
  }
  if (data && typeof data === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const mappedKey = key === '_id' ? 'id' : key;
      out[mappedKey] = normalizeMongoId(value);
    }
    return out as T;
  }
  return data;
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

  return normalizeMongoId(envelope.data) as T;
}
