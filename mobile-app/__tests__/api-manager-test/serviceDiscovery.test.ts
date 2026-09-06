import { Platform } from 'react-native';
import { DEFAULT_FALLBACK_MAP, resolveServiceUrl } from '../../src/api-manager/serviceDiscovery';

describe('serviceDiscovery', () => {
  const originalPlatform = Platform.OS;
  const originalFetch = global.fetch;
  const originalConsole = {
    log: console.log,
    warn: console.warn,
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    global.fetch = jest.fn();
    console.log = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
    global.fetch = originalFetch;
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
  });

  it('requires an environment URL in production', async () => {
    await expect(resolveServiceUrl('  ', 'Backend', 8000, '/health', false)).rejects.toThrow(
      'Production build requires Backend base URL in environment variables.'
    );
  });

  it('returns the trimmed environment URL in production without probing it', async () => {
    const result = await resolveServiceUrl(
      '  https://api.example.com  ',
      'Backend',
      8000,
      '/health',
      false
    );

    expect(result).toBe('https://api.example.com');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('uses a healthy development environment URL before fallback candidates', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    const result = await resolveServiceUrl(
      ' http://dev.example.com ',
      'Backend',
      8000,
      '/health',
      true
    );

    expect(result).toBe('http://dev.example.com');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://dev.example.com/health',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('falls back when the development environment URL is unhealthy', async () => {
    Platform.OS = 'ios';
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true });

    const result = await resolveServiceUrl(
      'http://unreachable.example.com',
      'Backend',
      8000,
      '/health',
      true
    );

    expect(result).toBe(`${DEFAULT_FALLBACK_MAP.ios[0]}:8000`);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('ENV VALUE FAILED: http://unreachable.example.com')
    );
  });

  it('falls back to the first healthy candidate during the fast pass', async () => {
    Platform.OS = 'ios';
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    const result = await resolveServiceUrl(undefined, 'Backend', 8000, '/health', true);

    expect(result).toBe(`${DEFAULT_FALLBACK_MAP.ios[0]}:8000`);
    expect(global.fetch).toHaveBeenCalledWith(
      `${DEFAULT_FALLBACK_MAP.ios[0]}:8000/health`,
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('selects the first URL when multiple fallback candidates respond', async () => {
    Platform.OS = 'android';
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    const result = await resolveServiceUrl(undefined, 'Backend', 8000, '/health', true);

    expect(result).toBe(`${DEFAULT_FALLBACK_MAP.android[0]}:8000`);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Multiple backends responded')
    );
  });

  it('uses the slow pass after all fast probes fail', async () => {
    Platform.OS = 'ios';
    let requestCount = 0;
    (global.fetch as jest.Mock).mockImplementation(() => {
      requestCount += 1;
      return requestCount === 1
        ? Promise.resolve({ ok: false, status: 503 })
        : Promise.resolve({ ok: true });
    });

    const result = await resolveServiceUrl(undefined, 'Backend', 8000, '/health', true);

    expect(result).toBe(`${DEFAULT_FALLBACK_MAP.ios[0]}:8000`);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('returns the first candidate when all fallback probes fail', async () => {
    Platform.OS = 'web';
    (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));

    const result = await resolveServiceUrl(undefined, 'Backend', 8000, '/health', true);

    expect(result).toBe(`${DEFAULT_FALLBACK_MAP.web[0]}:8000`);
  });

  it('uses the web fallback map for an unknown platform', async () => {
    Platform.OS = 'windows' as typeof Platform.OS;
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    const result = await resolveServiceUrl(undefined, 'Backend', 8000, '/health', true);

    expect(result).toBe(`${DEFAULT_FALLBACK_MAP.web[0]}:8000`);
  });
});
