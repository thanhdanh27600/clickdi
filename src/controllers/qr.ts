import { QR } from '../types/qr';
import { api, errorHandler } from '../utils/axios';
import { decrypt } from '../utils/crypto';
import HttpStatusCode from '../utils/statusCode';
import { validateQrSchema } from '../utils/validateMiddleware';

export const handler = api<QR>(
  async (req, res) => {
    await validateQrSchema.parseAsync({
      query: req.query,
    });
    const text = req.query.text as string;
    const token = req.headers['X-Platform-Auth'.toLowerCase()] as string;
    const decrypted = decrypt(token);
    if (!decrypted) {
      return errorHandler(res);
    }
    const QRCode = require('qrcode');
    let qr = '';
    qr = await QRCode.toDataURL(text, { width: 300, margin: 1 });
    return res.status(HttpStatusCode.OK).json({ qr });
  },
  ['GET'],
);
