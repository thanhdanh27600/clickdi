import { redis } from '../../redis';
import { LIMIT_FORWARD_REQUEST, LIMIT_FORWARD_SECOND, REDIS_KEY, getRedisKey } from '../../types/constants';
import { ForwardMeta } from '../../types/forward';

export class ForwardCache {
  async limitFeature(ip: string) {
    // check or reset get request limit
    const curLimit = await this.limitIp(ip);
    if (parseFloat(curLimit) >= LIMIT_FORWARD_REQUEST) return true;
    return false;
  }
  async limitIp(ip: string) {
    const keyLimit = getRedisKey(REDIS_KEY.LIMIT_FORWARD, ip);

    const ttl = await redis.ttl(keyLimit);
    if (ttl < 0) {
      await redis.set(keyLimit, 0);
      await redis.expire(keyLimit, LIMIT_FORWARD_SECOND);
    }
    const curLimit = (await redis.get(keyLimit)) || '';
    return curLimit;
  }
  async incLimitIp(ip: string) {
    const keyLimit = getRedisKey(REDIS_KEY.LIMIT_FORWARD, ip);
    await redis.incr(keyLimit);
  }
  async postForwardHash(forward: ForwardMeta) {
    const hashKey = REDIS_KEY.LIST_FORWARD;
    await redis.rpush(hashKey, JSON.stringify(forward));
  }
}

export const forwardCacheService = new ForwardCache();
