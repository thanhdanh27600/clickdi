import { shorten } from 'controllers';
import { allowCors } from '../../../requests/api';

export default allowCors(shorten.handler);
