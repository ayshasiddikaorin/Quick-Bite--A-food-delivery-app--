/**
 * geocode.service.ts
 * ──────────────────
 * Free reverse geocoding + place search.
 *
 * - Reverse: BigDataCloud free reverse-geocode-client (no API key, ~10k req/day,
 *   no strict user-agent policy — unlike Nominatim which 403s server requests).
 * - Search:  Nominatim is fine for a one-off place search, but it blocks
 *   unauthenticated server calls, so we proxy through BigDataCloud-free
 *   alternatives only where available. If BigDataCloud has no search, we fall
 *   back gracefully to the user typing the address.
 */

const BDC_REVERSE_BASE = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

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

interface BigDataCloudReverse {
  countryName?: string;
  principalSubdivision?: string;
  city?: string;
  locality?: string;
  postcode?: string;
  plusCode?: string;
}

function buildDisplayName(data: BigDataCloudReverse): string {
  const parts = [
    data.locality,
    data.city,
    data.principalSubdivision,
    data.countryName,
  ].filter(Boolean) as string[];
  // De-duplicate while preserving order
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const p of parts) {
    if (!seen.has(p)) {
      seen.add(p);
      unique.push(p);
    }
  }
  return unique.join(', ') || 'Selected location';
}

export class GeocodeService {
  /** Convert coordinates → a human readable address (free, no API key). */
  async reverse(lat: number, lon: number): Promise<ReverseGeocodeResult> {
    const url = `${BDC_REVERSE_BASE}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&localityLanguage=en`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding service error (${res.status})`);
    }

    const data = (await res.json()) as BigDataCloudReverse;

    return {
      latitude: lat,
      longitude: lon,
      displayName: buildDisplayName(data),
      address: {
        city: data.city ?? '',
        locality: data.locality ?? '',
        region: data.principalSubdivision ?? '',
        country: data.countryName ?? '',
        postcode: data.postcode ?? '',
        plusCode: data.plusCode ?? '',
      },
    };
  }

  /** Free-text place search — Nominatim is permissive enough for a single query,
   *  but blocked for server calls; return an empty list so the app falls back to
   *  the on-map picker + manual entry. */
  async search(_query: string): Promise<SearchGeocodeResult[]> {
    return [];
  }
}