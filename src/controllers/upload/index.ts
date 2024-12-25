import formidable from 'formidable';
import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next/types';
import path from 'path';
import requestIp from 'request-ip';
import HttpStatusCode from 'utils/statusCode';
import { generateFileName } from 'utils/text';
import prisma from '../../services/db/prisma';
import { isDebug, LIMIT_FILE_UPLOAD } from '../../types/constants';
import { api, successHandler } from '../../utils/axios';

// File validation function
function validateFile(file: formidable.File): boolean {
  // const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  return (file.size || 0) <= LIMIT_FILE_UPLOAD;
}

export const handler = api<any>(
  async (req, res) => {
    console.log('req', req);
    if (req.method === 'GET') return await getBlob(req, res);

    const ip = requestIp.getClientIp(req)!;

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Parse form data
    const form = formidable({
      uploadDir,
      maxFileSize: LIMIT_FILE_UPLOAD,
    });

    await form.parse(req, async (err, fields, files) => {
      if (err) {
        return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
      }

      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

      // Validate file
      if (!uploadedFile || !validateFile(uploadedFile)) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({ error: 'Invalid file type or size' });
      }

      // Generate unique filename
      const originalName = uploadedFile.originalFilename || '';
      // const fileExtension = path.extname(originalName);
      const uniqueFileName = generateFileName(originalName);
      const newPath = path.join(uploadDir, uniqueFileName);
      try {
        // Move file
        await fs.rename(uploadedFile.filepath, newPath);

        const blob = await prisma.blob.create({
          data: {
            originalName,
            fileName: uniqueFileName,
            fileSize: uploadedFile.size,
            fileType: uploadedFile.mimetype,
            uploadPath: newPath,
            ip,
          },
        });
        return successHandler(res, {
          filename: uniqueFileName,
          blob: isDebug ? blob : undefined,
        });
      } catch (error: any) {
        return res.status(HttpStatusCode.BAD_GATEWAY).json({ error: 'File upload failed ' + error?.message });
      }
    });
  },
  ['GET', 'POST'],
);

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
