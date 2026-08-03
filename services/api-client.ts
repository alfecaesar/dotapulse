import { OPENDOTA_API_BASE } from '@/utils/constants';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
}

const DEFAULT_TIMEOUT = 15000;

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, ...init } = options;
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${OPENDOTA_API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...init.headers,
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new ApiError(
        `OpenDota API error: ${res.status} ${res.statusText}`,
        res.status
      );
    }

    const text = await res.text();
    if (!text) return [] as unknown as T;
    return JSON.parse(text) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out', 408);
    }
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error',
      0
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
