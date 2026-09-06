import { resolveServiceUrl } from './serviceDiscovery';

let cachedResolvedUrl: string | null = null;

export const resolveBackendUrl = async (): Promise<string> => {
  if (cachedResolvedUrl) {
    return cachedResolvedUrl;
  }

  const isDev = process.env.EXPO_PUBLIC_IS_DEV === 'true';

  cachedResolvedUrl = await resolveServiceUrl(
    process.env.EXPO_PUBLIC_BACKEND_BASE_URL,
    'Backend',
    8000,
    '/health',
    isDev
  );

  return cachedResolvedUrl;
};
