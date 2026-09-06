import { Platform } from 'react-native';

const FAST_TIMEOUT_MS = 400;
const SLOW_TIMEOUT_MS = 2000;

export const DEFAULT_FALLBACK_MAP: Record<string, string[]> = {
  ios: ['http://localhost'],
  android: [
    'http://10.0.2.2', // Android Studio Emulator
    'http://192.168.240.1', // Waydroid
    'http://localhost', // Fallback
  ],
  web: ['http://localhost'],
};

const checkHealth = async (url: string, path: string, timeoutMs: number): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${url}${path}`, {
      method: 'GET',
      signal: controller.signal as RequestInit['signal'],
    });

    if (response.ok) {
      return url;
    }
    throw new Error(`Health check failed for ${url}${path} with status ${response.status}`);
  } catch (error) {
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const resolveWithTimeout = async (
  candidates: string[],
  path: string,
  timeoutMs: number,
  serviceName: string
): Promise<string | null> => {
  if (candidates.length === 0) return null;

  try {
    const results = await Promise.allSettled(
      candidates.map((url) => checkHealth(url, path, timeoutMs))
    );

    const successfulUrls = results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
      .map((result) => result.value);

    if (successfulUrls.length > 0) {
      if (successfulUrls.length > 1) {
        console.log(
          `[Service Discovery: ${serviceName}] Multiple backends responded: ${successfulUrls.join(
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

export const resolveServiceUrl = async (
  envUrl: string | undefined,
  serviceName: string,
  port: number,
  healthPath: string,
  isDev: boolean
): Promise<string> => {
  const parsedEnvUrl = envUrl?.trim();

  if (!isDev) {
    if (!parsedEnvUrl) {
      throw new Error(
        `[Service Discovery: ${serviceName}] Production build requires ${serviceName} base URL in environment variables.`
      );
    }
    console.log(
      `[Service Discovery: ${serviceName}] ☁️ PRODUCTION MODE: using exact ENV URL: ${parsedEnvUrl}`
    );
    return parsedEnvUrl;
  }

  // 1. If ENV is provided, try it immediately (it wins)
  if (parsedEnvUrl) {
    try {
      await checkHealth(parsedEnvUrl, healthPath, FAST_TIMEOUT_MS);
      console.log(
        `[Service Discovery: ${serviceName}] 🛠️ DEV MODE: Bound to ENV backend: ${parsedEnvUrl}`
      );
      return parsedEnvUrl;
    } catch {
      console.warn(
        `[Service Discovery: ${serviceName}] ❌ ENV VALUE FAILED: ${parsedEnvUrl} is unreachable. Falling back to candidates...`
      );
    }
  }

  const os = Platform.OS;
  const rawCandidates = DEFAULT_FALLBACK_MAP[os] || DEFAULT_FALLBACK_MAP.web;
  const candidates = rawCandidates.map((c) => `${c}:${port}`);

  // 2. Fast pass for all candidates in parallel
  let resolved = await resolveWithTimeout(candidates, healthPath, FAST_TIMEOUT_MS, serviceName);
  if (resolved) {
    console.log(
      `[Service Discovery: ${serviceName}] Bound to fallback backend (Fast Pass): ${resolved}`
    );
    return resolved;
  }

  // 3. Slow pass for all candidates in parallel
  console.log(`[Service Discovery: ${serviceName}] Fast pass failed. Attempting slow pass...`);
  resolved = await resolveWithTimeout(candidates, healthPath, SLOW_TIMEOUT_MS, serviceName);
  if (resolved) {
    console.log(
      `[Service Discovery: ${serviceName}] Bound to fallback backend (Slow Pass): ${resolved}`
    );
    return resolved;
  }

  // 4. Offline mode / Complete failure fallback
  console.log(
    `[Service Discovery: ${serviceName}] ALL SERVICE PROBES FAILED! Defaulting to first candidate (${parsedEnvUrl || candidates[0]}) to allow standard offline failures.`
  );
  return parsedEnvUrl || candidates[0];
};
