export type ApiProvider = 'steam' | 'backend';

const API_PROVIDER = (process.env.EXPO_PUBLIC_API_PROVIDER ?? 'steam').toLowerCase();

let currentApiProvider: ApiProvider = API_PROVIDER === 'backend' ? 'backend' : 'steam';

export const setApiProvider = (provider: ApiProvider): void => {
  currentApiProvider = provider;
};

export const getApiProvider = (): ApiProvider => currentApiProvider;
