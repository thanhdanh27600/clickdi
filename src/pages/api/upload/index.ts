import { upload } from 'controllers';

export default upload.handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
