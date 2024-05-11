import { v2 as cloudinary } from 'cloudinary';
import { api, badRequest, successHandler } from '../utils/axios';

export const handler = api(
  async (req, res) => {
    const { paramsToSign } = req.body;
    if (!process.env.CLOUDINARY_API_SECRET) {
      console.error('Not found CLOUDINARY_API_SECRET');
      return badRequest(res);
    }
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    return successHandler(res, { signature });
  },
  ['POST'],
);
