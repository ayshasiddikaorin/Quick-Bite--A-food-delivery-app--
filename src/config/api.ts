function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit;

  return 'https://quick-bite-a-food-delivery-3qe1b90xo-ayshas-projects-422b85a6.vercel.app/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();