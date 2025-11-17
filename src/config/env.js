
// SINGLE SWITCH: change this to 'production' | 'testing' | 'development'

const FALLBACK_ENV = 'production';

const CONFIG = {
  production: {
    API_HOST: 'https://menu4.xyz',
    WS_URL: 'wss://menu4.xyz/v2/common/ws',
  },
  testing: {
    API_HOST: 'https://ghanish.in',
    WS_URL: 'wss://ghanish.in/v2/common/ws',
  },
  development: {
    API_HOST: 'https://men4u.xyz',
    WS_URL: 'wss://men4u.xyz/v2/common/ws',
  },
};

const resolveEnvKey = () => {
  const fromVite = import.meta?.env?.VITE_APP_ENV;
  if (fromVite && CONFIG[fromVite]) {
    return fromVite;
  }
  return FALLBACK_ENV;
};

const CURRENT_ENV = resolveEnvKey();

const { API_HOST, WS_URL } = CONFIG[CURRENT_ENV];

const V2_COMMON_BASE = `${API_HOST}/v2/common`;
const COMMON_API_BASE = `${API_HOST}/common_api`;

export const ENV = {
  env: CURRENT_ENV,
  API_HOST,
  WS_URL,
  V2_COMMON_BASE,
  COMMON_API_BASE,
};

export default ENV;
