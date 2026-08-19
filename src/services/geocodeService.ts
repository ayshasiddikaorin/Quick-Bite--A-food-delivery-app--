/**
 * geocodeService.ts
 * ─────────────────
 * Free geocoding — no API keys needed.
 *
 * - Reverse (coord → address): via the backend's BigDataCloud proxy.
 * - Search (text → place): via Photon (komoot) directly from the app — it is
 *   free, CORS-enabled and needs no key.
 */
import { apiRequest } from './apiClient';

export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  address: Record<string, string>;
}

export interface SearchGeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

/** Convert a coordinate into a human readable address (via backend proxy). */
export function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
  return apiRequest<ReverseGeocodeResult>(`/geocode/reverse?lat=${lat}&lon=${lon}`);
}

interface PhotonFeature {
  properties?: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
}

/** Free-text place search using Photon (komoot) — no API key, CORS enabled. */
export async function searchPlaces(query: string): Promise<SearchGeocodeResult[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: PhotonFeature[] };

  const results: SearchGeocodeResult[] = [];
  for (const f of data.features ?? []) {
    const coords = f.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const name = f.properties?.name;
    const label =
      [name, f.properties?.city, f.properties?.state, f.properties?.country]
        .filter(Boolean)
        .join(', ') || 'Selected place';
    results.push({
      latitude: coords[1],
      longitude: coords[0],
      displayName: label,
    });
  }
  return results;
}