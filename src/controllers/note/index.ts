import base64url from 'base64url';
import { NextApiHandler } from 'next';
import requestIp from 'request-ip';
import prisma from '../../db/prisma';
import { redis } from '../../redis/client';
import { noteCacheService, shortenCacheService } from '../../services/cacheServices';
import { BASE_URL, HASH, LIMIT_FEATURE_HOUR, LIMIT_NOTE_REQUEST, REDIS_KEY, getRedisKey } from '../../types/constants';
import { NoteRs } from '../../types/note';
import { api, badRequest, successHandler } from '../../utils/axios';
import HttpStatusCode from '../../utils/statusCode';
import { generateRandomString } from '../../utils/text';
import { validateNoteSchema } from '../../utils/validateMiddleware';

export const handler = api<NoteRs>(
  async (req, res) => {
    const ip = requestIp.getClientIp(req)!;
    let text = (req.body.text as string) || null;
    let hash = (req.query.hash as string) || null;
    let uid = (req.body.uid as string) || null;

    // retrive note for update if uid
    if (!!uid && req.method === 'POST') return await getNoteForUpdate(req, res);
    // retrive note for view if hash
    if (!!hash && req.method === 'GET') return await getNote(req, res);

    await validateNoteSchema.parseAsync({ text, hash, ip, uid });

    if (!text) {
      return res.status(HttpStatusCode.BAD_REQUEST).send({
        errorMessage: 'Wrong note format, please try again',
        errorCode: 'INVALID_NOTE',
      });
    }
    // check or reset get request limit
    const reachedFeatureLimit = await noteCacheService.limitFeature(ip);
    if (reachedFeatureLimit) {
      return res.status(HttpStatusCode.TOO_MANY_REQUESTS).send({
        errorMessage: `Exceeded ${LIMIT_NOTE_REQUEST} notes, please comeback after ${LIMIT_FEATURE_HOUR} hours.`,
        errorCode: 'UNAUTHORIZED',
      });
    }
    noteCacheService.incLimitIp(ip);

    let record = await prisma.urlShortenerRecord.findFirst({ where: { ip } });
    if (!record) record = await prisma.urlShortenerRecord.create({ data: { ip } });

    // generate hash
    let noteHash = '';
    let isExist = 1;
    let timesLimit = 0;

    const logger = require('../../utils/loggerServer');
    while (isExist) {
      if (timesLimit > 0) {
        logger.warn('timesLimit note occured', timesLimit);
      }
      if (timesLimit++ > 10 /** U better buy lucky ticket */) {
        logger.error('timesLimit note reached', timesLimit);
        throw new Error('Bad request after digging our hash, please try again!');
      }
      noteHash = generateRandomString(HASH.Length);
      isExist = await noteCacheService.existHash(noteHash);
      // also double check db if not collapse in cache
      if (!isExist) {
        isExist = !!(await prisma.note.findUnique({ where: { hash: noteHash } })) ? 1 : 0;
      }
    }

    const time = `${new Date().getTime()}`;
    // 12 chars : ex. time = 1694179884653 -> base64url('884653xxx') -> 12 chars
    const targetUid = `${base64url(time.slice(10 - HASH.Length) + noteHash)}`;

    // write hash to cache
    const dataHashNote = ['text', text, 'uid', uid, 'updatedAt', new Date().getTime()];
    await noteCacheService.postNoteHash({ hash: noteHash, data: dataHashNote });

    // create shorten url
    // generate hash
    let shortHash = '';
    isExist = 1;
    timesLimit = 0;
    while (isExist) {
      if (timesLimit > 0) {
        logger.warn('timesLimit shorten occured', timesLimit);
      }
      if (timesLimit++ > 10 /** U better buy lucky ticket */) {
        logger.error('timesLimit shorten reached', timesLimit);
        throw new Error('Bad request after digging our hash, please try again!');
      }
      shortHash = generateRandomString(HASH.Length);
      isExist = await shortenCacheService.existHash(shortHash);
      // also double check db if not collapse in cache
      if (!isExist) {
        isExist = !!(await prisma.urlShortenerHistory.findUnique({ where: { hash: shortHash } })) ? 1 : 0;
      }
    }
    const history = await prisma.urlShortenerHistory.create({
      data: {
        url: `${BASE_URL}/n/${noteHash}`,
        hash: shortHash,
        urlShortenerRecordId: record.id,
      },
    });

    // write to db
    const note = await prisma.note.create({
      data: {
        hash: noteHash,
        text,
        uid: targetUid,
        urlShortenerRecordId: record.id,
        urlShortenerHistoryId: history.id,
      },
    });

    return successHandler(res, { note: { ...note, UrlShortenerHistory: history } });
  },
  ['POST', 'GET'],
);

const getNote: NextApiHandler<NoteRs> = async (req, res) => {
  let hash = req.query.hash as string;
  if (!hash) return badRequest(res);

  // get from cache
  const hashKey = getRedisKey(REDIS_KEY.MAP_NOTE_BY_HASH, hash);
  const noteCacheText = await redis.hget(hashKey, 'text');
  if (noteCacheText) {
    // cache hit
    return successHandler(res, { note: { text: noteCacheText } });
  }
  // cache missed
  const note = await prisma.note.findUnique({
    where: {
      hash,
    },
  });
  if (!note) return badRequest(res);
  const dataHashNote = ['text', note.text, 'uid', note.uid, 'updatedAt', new Date().getTime()];
  noteCacheService.postNoteHash({ hash, data: dataHashNote });
  return successHandler(res, { note: { text: note.text } });
};

const getNoteForUpdate: NextApiHandler<NoteRs> = async (req, res) => {
  let uid = req.body.uid as string;
  if (!uid) return badRequest(res);
  const note = await prisma.note.findUnique({
    where: {
      uid,
    },
    include: { UrlShortenerHistory: true },
  });

  if (!note) {
    return badRequest(res, "No note was found on your request. Let's create one!");
  }
  // write hash to cache
  return successHandler(res, { note });
};

export * as update from './update';
