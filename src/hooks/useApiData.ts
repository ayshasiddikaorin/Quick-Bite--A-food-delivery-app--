import { useState, useEffect, useCallback, useRef } from 'react';

const TIMEOUT_MS = 5000;

export type ApiDataState<T> =
  | { status: 'loading' }
  | { status: 'live';    data: T; fromFallback: false }
  | { status: 'fallback'; data: T; fromFallback: true; error: string };

/**
 * Fetch data from the API with a timeout.
 * If the request fails or times out, falls back to `fallbackData` so the
 * screen always has something to render.
 *
 * @param fetcher  An async function that calls the real API.
 * @param fallbackData  Dummy/seed data used when the API is unavailable.
 * @param deps  Extra dependencies that should re-trigger the fetch (optional).
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  fallbackData: T,
  deps: unknown[] = [],
): ApiDataState<T> & { reload: () => void } {
  const [state, setState] = useState<ApiDataState<T>>({ status: 'loading' });
  const isMounted = useRef(true);

  const load = useCallback(async () => {
    setState({ status: 'loading' });

    // Race the API call against a timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS),
    );

    try {
      const data = await Promise.race([fetcher(), timeoutPromise]);
      if (isMounted.current) {
        setState({ status: 'live', data, fromFallback: false });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.warn('[useApiData] falling back to dummy data:', message);
      if (isMounted.current) {
        setState({ status: 'fallback', data: fallbackData, fromFallback: true, error: message });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    load();
    return () => { isMounted.current = false; };
  }, [load]);

  return { ...state, reload: load };
}
