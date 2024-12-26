import { upload } from 'controllers';
import { cors } from '../../../requests/api';

export default cors(upload.handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
