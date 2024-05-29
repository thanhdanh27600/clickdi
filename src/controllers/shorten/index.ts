import requestIp from 'request-ip';
import { shortenCacheService } from '../../services/cache/shorten.service';
import prisma from '../../services/db/prisma';
import { generateHash } from '../../services/hash';
import { recordService } from '../../services/record';
import { shortenService } from '../../services/shorten';
import { RESERVED_HASH } from '../../types/constants';
import { ShortenUrl } from '../../types/shorten';
import { api, badRequest, successHandler } from '../../utils/axios';
import { decrypt, decryptS } from '../../utils/crypto';
import HttpStatusCode from '../../utils/statusCode';
import { validateShortenSchema } from '../../utils/validateMiddleware';

const messageNotFound = "No URL was found on your request. Let's shorten one!";

export const handler = api<ShortenUrl>(
  async (req, res) => {
    const ip = requestIp.getClientIp(req) || '';
    let url = (req.query.url as string) || null;
    url = decrypt(decodeURIComponent(url || ''));
    let customHash = (req.query.customHash as string) || null;
    let hash = (req.query.hash as string) || null;

    if (!url && !hash) {
      return res.status(HttpStatusCode.BAD_REQUEST).send({
        errorMessage: 'Wrong shorten format, please try again',
        errorCode: 'INVALID_URL',
      });
    }
    await validateShortenSchema.parseAsync({
      query: { url: url || null, hash, ip, customHash },
    });

    // if hash then retrieve from cache & db
    if (hash) {
      const history = await shortenService.getShortenHistory(hash);
      if (!history) return badRequest(res, messageNotFound);
      if (!!history.password) {
        const token = req.headers['X-Platform-Auth'.toLowerCase()] as string;
        if (!token || decryptS(token) !== history.id.toString()) {
          return badRequest(res, messageNotFound);
        }
      }
      return successHandler(res, history);
    }
    // check or reset get request limit
    const reachedFeatureLimit = await shortenCacheService.limitFeature(ip);
    if (reachedFeatureLimit) {
      return res.status(HttpStatusCode.TOO_MANY_REQUESTS).send({
        errorMessage: 'EXCEEDED_SHORT',
        errorCode: 'UNAUTHORIZED',
      });
    }
    shortenCacheService.incLimitIp(ip);

    // use custom hash or create
    let shortHash = !!req.session ? customHash : null;
    if (!shortHash) shortHash = await generateHash('shorten');
    if (RESERVED_HASH.has(shortHash)) {
      return res.status(HttpStatusCode.BAD_REQUEST).send({
        errorMessage: 'Wrong shorten format, please try again',
        errorCode: 'INVALID_URL',
      });
    }

    let socialMetaTags = {} as Record<string, string>;

    // if (!checkDownloadLink(url)) {
    //   // extract og metas
    //   let htmlString = '';
    //   try {
    //     const config: AxiosRequestConfig<string> = {
    //       url,
    //       method: 'options',
    //       responseType: 'json',
    //       timeout: 1000,
    //     };

    //     htmlString = (await axios(config)).data;
    //     console.log('htmlString', htmlString);
    //   } catch (error) {}

    //   const baseUrl = extractBaseUrl(url);
    //   socialMetaTags = extractOgMetaTags(htmlString, baseUrl);
    // }

    // write to db
    const record = await recordService.getOrCreate(req, ip);

    try {
      const history = await prisma.urlShortenerHistory.create({
        data: {
          url,
          ogTitle: socialMetaTags.title,
          ogDescription: socialMetaTags.description,
          ogImgSrc: socialMetaTags.image,
          hash: shortHash,
          urlShortenerRecordId: record.id,
          email: req.session?.user?.email,
        },
      });
      // write to cache
      shortenCacheService.postShortenHash(history);
      return successHandler(res, history);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
          errorMessage: 'EXIST_HASH',
          errorCode: 'INVALID_URL',
        });
      }
      throw error;
    }
  },
  ['GET'],
);

export * as update from './update';
