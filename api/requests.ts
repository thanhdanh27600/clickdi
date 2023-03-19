import { ForwardRs } from 'pages/api/forward';
import { QR } from 'pages/api/qr';
import { ShortenUrlRs } from 'pages/api/shorten';
import { Stats } from 'pages/api/stats';
import { stringify } from 'querystring';
import { API } from './axios';

export const createShortenUrlRequest = async (url: string) => {
  const rs = await API.get(`/api/shorten?url=${url}`);
  const data = await rs.data;
  return data as ShortenUrlRs;
};

export const getForwardUrl = async ({
  hash,
  userAgent,
  ip,
  fromClientSide,
}: {
  hash: string;
  userAgent?: string;
  ip?: string | null;
  fromClientSide?: boolean;
}) => {
  const rs = await API.post(`/api/forward`, { hash, userAgent, ip, fromClientSide });
  const data = await rs.data;
  return data as ForwardRs;
};

export const getStats = async ({
  hash,
  email,
  password,
  queryCursor,
}: {
  hash: string;
  email?: string;
  password?: string;
  queryCursor?: number;
}) => {
  const q = stringify({
    h: hash,
    ...(email ? { e: email } : null),
    ...(password ? { p: password } : null),
    ...(queryCursor ? { qc: queryCursor } : null),
  });
  const rs = await API.get(`/api/stats?${q}`);
  const data = await rs.data;
  return data as Stats;
};

export const getQr = async (text: string, token: string) => {
  const rs = await API.get(`/api/qr?text=${text}`, {
    headers: {
      'X-Platform-Auth': token,
    },
  });
  const data = await rs.data;
  return data as QR;
};
