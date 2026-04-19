describe('apiProvider', () => {
  const ORIGINAL_ENV = process.env;
  const loadApiProviderModule = () =>
    jest.requireActual(
      '@gamelog/api-manager/apiProvider'
    ) as typeof import('@gamelog/api-manager/apiProvider');

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('initializes provider as backend when EXPO_PUBLIC_API_PROVIDER is backend', () => {
    process.env.EXPO_PUBLIC_API_PROVIDER = 'backend';
    const { getApiProvider } = loadApiProviderModule();

    expect(getApiProvider()).toBe('backend');
  });

  it('initializes provider as steam when EXPO_PUBLIC_API_PROVIDER is missing', () => {
    delete process.env.EXPO_PUBLIC_API_PROVIDER;
    const { getApiProvider } = loadApiProviderModule();

    expect(getApiProvider()).toBe('steam');
  });

  it('initializes provider as steam for unsupported value', () => {
    process.env.EXPO_PUBLIC_API_PROVIDER = 'unsupported';
    const { getApiProvider } = loadApiProviderModule();

    expect(getApiProvider()).toBe('steam');
  });

  it('setApiProvider updates provider at runtime', () => {
    process.env.EXPO_PUBLIC_API_PROVIDER = 'steam';
    const { getApiProvider, setApiProvider } = loadApiProviderModule();

    expect(getApiProvider()).toBe('steam');
    setApiProvider('backend');
    expect(getApiProvider()).toBe('backend');
  });
});
