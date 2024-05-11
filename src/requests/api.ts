import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { BASE_URL, brandUrl, brandUrlShort, localUrlShort } from '../types/constants';

export const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    ...withAuth(),
  },
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    // server reponse error
    if (err.response?.data?.errorMessage) throw new Error(err.response.data.errorMessage);
    // internal error
    throw new Error(err);
  },
);

export function withAuth(token?: string) {
  const tokenLocal = global.window ? global.window.localStorage.getItem('quickshare-token') : undefined;
  return {
    'X-Platform-Auth': token || tokenLocal,
  };
}

const allowedOrigins = [brandUrl, localUrlShort, brandUrlShort];

export const allowCors = (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
  const origin = req.headers?.origin;
  if (!!origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    // res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Platform-Auth, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await handler(req, res);
};
