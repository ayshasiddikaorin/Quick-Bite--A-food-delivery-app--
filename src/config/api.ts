import Constants from 'expo-constants';

function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit;

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { hostUri?: string } | null)?.hostUri;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:5000/api/v1`;
  }

  return 'http://localhost:5000/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();