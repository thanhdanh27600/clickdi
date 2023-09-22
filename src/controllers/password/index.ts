import { Note, UrlShortenerHistory } from '@prisma/client';
import prisma from '../../db/prisma';
import { shortenService } from '../../services/shorten';
import { api, badRequest } from '../../utils/axios';
import { encryptS } from '../../utils/crypto';
import { validatePasswordSchema } from '../../utils/validateMiddleware';

export const handler = api(
  async (req, res) => {
    const hash = req.body.hash as string;
    const email = req.body.email as string;
    const password = req.body.password as string;

    await validatePasswordSchema.parseAsync({ hash, email, password });
    let history = (await shortenService.getShortenHistory(hash, { include: { Note: true } })) as UrlShortenerHistory & {
      Note: Note;
    };

    if (!history) return badRequest(res);
    if (!!history.password) return badRequest(res);
    const encryptPassword = encryptS(password);
    await Promise.all([
      prisma.urlShortenerHistory.update({
        where: { hash },
        data: {
          password: encryptPassword,
          email,
        },
      }),
      ...(history.Note?.id
        ? [
            prisma.note.update({
              where: { id: history.Note?.id },
              data: {
                password: encryptPassword,
                email,
              },
            }),
          ]
        : []),
    ]);
    res.send('OK');
  },
  ['POST'],
);

export * as verify from './verify';
