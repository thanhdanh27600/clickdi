import fs from 'fs/promises';
import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../services/db/prisma';
import { api } from '../../utils/axios';
import HttpStatusCode from '../../utils/statusCode';

export const handler = api<any>(getBlob, ['GET']);

async function getBlob(req: NextApiRequest, res: NextApiResponse) {
  if (typeof req.query.fileName !== 'string' || !req.query.fileName?.trim().length) {
    return res.status(HttpStatusCode.NOT_FOUND).json({ error: 'File not found' });
  }
  try {
    const file = await prisma.blob.findUnique({
      where: {
        fileName: req.query.fileName as string,
      },
    });

    if (!file) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ error: 'File not found' });
    }

    // Check file exists
    await fs.access(file.uploadPath);

    // Read file
    const fileBuffer = await fs.readFile(file.uploadPath);

    // Create response with file download headers
    res.setHeader('Content-Type', file.fileType || '');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length.toString());
    return res.status(HttpStatusCode.OK).write(fileBuffer);
  } catch (error: any) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({ error: 'Download failed' + error.message });
  }
}
