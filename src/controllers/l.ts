import requestIp from 'request-ip';
import { ipLookup } from '../utils/agent';
import { api } from '../utils/axios';

export const handler = api(
  async (req, res) => {
    const ip = requestIp.getClientIp(req) || '';
    const lookupIp = ipLookup(ip) || undefined;
    return res.send({ country: lookupIp?.country || '' });
  },
  ['POST'],
);
