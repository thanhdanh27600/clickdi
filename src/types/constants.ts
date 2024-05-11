export const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';
export const isLocal = process.env.NEXT_PUBLIC_BUILD_ENV === 'local';
export const isUAT = process.env.NEXT_PUBLIC_BUILD_ENV === 'uat';
export const isProduction = process.env.NEXT_PUBLIC_BUILD_ENV === 'production';
export const localUrl = 'http://localhost:5050';
export const localUrlShort = 'http://localhost:5001';
export const brandUrl = 'https://quickshare.at';
export const brandUrlShort = 'https://qsh.at';
export const brandUrlUat = 'https://uat.quickshare.at';
export const brandUrlShortUat = 'https://uat.qsh.at';
export const alternativeUrls = ['https://mirror.quickshare.at', 'https://mirror.qsh.at'];

export const brandUrlShortDomain = 'qsh.at';
export const isTest = process.env.NODE_ENV === 'test';
export const cdnUrl = 'https://cdn.jsdelivr.net/gh/thanhdanh27600/quickshare@production/public';
export const GOOGLE_ADS_CLIENT_ID = 'ca-pub-5833291778924123';
export const cdn = (file: string) => `${isProduction ? cdnUrl : ''}${file}`;
export const isShortDomain = process.env.NEXT_PUBLIC_SHORT_DOMAIN === 'true';
export const allowedDomains = isProduction ? [brandUrl, brandUrlShort] : [localUrl, brandUrl, brandUrlShort];
export const Window = () => ('object' === typeof window && window ? (window as any) : undefined);

export const LIMIT_FEATURE_HOUR = 1;
export const LIMIT_FEATURE_SECOND = LIMIT_FEATURE_HOUR * 3600;
// export const LIMIT_TOKEN_MILLISECOND = isProduction ? 3600e3 : 60e3;
export const LIMIT_SHORTENED_HOUR = 168; // 7 days
export const LIMIT_SHORTENED_SECOND = LIMIT_SHORTENED_HOUR * 3600;
export const LIMIT_SHORTEN_REQUEST = isProduction ? 5 : 10;
export const LIMIT_NOTE_HOUR = 168; // 7 days
export const LIMIT_NOTE_SECOND = LIMIT_NOTE_HOUR * 3600;
export const LIMIT_NOTE_REQUEST = 5;
export const LIMIT_FILE_REQUEST = 10;
export const LIMIT_FILE_HOUR = 168; // 7 days
export const LIMIT_FILE_SECOND = LIMIT_FILE_HOUR * 3600;
export const LIMIT_FORWARD_HOUR = isProduction ? 0.5 : 0.005; // 30mins
export const LIMIT_FORWARD_SECOND = LIMIT_FORWARD_HOUR * 3600;
export const LIMIT_FORWARD_REQUEST = isProduction ? 200 : 10;
export const LIMIT_RECENT_HISTORY = 5;
export const LIMIT_OG_TITLE_LENGTH = 200;
export const LIMIT_NOTE_TITLE_LENGTH = 200;
export const LIMIT_OG_DESCRIPTION_LENGTH = 500;
export const OG_IMAGE_DIMENSION = '1200 x 630';
export const LIMIT_FILE_UPLOAD = 20 * 1024 * 1024; // 20MB
export const RESERVED_HASH = new Set(['qsh', 'xxx', '---', '___', '-_-', '_-_', '__-', '-__', '--_', '_--']);

export const HASH = {
  Regex: /^.{3}$/,
  Length: 3,
};
export const HASH_CUSTOM = {
  Regex: /^[a-zA-Z0-9_-]{3,}$/,
  MaxLength: 30,
} as const;

export const baseUrl = (useShortDomain: boolean = false) => {
  if (isProduction) {
    return useShortDomain ? brandUrlShort : brandUrl;
  }
  if (isUAT) {
    return useShortDomain ? brandUrlShortUat : brandUrlUat;
  }
  return typeof location === 'object' && !location.hostname.includes('localhost')
    ? `${location.protocol}//` + location.hostname + (location.port ? ':' + location.port : '')
    : useShortDomain
    ? localUrlShort
    : localUrl;
};
export const BASE_URL = baseUrl();
export const BASE_URL_SHORT = baseUrl(true);
export const BASE_URL_OG = !isLocal ? 'https://og.quickshare.at' : 'http://localhost:7071';
export const REDIS_KEY = {
  LIMIT_SHORTEN: 'limitShort',
  LIMIT_FORWARD: 'limitForward',
  LIMIT_NOTE: 'limitNote',
  LIMIT_FILE: 'limitFile',
  MAP_SHORTEN_BY_HASH: 'hShort',
  MAP_NOTE_BY_HASH: 'hNote',
  MAP_FILE_BY_HASH: 'hFile',
  OG_BY_HASH: 'og',
} as const;
type RedisKeys = keyof typeof REDIS_KEY;
type RedisKeyValues = (typeof REDIS_KEY)[RedisKeys];

export const getRedisKey = (key: RedisKeyValues, value: string) => {
  return `${key}:${value}`;
};

export const MIX_PANEL_TOKEN = process.env.NEXT_PUBLIC_MIX_PANEL_TOKEN;
export const PLATFORM_AUTH = process.env.NEXT_PUBLIC_PLATFORM_AUTH;
export const SERVER_AUTH = process.env.SERVER_AUTH;
export const TE = () => Window()?.te;
export const tinymce = (Window() as any)?.tinymce;
