import { clone, isEmpty } from 'ramda';
import { redis } from '../redis';
import { shortenCacheService } from '../services/cache';
import { forwardCacheService } from '../services/cache/forward.service';
import { sendMessageToRabbitQueue } from '../services/queue/rabbit';
import { shortenService } from '../services/shorten';
import { REDIS_KEY, getRedisKey } from '../types/constants';
import { Forward, ForwardMeta } from '../types/forward';
import { ipLookup } from '../utils/agent';
import { api, badRequest, successHandler } from '../utils/axios';
import { encryptS } from '../utils/crypto';
import HttpStatusCode from '../utils/statusCode';
import { validateForwardSchema } from '../utils/validateMiddleware';

export const handler = api<Forward>(
  async (req, res) => {
    const hash = req.body.hash as string;
    const userAgent = req.body.userAgent as string;
    const ip = req.body.ip as string;
    const fromClientSide = !!req.body.fromClientSide;
    const token = req.headers['X-Platform-Auth'.toLowerCase()] as string;

    await validateForwardSchema.parseAsync({
      hash,
      userAgent,
      ip,
      fromClientSide,
    });

    const reachedFeatureLimit = await forwardCacheService.limitFeature(ip);
    if (reachedFeatureLimit) {
      return res.status(HttpStatusCode.TOO_MANY_REQUESTS).send({
        errorMessage: 'EXCEEDED_FORWARD',
        errorCode: 'UNAUTHORIZED',
      });
    }
    forwardCacheService.incLimitIp(ip);

    const lookupIp = ipLookup(ip) || undefined;
    const data: ForwardMeta = {
      hash,
      ip,
      userAgent,
      fromClientSide,
      countryCode: lookupIp?.country || '',
      updatedAt: new Date(),
    };

    let valid = false;
    // Check from Cache
    const hashKey = getRedisKey(REDIS_KEY.MAP_SHORTEN_BY_HASH, hash);
    const shortenedUrlCache = (await redis.hgetall(hashKey)) as any;
    if (!isEmpty(shortenedUrlCache)) {
      // cache hit
      valid = shortenService.verifyToken(shortenedUrlCache, token);
      if (!valid) return res.send({ errorCode: HttpStatusCode.UNAUTHORIZED, errorMessage: 'UNAUTHORIZED' });
      sendMessageToRabbitQueue({ subject: 'forward', body: data });
      // sendMessageToQueue([{ subject: 'forward', body: data }]);
      return successHandler(res, { history: shortenedUrlCache, token: encryptS(shortenedUrlCache.id.toString()) });
    }
    // cache missed, fetch and write back to cache
    // Check from DB
    const history = await shortenService.getShortenHistory(hash);
    if (!history) {
      return badRequest(res);
    }
    valid = shortenService.verifyToken(history, token);
    if (!valid) return res.send({ errorCode: HttpStatusCode.UNAUTHORIZED, errorMessage: 'UNAUTHORIZED' });

    sendMessageToRabbitQueue({ subject: 'forward', body: data });
    shortenCacheService.postShortenHash(clone(history));

    if (history?.email) history.email = '';
    if (history?.password) history.password = '';
    return successHandler(res, { history, token: encryptS(history.id.toString()) });
  },
  ['POST'],
);
