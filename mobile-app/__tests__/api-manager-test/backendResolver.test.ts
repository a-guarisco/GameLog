import { clearCachedBackendUrl, resolveBackendUrl } from '../../src/api-manager/backendResolver';
import * as serviceDiscovery from '../../src/api-manager/serviceDiscovery';

describe('backendResolver', () => {
  const originalEnv = process.env;
  let mockResolveServiceUrl: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(process.env, originalEnv);
    delete process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
    delete process.env.EXPO_PUBLIC_IS_DEV;
    clearCachedBackendUrl();
    mockResolveServiceUrl = jest
      .spyOn(serviceDiscovery, 'resolveServiceUrl')
      .mockResolvedValue('http://localhost:8000');
  });

  afterAll(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('resolves the backend using environment configuration', async () => {
    Object.assign(process.env, {
      EXPO_PUBLIC_BACKEND_BASE_URL: 'http://backend.example.com',
      EXPO_PUBLIC_IS_DEV: 'true',
    });
    mockResolveServiceUrl.mockResolvedValue('http://backend.example.com');

    await expect(resolveBackendUrl()).resolves.toBe('http://backend.example.com');
    expect(mockResolveServiceUrl).toHaveBeenCalledWith(
      'http://backend.example.com',
      'Backend',
      8000,
      '/health',
      true
    );
  });

  it('caches the resolved backend URL', async () => {
    mockResolveServiceUrl.mockResolvedValue('http://localhost:8000');

    await resolveBackendUrl();
    await resolveBackendUrl();

    expect(mockResolveServiceUrl).toHaveBeenCalledTimes(1);
  });

  it('clears the cached backend URL before resolving again', async () => {
    mockResolveServiceUrl
      .mockResolvedValueOnce('http://localhost:8000')
      .mockResolvedValueOnce('http://localhost:8001');

    await expect(resolveBackendUrl()).resolves.toBe('http://localhost:8000');
    clearCachedBackendUrl();
    await expect(resolveBackendUrl()).resolves.toBe('http://localhost:8001');

    expect(mockResolveServiceUrl).toHaveBeenCalledTimes(2);
  });

  it('passes production mode when the development flag is not true', async () => {
    process.env.EXPO_PUBLIC_BACKEND_BASE_URL = 'https://api.example.com';
    delete process.env.EXPO_PUBLIC_IS_DEV;
    mockResolveServiceUrl.mockResolvedValue('https://api.example.com');

    await resolveBackendUrl();

    expect(mockResolveServiceUrl).toHaveBeenCalledWith(
      'https://api.example.com',
      'Backend',
      8000,
      '/health',
      false
    );
  });
});
