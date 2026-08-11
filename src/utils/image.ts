/**
 * Image helpers — guard against React Native's
 * "source.uri should not be an empty string" warning.
 * Live backend data often has empty image / coverImage / logo / avatar fields,
 * so every <Image> renders through safeImageUri() and falls back to a
 * neutral placeholder instead of an empty uri.
 */

export const PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAB4CAYAAAC3kr3rAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFPSURBVHhe7dOxCQAhAMBA959U+MYNtHwQyQRXXJM+Y35rA2/jDsDPIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwC4QADImAh7R0xHAAAAABJRU5ErkJggg==';

import { API_BASE_URL } from '../config/api';

/** Origin of the backend (e.g. `http://192.168.1.5:5000`), derived from the API base. */
const API_ORIGIN = (API_BASE_URL.split('/api/v1')[0] ?? API_BASE_URL).replace(/\/+$/, '');

/**
 * Resolve a stored image reference against the currently-used backend host.
 * - absolute http(s)/data/file URIs pass through untouched
 * - relative paths (`/uploads/...`) are prefixed with the API origin, so uploaded
 *   images keep working regardless of emulator vs. physical device host
 * - empty/null values fall back to a neutral placeholder
 */
export function resolveImageUri(uri?: string | null): string {
  const value = (uri ?? '').trim();
  if (!value) return PLACEHOLDER_IMAGE;
  if (/^(https?:\/\/|data:|file:)/i.test(value)) return value;
  if (value.startsWith('/')) return `${API_ORIGIN}${value}`;
  return value;
}

/** Returns the given URI when non-empty, otherwise a neutral placeholder. */
export function safeImageUri(uri?: string | null): string {
  return resolveImageUri(uri);
}
