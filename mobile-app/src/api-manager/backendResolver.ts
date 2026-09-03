import { Platform } from 'react-native';

const FAST_TIMEOUT_MS = 400;
const SLOW_TIMEOUT_MS = 2000;

const FALLBACK_MAP: Record<string, string[]> = {
  ios: ['http://localhost:8000'],
  android: [
    'http://10.0.2.2:8000', // Android Studio Emulator
    'http://192.168.240.1:8000', // Waydroid
    'http://localhost:8000', // Fallback
  ],
  web: ['http://localhost:8000'],
};

let cachedResolvedUrl: string | null = null;

const checkBackendHealth = async (url: string, timeoutMs: number): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal as RequestInit['signal'],
    });

    if (response.ok) {
      return url;
    }
    throw new Error(`Health check failed for ${url} with status ${response.status}`);
  } catch (error) {
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const resolveWithTimeout = async (
  candidates: string[],
  timeoutMs: number
): Promise<string | null> => {
  if (candidates.length === 0) return null;

  try {
    const results = await Promise.allSettled(
      candidates.map((url) => checkBackendHealth(url, timeoutMs))
    );

    const successfulUrls = results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
      .map((result) => result.value);

    if (successfulUrls.length > 0) {
      if (successfulUrls.length > 1) {
        console.warn(
          `[Service Discovery] Multiple backends responded: ${successfulUrls.join(
            ', '
          )}. Binding to the first one: ${successfulUrls[0]}`
        );
      }
      return successfulUrls[0];
    }
  } catch (err) {
    // Should not throw because Promise.allSettled absorbs errors
  }

  return null;
};

export const resolveBackendUrl = async (): Promise<string> => {
  if (cachedResolvedUrl) {
    return cachedResolvedUrl;
  }

  const envUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL?.trim();

  // 1. If ENV is provided, try it immediately (it wins)
  if (envUrl) {
    // Try fast pass for ENV
    try {
      await checkBackendHealth(envUrl, FAST_TIMEOUT_MS);
      cachedResolvedUrl = envUrl;
      console.log(`[Service Discovery] Bound to ENV backend: ${cachedResolvedUrl}`);
      return cachedResolvedUrl;
    } catch {
      console.warn(`[Service Discovery] ENV backend ${envUrl} failed. Falling back to candidates...`);
    }
  }

  const os = Platform.OS;
  const candidates = FALLBACK_MAP[os] || FALLBACK_MAP.web;

  // 2. Fast pass for all candidates in parallel
  let resolved = await resolveWithTimeout(candidates, FAST_TIMEOUT_MS);
  if (resolved) {
    cachedResolvedUrl = resolved;
    console.log(`[Service Discovery] Bound to fallback backend (Fast Pass): ${cachedResolvedUrl}`);
    return cachedResolvedUrl;
  }

  // 3. Slow pass for all candidates in parallel
  console.log(`[Service Discovery] Fast pass failed. Attempting slow pass...`);
  resolved = await resolveWithTimeout(candidates, SLOW_TIMEOUT_MS);
  if (resolved) {
    cachedResolvedUrl = resolved;
    console.log(`[Service Discovery] Bound to fallback backend (Slow Pass): ${cachedResolvedUrl}`);
    return cachedResolvedUrl;
  }

  // 4. Offline mode / Complete failure fallback
  console.warn(
    '[Service Discovery] All backend probes failed. Defaulting to first candidate to allow standard offline failures.'
  );
  cachedResolvedUrl = envUrl || candidates[0];
  return cachedResolvedUrl;
};
