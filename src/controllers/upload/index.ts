import formidable from 'formidable';
import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import requestIp from 'request-ip';
import prisma from '../../services/db/prisma';
import { isLocal, LIMIT_FILE_UPLOAD } from '../../types/constants';
import { api, successHandler } from '../../utils/axios';
import HttpStatusCode from '../../utils/statusCode';
import { generateFileName } from '../../utils/text';

// File validation function
function validateFile(file: formidable.File): boolean {
  // const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  return (file.size || 0) <= LIMIT_FILE_UPLOAD;
}

export const handler = api<any>(
  async (req, res) => {
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
          blob: isLocal ? blob : undefined,
        });
      } catch (error: any) {
        return res.status(HttpStatusCode.BAD_GATEWAY).json({ error: 'File upload failed ' + error?.message });
      }
    });
  },
  ['POST'],
);
